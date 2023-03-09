import { ComponentMeta } from "@storybook/react";
import React from "react";
import { Context } from "../WebGL/Container/Context";
import { Plot } from "../WebGL/Container/Plot";
import { ScatterTrace } from "../WebGL/Container/ScatterTrace";
import { Trace } from "../WebGL/Container/Trace";

function Test() {
    const [dimensions, setDimensions] = React.useState({
        width: 600,
        height: 400,
    });
    const ref = React.useRef();

    React.useEffect(() => {
        const renderer = new Context(ref.current);
        const plot = new Plot(200, 100);
        const scatter = new ScatterTrace(4);
        scatter.initialize(
            {
                x: [1, 2, 3, 4],
                y: [1, 2, 3, 4],
                bounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 },
            }
        )

        plot.addTrace(scatter);
        const plot2 = new Plot(200, 100);
        plot2.addTrace(new Trace());
        renderer.root.addPlot(plot);
        renderer.root.addPlot(plot2);
        renderer.render();

        const frame = () => {
            if (renderer.isDirty()) {
                renderer.render();
            }

            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }, []);

    return <div style={{
        width: 600,
        height: 400
    }}><canvas
        style={{ width: "100%", height: "100%" }}
        width={dimensions.width}
        height={dimensions.height}
        ref={ref}
    ></canvas></div>
}

export default {
    title: 'Example/Framework',
};

export const Primary = () => {
    return <Test />
}