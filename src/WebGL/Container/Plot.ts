import { Trace } from "./Trace";
import { Rectangle } from "./Rectangle";
import * as THREE from 'three';
import * as PIXI from 'pixi.js';

export class Plot {
    width: number;
    height: number;
    traces: Trace[] = [];
    backgroundColor: THREE.Color = new THREE.Color('white');
    private dirty: boolean;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    addTrace(trace: Trace) {
        trace.plot = this;
        this.traces.push(trace);
    }

    markAsDirty() {
        this.dirty = true;
    }

    isDirty() {
        return this.dirty;
    }

    render(renderer: THREE.WebGLRenderer) {
        this.dirty = false;

        renderer.setClearColor(this.backgroundColor);
        renderer.clear();

        for (const trace of this.traces) {
            trace.render(renderer, this.width, this.height);
        }
    }
}