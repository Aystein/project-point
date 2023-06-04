import { Trace } from "./Trace";
import * as THREE from 'three';
export declare class Plot {
    width: number;
    height: number;
    traces: Trace[];
    backgroundColor: THREE.Color;
    private dirty;
    constructor(width: number, height: number);
    addTrace(trace: Trace): void;
    markAsDirty(): void;
    isDirty(): boolean;
    render(renderer: THREE.WebGLRenderer): void;
}
