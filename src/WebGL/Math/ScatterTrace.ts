import * as React from 'react'
import * as THREE from 'three'
import { Boundaries, VectorLike } from '../../Interfaces'
// @ts-ignore
import Test from '../../Assets/square_white.png'
import { OrthographicCamera } from 'three'

const HOVER_SCALE = 1.35

const fragment = `
precision mediump float;

uniform sampler2D atlas;

uniform float spritesPerRow;
uniform float spritesPerColumn;

varying vec3 vColor;
varying float vType;
varying float vShow;
varying float vSelected;
varying float vOpacity;

void main() {
    if (vShow != 0.0) {
      discard;
    }

    float xs = 1.0 / spritesPerRow;
    float xy = 1.0 / spritesPerColumn;

    float r = float(int(vType) / int(spritesPerRow)) * xy;
    float c = mod(vType, spritesPerRow) * xs;
    
    // gl_FragColor = gl_FragColor * texture2D(atlas, gl_PointCoord);
    gl_FragColor = vec4(vColor, 1.0) * texture2D(atlas, gl_PointCoord * vec2(xs, xy) + vec2(c, r));
    gl_FragColor.a *= vOpacity;

    //if (vSelected > 0.5) {
    //vec4 border = texture2D(atlas, vec2(vType * 0.25, 0.5) + gl_PointCoord * 0.25);
    //gl_FragColor = mix(gl_FragColor, border, border.a);
    //}
}
`

const vertex = `
// Vertex shader of the particle mesh.
uniform float frameTime;
uniform float baseSize;

// Attributes of point sprites
attribute float size;
attribute vec3 col;
attribute float type;
attribute float show;
attribute float selected;
attribute float opacity;

attribute vec3 position2;

// Varying of point sprites
varying vec3 vColor;
varying float vType;
varying float vShow;
varying float vSelected;
varying float vOpacity;

float map(float s, float  a1, float  a2, float  b1, float  b2)
{
    return b1 + (s - a1) * (b2 - b1) / (a2 - a1);
}

void main() {
    vColor = col;
    vType = type;
    vShow = show;
    vSelected = selected;
    vOpacity = opacity;

    gl_PointSize = size * baseSize;
    
    //gl_Position = projectionMatrix * vec4(position.x, position.y, 0.0, 1.0);
    gl_Position = projectionMatrix * mix(vec4(position2.x, position2.y, 0.0, 1.0), vec4(position.x, position.y, 0.0, 1.0), frameTime);
    gl_Position.z = 0.0;
}
`

export class ScatterTrace {
  n: number

  scene!: THREE.Scene

  camera!: THREE.OrthographicCamera

  geometry!: THREE.BufferGeometry

  material!: THREE.ShaderMaterial

  // Attributes
  sizeAttribute: THREE.Float32BufferAttribute

  colorAttribute: THREE.Float32BufferAttribute

  selectedAttribute: THREE.Float32BufferAttribute

  opacityAttribute: THREE.Float32BufferAttribute

  typeAttribute: THREE.Float32BufferAttribute

  showAttribute: THREE.Float32BufferAttribute

  positionAttribute: THREE.Float32BufferAttribute

  position2Attribute: THREE.Float32BufferAttribute

  hover: number = null

  bounds: Boundaries

  dirty: boolean = true

  interpolationTimer: number

  onDirty: () => void

  createFakeTexture() {
    const width = 512
    const height = 512

    const size = width * height
    const data = new Uint8Array(4 * size)
    const color = new THREE.Color(0xff0000)

    const r = Math.floor(color.r * 255)
    const g = Math.floor(color.g * 255)
    const b = Math.floor(color.b * 255)

    for (let i = 0; i < size; i++) {
      const stride = i * 4

      data[stride] = r
      data[stride + 1] = g
      data[stride + 2] = b
      data[stride + 3] = 255
    }

    const texture = new THREE.DataTexture(data, width, height)

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        spritesPerRow: { value: 2 },
        spritesPerColumn: { value: 2 },
        baseSize: { value: 20 },
        atlas: {
          value: texture,
        },
        frameTime: { value: 1 },
      },
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
      depthTest: true,
      depthWrite: true,
    })

    this.material.blending = THREE.NormalBlending 
    // used the buffer to create a DataTexture

    texture.needsUpdate = true
  }

  markAsDirty() {
    if (!this.dirty && this.onDirty) {
      this.dirty = true
      this.onDirty()
    }
  }

  constructor(n: number) {
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-50, 50, 150, -150, 0, 1000)
    //this.camera = new THREE.Camera();
    this.n = n

    this.createFakeTexture()

    new THREE.ImageBitmapLoader().load(
      Test,
      (bitmap) => {
        const texture2 = new THREE.CanvasTexture(bitmap)
        this.material.uniforms.atlas.value = texture2
        this.material.needsUpdate = true
      },
      undefined,
      () => {
        console.log('error')
      }
    )

    this.geometry = new THREE.BufferGeometry()

    const points = new THREE.Points(this.geometry, this.material)
    points.frustumCulled = false

    this.scene.add(points)
  }

  initInterpolation() {
    this.material.uniforms.frameTime = { value: 0 }
    this.markAsDirty()
    this.interpolationTimer = performance.now()
  }

  updateBounds(
    xdomain: number[],
    ydomain: number[],
    zoom: { tx: number; ty: number; s: number },
    width: number,
    height: number,
    bounds: Boundaries
  ) {
    const extent = bounds.maxX - bounds.minX
    const baseK = width / extent

    this.camera = new OrthographicCamera(
      width / -2,
      width / 2,
      height / -2,
      height / 2,
      -1,
      1
    )

    this.camera.position.setX((zoom.tx - width / 2) / (baseK * zoom.s))
    this.camera.position.setY((zoom.ty - height / 2) / (baseK * zoom.s))
    //this.camera.position.setY(zoom.ty / 30);
    this.camera.zoom = baseK * zoom.s

    //this.camera.zoom = zoom.s;
    this.camera = new OrthographicCamera(
      xdomain[0],
      xdomain[1],
      ydomain[0],
      ydomain[1],
      -1,
      1
    )
    this.camera.frustumCulled = false

    this.camera.updateProjectionMatrix()
  }

  /**
   * Hovers an element in the scatter visualization
   *
   * @param index the index of the element to hover
   */
  setHover(index: number) {
    if (this.hover === index) {
      return
    }

    if (this.hover !== null) {
      this.sizeAttribute.setX(
        this.hover,
        this.sizeAttribute.getX(this.hover) / HOVER_SCALE
      )

      this.colorAttribute.setXYZ(
        this.hover,
        this.colorAttribute.getX(this.hover) / HOVER_SCALE,
        this.colorAttribute.getY(this.hover) / HOVER_SCALE,
        this.colorAttribute.getZ(this.hover) / HOVER_SCALE
      )
    }

    this.hover = index

    if (this.hover !== null) {
      this.sizeAttribute.setX(
        this.hover,
        this.sizeAttribute.getX(this.hover) * HOVER_SCALE
      )

      this.colorAttribute.setXYZ(
        this.hover,
        this.colorAttribute.getX(this.hover) * HOVER_SCALE,
        this.colorAttribute.getY(this.hover) * HOVER_SCALE,
        this.colorAttribute.getZ(this.hover) * HOVER_SCALE
      )
    }

    this.sizeAttribute.needsUpdate = true
    this.colorAttribute.needsUpdate = true
    this.positionAttribute.needsUpdate = true

    this.markAsDirty()
  }

  setX(value: number | number[]) {
    const attribute = this.positionAttribute

    for (let i = 0; i < this.n; i++) {
      this.position2Attribute.setX(i, this.positionAttribute.getX(i))
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < this.n; i++) {
        attribute.setX(i, value[i])
      }
    } else {
      for (let i = 0; i < this.n; i++) {
        attribute.setX(i, value)
      }
    }

    this.initInterpolation()
    this.positionAttribute.needsUpdate = true
    this.markAsDirty()
  }

  setZ(value: number | number[]) {
    const attribute = this.positionAttribute

    for (let i = 0; i < this.n; i++) {
      this.position2Attribute.setZ(i, this.positionAttribute.getZ(i))
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < this.n; i++) {
        attribute.setZ(i, value[i])
      }
    } else {
      for (let i = 0; i < this.n; i++) {
        attribute.setZ(i, value)
      }
    }

    this.positionAttribute.needsUpdate = true
    this.markAsDirty()
  }

  setY(value: number | number[]) {
    const attribute = this.positionAttribute

    for (let i = 0; i < this.n; i++) {
      this.position2Attribute.setY(i, this.positionAttribute.getY(i))
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < this.n; i++) {
        attribute.setY(i, value[i])
      }
    } else {
      for (let i = 0; i < this.n; i++) {
        attribute.setY(i, value)
      }
    }

    this.initInterpolation()
    this.positionAttribute.needsUpdate = true
    this.markAsDirty()
  }

  invalidateOldFrame() {
    this.position2Attribute = this.positionAttribute.clone()
    this.geometry.setAttribute('position2', this.position2Attribute)
  }

  setSize(value: number | number[]) {
    this.sizeAttribute.array = Array.isArray(value)
      ? new Float32Array(value)
      : new Float32Array(Array.from({ length: this.n }, () => value))
    this.sizeAttribute.needsUpdate = true
    this.markAsDirty()
  }

  setOpacity(value: number | number[]) {
    this.opacityAttribute.array = Array.isArray(value)
      ? new Float32Array(value)
      : new Float32Array(Array.from({ length: this.n }, () => value))
    this.opacityAttribute.needsUpdate = true
    this.markAsDirty()
  }

  setMark(value: number | number[]) {
    this.typeAttribute.array = Array.isArray(value)
      ? new Float32Array(value)
      : new Float32Array(Array.from({ length: this.n }, () => value))
    this.typeAttribute.needsUpdate = true
    this.markAsDirty()
  }

  setFilter(value: number | number[]) {
    this.showAttribute.array = Array.isArray(value)
      ? new Float32Array(value)
      : new Float32Array(Array.from({ length: this.n }, () => value))
    this.showAttribute.needsUpdate = true
    this.markAsDirty()
  }

  setSelected(value: number | number[]) {
    this.selectedAttribute.array = Array.isArray(value)
      ? new Float32Array(value)
      : new Float32Array(Array.from({ length: this.n }, () => value))
    this.selectedAttribute.needsUpdate = true
    this.markAsDirty()
  }

  setColor(value: THREE.ColorRepresentation | THREE.ColorRepresentation[]) {
    if (Array.isArray(value)) {
      for (let i = 0; i < this.n; i++) {
        const color = new THREE.Color(value[i])
        this.colorAttribute.setXYZ(i, color.r, color.g, color.b)
      }
    } else {
      const color = new THREE.Color(value)
      for (let i = 0; i < this.n; i++) {
        this.colorAttribute.setXYZ(i, color.r, color.g, color.b)
      }
    }

    this.colorAttribute.needsUpdate = true
    this.markAsDirty()
  }

  initialize({
    x,
    y,
    bounds,
    color,
    size,
    opacity,
    mark,
    filter,
    selected,
  }: {
    selected?: number[] | number
    filter?: number[] | number
    x: number[]
    y: number[]
    bounds: Boundaries
    color?: string[]
    size?: number[]
    opacity?: number[]
    mark?: number[]
  }) {
    this.bounds = bounds

    // Create buffers
    this.colorAttribute = new THREE.Float32BufferAttribute(
      new Float32Array(this.n * 3),
      3
    )
    this.typeAttribute = new THREE.Float32BufferAttribute(
      new Float32Array(this.n),
      1
    )
    this.showAttribute = new THREE.Float32BufferAttribute(
      new Float32Array(this.n),
      1
    )
    this.positionAttribute = new THREE.Float32BufferAttribute(
      new Float32Array(this.n * 3),
      3
    )
    this.position2Attribute = new THREE.Float32BufferAttribute(
      new Float32Array(this.n * 3),
      3
    )
    this.opacityAttribute = new THREE.Float32BufferAttribute(
      new Float32Array(this.n),
      1
    )
    this.sizeAttribute = new THREE.Float32BufferAttribute(
      new Float32Array(this.n),
      1
    )
    this.selectedAttribute = new THREE.Float32BufferAttribute(
      new Float32Array(this.n),
      1
    )

    // Initialize buffers with default values
    this.setOpacity(opacity ?? 1)
    this.setSize(size ?? 1)
    this.setMark(mark ?? 0)
    this.setColor(color ?? 'black')
    this.setFilter(filter ?? 0)
    this.setSelected(selected ?? 0)
    this.setX(x ?? 0)
    this.setY(y ?? 0)

    this.geometry.setAttribute('position', this.positionAttribute)
    this.geometry.setAttribute('position2', this.position2Attribute)
    this.geometry.setAttribute('size', this.sizeAttribute)
    this.geometry.setAttribute('col', this.colorAttribute)
    this.geometry.setAttribute('type', this.typeAttribute)
    this.geometry.setAttribute('show', this.showAttribute)
    this.geometry.setAttribute('selected', this.selectedAttribute)
    this.geometry.setAttribute('opacity', this.opacityAttribute)
  }

  render(renderer: THREE.WebGLRenderer, width: number, height: number) {
    this.dirty = false

    const t = performance.now()
    const s = (t - this.interpolationTimer) / 1000
    this.interpolationTimer = t

    const curr = this.material.uniforms.frameTime.value
    const newCurr = Math.min(1, curr + s)
    this.material.uniforms.frameTime = { value: newCurr }

    if (newCurr < 1) {
      this.markAsDirty()
    } else if (curr < 1 && newCurr === 1) {
      this.invalidateOldFrame()
    }

    renderer.render(this.scene, this.camera)
  }
}
