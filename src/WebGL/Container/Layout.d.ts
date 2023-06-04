import { Plot } from "./Plot";
import * as THREE from 'three';
export declare class Layout {
    plots: Plot[];
    addPlot(plot: Plot): void;
    render(renderer: THREE.WebGLRenderer): void;
}
