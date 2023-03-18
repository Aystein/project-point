import * as THREE from "three";
import { Boundaries, VectorLike } from "../../Interfaces";
// @ts-ignore
import Test from "../../Assets/square_white.png";
import { OrthographicCamera } from "three";

const HOVER_SCALE = 1.25;
const BASE_SIZE = 20;

const fragment = `
precision mediump float;

uniform sampler2D atlas;

uniform float spritesPerRow;
uniform float spritesPerColumn;

varying vec4 vColor;
varying float vType;
varying float vShow;
varying float vSelected;

void main() {
    gl_FragColor = vColor;

    //if (vShow <= 0.1) {
    //  discard;
    //}

    float xs = 1.0 / spritesPerRow;
    float xy = 1.0 / spritesPerColumn;

    float r = float(int(vType) / int(spritesPerRow)) * xy;
    float c = mod(vType, spritesPerRow) * xs;
    
    // gl_FragColor = gl_FragColor * texture2D(atlas, gl_PointCoord);
    gl_FragColor = gl_FragColor * texture2D(atlas, gl_PointCoord * vec2(xs, xy) + vec2(c, r));

    //if (vSelected > 0.5) {
    //vec4 border = texture2D(atlas, vec2(vType * 0.25, 0.5) + gl_PointCoord * 0.25);
    //gl_FragColor = mix(gl_FragColor, border, border.a);
    //}

}
`;

const vertex = `
// Vertex shader of the particle mesh.
uniform float frameTime;

uniform mat4 projectionMatrix;

// Attributes of point sprites
attribute float size;
attribute vec4 col;
attribute float type;
attribute float show;
attribute float selected;

attribute vec3 position;
attribute vec3 frame2;

// Varying of point sprites
varying vec4 vColor;
varying float vType;
varying float vShow;
varying float vSelected;

float map(float s, float  a1, float  a2, float  b1, float  b2)
{
    return b1 + (s - a1) * (b2 - b1) / (a2 - a1);
}

void main() {
    vColor = col;
    vType = type;
    vShow = show;
    vSelected = selected;
    gl_PointSize = size;
    
    gl_Position = projectionMatrix * mix(vec4(position.x, position.y, 0.0, 1.0), vec4(frame2.x, frame2.y, 0.0, 1.0), frameTime);
}
`;

export class WebGLRenderer {
  scene!: THREE.Scene;
  camera!: THREE.OrthographicCamera;
  geometry!: THREE.BufferGeometry;
  material!: THREE.ShaderMaterial;

  frame1Buffer: THREE.Float32BufferAttribute;
  frame2Buffer: THREE.Float32BufferAttribute;

  sizeAttribute: THREE.Float32BufferAttribute;

  hover: number = null;

  createFakeTexture() {
    const width = 512;
    const height = 512;

    const size = width * height;
    const data = new Uint8Array(4 * size);
    const color = new THREE.Color(0xff0000);

    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);

    for (let i = 0; i < size; i++) {
      const stride = i * 4;

      data[stride] = r;
      data[stride + 1] = g;
      data[stride + 2] = b;
      data[stride + 3] = 255;
    }

    const texture = new THREE.DataTexture(data, width, height);

    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        spritesPerRow: { value: 2 },
        spritesPerColumn: { value: 2 },
        atlas: {
          value: texture,
        },
        frameTime: { value: 0.0 },
      },
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    // used the buffer to create a DataTexture

    texture.needsUpdate = true;
  }

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-50, 50, 150, -150, 0, 1000);
    //this.camera = new THREE.Camera();
    
    this.createFakeTexture();

    new THREE.ImageBitmapLoader().load(
      Test,
      (bitmap) => {
        const texture2 = new THREE.CanvasTexture(bitmap);
        this.material.uniforms["atlas"].value = texture2;
        this.material.needsUpdate = true;
      },
      undefined,
      () => {
        console.log("error");
      }
    );

    this.geometry = new THREE.BufferGeometry();

    const points = new THREE.Points(this.geometry, this.material);

    this.scene.add(points);
  }

  setInterpolation(value: number) {
    this.material.uniforms["frameTime"] = { value };
  }

  updateBounds(xdomain: number[], ydomain: number[]) {
    this.camera = new OrthographicCamera(xdomain[0], xdomain[1], ydomain[0], ydomain[1], -1, 1);
  }

  setPositions(positions: VectorLike[]) {
    positions.forEach((v, index) => {
      const { x, y } = v;

      this.frame1Buffer.setXY(index, x, y);
    });
  }

  /**
   * Hovers an element in the scatter visualization
   * 
   * @param index the index of the element to hover
   */
  setHover(index: number) {
    if (this.hover === index) {
      return;
    }
    
    if (this.hover !== null) {
      this.sizeAttribute.setX(this.hover, this.sizeAttribute.getX(this.hover) / HOVER_SCALE);
    }

    this.hover = index;

    if (this.hover !== null) {
      this.sizeAttribute.setX(this.hover, this.sizeAttribute.getX(this.hover) * HOVER_SCALE);
    }

    this.sizeAttribute.needsUpdate = true;
  }



  initialize(x: number[], x2: number[], y: number[], bounds: Boundaries, color?: string[], size?: number[], opacity?: number[]) {
    const colors = new THREE.Float32BufferAttribute(new Float32Array(x.length * 4), 4)

    this.sizeAttribute = new THREE.Float32BufferAttribute(new Float32Array(x.length), 1);
    const types = new THREE.Float32BufferAttribute(new Float32Array(x.length), 1);
    const show = new THREE.Float32BufferAttribute(new Float32Array(x.length), 1);
    const selected = new THREE.Float32BufferAttribute(new Float32Array(x.length), 1);
    const position = new THREE.Float32BufferAttribute(new Float32Array(x.length * 3), 3);
    const position2 = new THREE.Float32BufferAttribute(new Float32Array(x.length * 3), 3);

    x.forEach((v, i) => {
      position.setXYZ(i, x[i], y[i], 0.0);
      position2.setXYZ(i, x2[i], y[i], 0.0);

      show.setX(i, 1.0);
      types.setX(i, i % 4);
      selected.setX(i, 0.0);
      
      this.sizeAttribute.setX(i, size ? BASE_SIZE * size[i] : BASE_SIZE);

      if (color) {
        const tc = new THREE.Color(color[i])
        colors.setXYZW(i, tc.r, tc.g, tc.b, 1);
      } else {
        colors.setXYZW(i, 1, 1, 1, 1);
      }

      if (opacity) {
        colors.setW(i, opacity[i]);
      }

    });

    this.geometry.setAttribute("position", position);

    this.frame1Buffer = position;

    this.frame2Buffer = position2;
    this.geometry.setAttribute("frame2", this.frame2Buffer);

    this.geometry.setAttribute("size", this.sizeAttribute);
    this.geometry.setAttribute("col", colors);
    this.geometry.setAttribute("type", types);
    this.geometry.setAttribute("show", show);
    this.geometry.setAttribute("selected", selected);

    this.camera.position.z = 5;
    
    this.updateBounds([bounds.minX, bounds.maxX], [bounds.minY, bounds.maxY]);
  }
}
