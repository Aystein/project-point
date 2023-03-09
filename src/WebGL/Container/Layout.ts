import { Plot } from "./Plot";
import * as THREE from 'three';
import * as PIXI from 'pixi.js';

export class Layout {
    plots: Plot[] = []
    
    addPlot(plot: Plot) {
        this.plots.push(plot);
    }

    render(renderer: THREE.WebGLRenderer) {
        
    }
}