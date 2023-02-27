import { useElementSize } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { SpatialModel } from "../Store/ModelSlice";
import { normalizeWheel } from "./Util";
import { WebGLRenderer } from "./WebGLRenderer";
import { scaleLinear } from "d3-scale";
import { useVisContext, VisProvider } from "./Context";

type ColumnTemp = {
  values: number[];
  domain: number[];
}

interface GlobalConfig {
  pointSize: number;
}

export function Scatterplot({
  xKey,
  yKey,
  model,
  color,
  size,
  opacity,
  globalConfig = { pointSize: 16 },
}: {
  xKey: string | ColumnTemp;
  yKey: string | ColumnTemp;
  model: SpatialModel;
  color?: string[];
  size?: number[];
  opacity?: number[];
  globalConfig: GlobalConfig;
}) {
  const [renderer, setRenderer] = useState<WebGLRenderer>();

  const { ref, width, height, registerRenderFunction } = useVisContext();

  const [domains, setDomains] = useState({
    x: [0, 50],
    y: [0, 50],
  });
  const [transform, setTransform] = useState({
    k: 1,
    x: 0,
    y: 0,
  });

  const render = (renderer: WebGLRenderer) => {
    
  }

  const handleScroll = (event: React.UIEvent<HTMLCanvasElement, UIEvent>) => {
    event.nativeEvent.preventDefault();

    const normalized = normalizeWheel(event);

    // @ts-ignore
    const px = event.nativeEvent.offsetX;

    const diff = normalized.pixelY * 0.0053;

    const { x, y } = domains;

    const L0_x = [
      transform.x + x[0] * transform.k,
      transform.y + x[1] * transform.k,
    ];

    const S0_x = scaleLinear().domain(L0_x).range([0, width]);
    const d0x = S0_x.invert(px);

    const k = Math.max(0.1, transform.k * (1 - diff));

    const L1_x = [transform.x + x[0] * k, transform.y + x[1] * k];
    const S1_x = scaleLinear().domain(L1_x).range([0, width]);

    const d1x = S1_x.invert(px);

    const dxdiff = d0x - d1x;

    setTransform({
      k,
      x: transform.x - dxdiff,
      y: transform.y,
    });
  };

  useEffect(() => {
    setRenderer(new WebGLRenderer(ref.current));
    registerRenderFunction(render);
  }, []);

  useEffect(() => {
    setDomains({
      x: [model.bounds.minX, model.bounds.maxX],
      y: [model.bounds.minY, model.bounds.maxY],
    });
  }, [model]);

  useEffect(() => {
    if (!renderer || !domains) return;

    renderer.updateBounds(
      [
        transform.x + transform.k * domains.x[0],
        transform.x + transform.k * domains.x[1],
      ],
      domains.y
    );
    renderer.frame();
  }, [domains, renderer, transform]);

  useEffect(() => {
    if (!model || !renderer) return;
    const x = model.spatial.map((row) => row[xKey]);
    const y = model.spatial.map((row) => row[yKey]);

    renderer.initialize(x, y, model.bounds, color, size, opacity);
    renderer.renderer.render(renderer.scene, renderer.camera);
  }, [setRenderer, ref, model, renderer]);

  useEffect(() => {
    if (!renderer) {
      return;
    }
    renderer.setSize(width, height);
    renderer.renderer.render(renderer.scene, renderer.camera);
  }, [width, height, renderer]);

  return null;
}

export function TestLayer() {
  const {xDomain, yDomain, width, height} = useVisContext();

  const ref = React.useRef();

  React.useEffect(() => {

  }, []);

  return null;
}