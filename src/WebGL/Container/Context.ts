import * as THREE from "three";
import { Layout } from "./Layout";
import * as PIXI from 'pixi.js';
import { StackLayout } from "./StackLayout";


export class Context {
    canvas: HTMLCanvasElement;
    renderer: THREE.WebGLRenderer;
    root: Layout = new StackLayout();
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: false,
        });
        this.renderer.autoClear = false
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    isDirty() {
        return this.root.plots.find((plot) => plot.isDirty())
    }

    render() {
        this.renderer.clear();

        this.root.render(this.renderer);
    }
}