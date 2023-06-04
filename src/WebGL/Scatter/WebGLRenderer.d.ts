import * as THREE from "three";
import { Boundaries, VectorLike } from "../../Interfaces";
export declare class WebGLRenderer {
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    geometry: THREE.BufferGeometry;
    material: THREE.ShaderMaterial;
    frame1Buffer: THREE.Float32BufferAttribute;
    frame2Buffer: THREE.Float32BufferAttribute;
    sizeAttribute: THREE.Float32BufferAttribute;
    hover: number;
    createFakeTexture(): void;
    constructor();
    setInterpolation(value: number): void;
    updateBounds(xdomain: number[], ydomain: number[]): void;
    setPositions(positions: VectorLike[]): void;
    setHover(index: number): void;
    initialize(x: number[], x2: number[], y: number[], bounds: Boundaries, color?: string[], size?: number[], opacity?: number[]): void;
}
