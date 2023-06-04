import * as THREE from "three";
import { Layout } from "./Layout";
export declare class Context {
    canvas: HTMLCanvasElement;
    renderer: THREE.WebGLRenderer;
    root: Layout;
    constructor(canvas: HTMLCanvasElement);
    isDirty(): import("./Plot").Plot;
    render(): void;
}
