import { Layout } from "./Layout";
import { Trace } from "./Trace";
import * as THREE from 'three';

export class StackLayout extends Layout {
    constructor() {
        super();
    }

    override render(renderer: THREE.WebGLRenderer) {
        renderer.setScissorTest(true);

        let x = 16;
        let y = 16;

        for (const plot of this.plots) {
            renderer.setScissor(
                x,
                y,
                plot.width,
                plot.height
            );

            renderer.setViewport(
                x,
                y,
                plot.width,
                plot.height
            )

            plot.render(renderer);

            y += plot.height + 16;
        }
    }
}