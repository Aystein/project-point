import { Plot } from "./Plot";
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import { MeshBasicMaterial } from "three";

export class Trace {
    plot: Plot;
    scene: THREE.Scene;

    constructor() {
        this.scene = new THREE.Scene();

        const geometry = new THREE.PlaneGeometry(100.75, 100);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        //plane.translateX(109);
        //plane.translateY(200);

        this.scene.add(plane);
    }

    markAsDirty() {
        this.plot?.markAsDirty();
    }

    onDrag() {
        
    }

    render(renderer: THREE.WebGLRenderer, width: number, height: number) {
        console.log("hey");
        renderer.render(this.scene, new THREE.OrthographicCamera(0, width, 0, height, -10, 10));
    }
}