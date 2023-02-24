import * as THREE from "three";
import { Boundaries, VectorLike } from "../Interfaces";
// @ts-ignore
import Test from "../Assets/square_white.png";

console.log(Test);

const fragment = `
precision mediump float;

uniform vec3 color;
uniform sampler2D atlas;

varying vec4 vColor;
varying float vType;
varying float vShow;
varying float vSelected;

void main() {
    //discard;
    gl_FragColor = vColor;

    //if (vShow <= 0.1) {
    //  discard;
    //}

    gl_FragColor = gl_FragColor * texture2D(atlas, gl_PointCoord);
    //gl_FragColor = gl_FragColor * texture2D(atlas, vec2(vType * 0.25, 0.75) + gl_PointCoord * 0.25);

    //if (vSelected > 0.5) {
    //vec4 border = texture2D(atlas, vec2(vType * 0.25, 0.5) + gl_PointCoord * 0.25);
    //gl_FragColor = mix(gl_FragColor, border, border.a);
    //}

}
`;

const vertex = `
// Vertex shader of the particle mesh.
uniform vec4 domain;
uniform float zoom;
uniform float scale;

uniform float frameTime;

attribute vec4 color;

// Attributes of point sprites
attribute float size;

attribute float type;
attribute float show;
attribute float selected;
attribute vec3 position;
attribute vec3 frame1;
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
    vColor = color;
    //vType = type;
    vShow = show;
    gl_PointSize = size;
    
    gl_Position = vec4(map(mix(frame1.x, frame2.x, frameTime), domain.x, domain.y, -1.0, 1.0), map(mix(frame1.y, frame2.y, frameTime), domain.z, domain.w, -1.0, 1.0), frame1.z, 1.0);
}
`;

export class WebGLRenderer {
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.OrthographicCamera;
  geometry!: THREE.BufferGeometry;
  material!: THREE.ShaderMaterial;

  frame1Buffer: THREE.Float32BufferAttribute;
  frame2Buffer: THREE.Float32BufferAttribute;

  createFakeTexture() {
    const width = 512;
    const height = 512;

    const size = width * height;
    const data = new Uint8Array(4 * size);
    const color = new THREE.Color(0xffffff);

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
        zoom: { value: 1.0 },
        color: { value: new THREE.Color(0xffffff) },
        scale: { value: 1.0 },
        atlas: {
          value: texture,
        },
        frameTime: { value: 0.0 },
        domain: { value: new THREE.Vector4(0, 50, 0, 50) },
      },
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
      alphaTest: 0.0,
    });

    // used the buffer to create a DataTexture

    texture.needsUpdate = true;
  }

  constructor(canvas) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-50, 50, 150, -150, 0, 1000);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
    });

    this.createFakeTexture();

    new THREE.ImageBitmapLoader().load(
      Test,
      (bitmap) => {
        const texture2 = new THREE.CanvasTexture(bitmap);
        this.material.uniforms["atlas"].value = texture2;
        this.material.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
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

  frame() {
    this.renderer.render(this.scene, this.camera);
  }

  setSize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
  }

  updateBounds(xdomain: number[], ydomain: number[]) {
    this.material.uniforms["domain"] = {
      value: new THREE.Vector4(xdomain[0], xdomain[1], ydomain[0], ydomain[1]),
    };
    this.material.uniformsNeedUpdate = true;
  }

  setPositions(positions: VectorLike[]) {
    positions.forEach((v, index) => {
      const { x, y } = v;

      this.frame1Buffer.setXY(index, x, y);
    });
  }

  initialize(x: number[], y: number[], bounds: Boundaries) {
    const vertices = new Array<number>(x.length * 3);

    const colors = new Float32Array(x.length * 4);
    const sizes = new Float32Array(x.length);
    const types = new Float32Array(x.length);
    const show = new Float32Array(x.length);
    const selected = new Float32Array(x.length);
    const frame1 = new Float32Array(x.length * 3);
    const frame2 = new Float32Array(x.length * 3);

    x.forEach((v, i) => {
      vertices[i * 3 + 0] = x[i];
      vertices[i * 3 + 1] = y[i];
      vertices[i * 3 + 2] = 0.0;

      frame1[i * 3 + 0] = x[i];
      frame1[i * 3 + 1] = y[i];
      frame1[i * 3 + 2] = 0.0;

      frame2[i * 3 + 0] = x[i] + 10;
      frame2[i * 3 + 1] = y[i] + 10;
      frame2[i * 3 + 2] = 0.0;

      show[i] = 1.0;
      types[i] = 2.0;
      selected[i] = 0.0;
      sizes[i] = 9.0;
      colors[i * 4 + 0] = 1.0;
      colors[i * 4 + 1] = 1.0;
      colors[i * 4 + 2] = 1.0;
      colors[i * 4 + 3] = 1.0;
    });

    const posAtt = new THREE.Float32BufferAttribute(vertices, 3);
    posAtt.usage = THREE.StreamDrawUsage;

    this.geometry.setAttribute("position", posAtt);

    this.frame1Buffer = new THREE.Float32BufferAttribute(frame1, 3);
    this.geometry.setAttribute("frame1", this.frame1Buffer);

    this.frame2Buffer = new THREE.Float32BufferAttribute(frame2, 3);
    this.geometry.setAttribute("frame2", this.frame2Buffer);

    this.geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(sizes, 1)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 4)
    );

    this.geometry.setAttribute(
      "types",
      new THREE.Float32BufferAttribute(types, 1)
    );
    this.geometry.setAttribute(
      "show",
      new THREE.Float32BufferAttribute(show, 1)
    );
    this.geometry.setAttribute(
      "selected",
      new THREE.Float32BufferAttribute(selected, 1)
    );

    // create a buffer with color data

    //

    this.camera.position.z = 5;
    this.updateBounds([bounds.minX, bounds.maxX], [bounds.minY, bounds.maxY]);
  }
}
