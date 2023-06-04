import { Plot } from "./Plot";
import * as THREE from 'three';
export declare class Trace {
    plot: Plot;
    scene: THREE.Scene;
    constructor();
    markAsDirty(): void;
    onDrag(): void;
    render(renderer: THREE.WebGLRenderer, width: number, height: number): void;
}
