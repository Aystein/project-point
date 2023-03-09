import { useEffect, useState } from "react";
import { SpatialModel } from "../../Store/ModelSlice";
import { WebGLRenderer } from "./WebGLRenderer";
import { scaleLinear } from "d3-scale";
import { useVisContext } from "../VisualizationContext";
import * as d3 from 'd3-quadtree';
import * as React from "react";
import { useMouseDrag } from "../Behavior/LassoBehavior";
import { MOUSE_HOVER } from "../Commands";

type ColumnTemp = {
  values: number[];
  domain: number[];
};

interface GlobalConfig {
  pointSize: number;
}

export function Scatterplot({
  x,
  x2,
  y,
  model,
  color,
  size,
  opacity,
  globalConfig = { pointSize: 16 },
  interpolate,
}: {
  x: string | ColumnTemp;
  x2: string | ColumnTemp;
  y: string | ColumnTemp;
  model: SpatialModel;
  color?: string[];
  size?: number[];
  opacity?: number[];
  globalConfig: GlobalConfig;
  interpolate: { channel: string, duration: number }
}) {
  const [myRenderer, setRenderer] = useState<WebGLRenderer>();

  const [tree, setTree] = React.useState<any>();
  const [hover, setHover] = React.useState(0);

  const getTimestamp = () => {
    return Date.now() / 1000;
  }

  const [timestamp, setTimestamp] = React.useState(0);

  const { ref, width, height, registerRenderFunction, requestFrame, scaledXDomain, scaledYDomain, zoom } =
    useVisContext();


  
  const render = (renderer: THREE.WebGLRenderer) => {
    if (!myRenderer) {
      return;
    }


    renderer.setViewport(0,0,100,100)
    renderer.render(myRenderer.scene, myRenderer.camera);

    if (interpolate) {
      const now = getTimestamp();
      const i = Math.min(1, (now - timestamp) / interpolate.duration);


      myRenderer.setInterpolation(interpolate.channel === 'x2' ? i : (1 - i));

      if (i !== 1) {
        requestFrame();
      }
    } else {
      myRenderer.setInterpolation(0);
    }
  };

  const renderRef = React.useRef(render);
  renderRef.current = render;

  useEffect(() => {
    setRenderer(new WebGLRenderer());
    registerRenderFunction((renderer) => {
      renderRef.current(renderer)
    });
    setTimeout(() => requestFrame(), 500);
  }, []);

  useEffect(() => {
    setTimestamp(getTimestamp());
    requestFrame();
  }, [interpolate]);

  useEffect(() => {
    if (!myRenderer) return;

    myRenderer.updateBounds(
      scaledXDomain,
      scaledYDomain
    );

    requestFrame();
  }, [scaledXDomain, scaledYDomain, myRenderer, zoom, timestamp]);

  useMouseDrag(MOUSE_HOVER, (event) => {
    if (!tree) return false;

    const scaleX = scaleLinear().domain(scaledXDomain).range([0, width]);
    const scaleY = scaleLinear().domain(scaledYDomain).range([0, height]);

    const hit = tree.find(scaleX.invert(event.layerX), scaleY.invert(event.layerY))

    setHover(hit.index);

    myRenderer.setHover(hit.index);

    requestFrame();

    return true
  }, [tree, scaledXDomain, scaledYDomain]);

  useEffect(() => {
    if (!model || !myRenderer) return;
    //const x = model.spatial.map((row) => row[xKey]);
    //const y = model.spatial.map((row) => row[yKey]);

    //setTree(d3.quadtree()
    //  .x((d) => d[xKey])
    //  .y((d) => d[yKey])
    //  .addAll(model.spatial.map((e, i) => ({ ...e, index: i }))));

    myRenderer.initialize(x, x2, y, model.bounds, color, size, opacity);
    requestFrame();
  }, [setRenderer, ref, model, myRenderer]);

  return null;
}
