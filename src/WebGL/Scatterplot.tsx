import { valueGetters } from "@mantine/core/lib/Box/style-system-props/value-getters/value-getters";
import { useElementSize } from "@mantine/hooks";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef, useState } from "react";
import { SpatialModel } from "../Store/ModelSlice";
import { normalizeWheel } from "./Util";
import { WebGLRenderer } from "./WebGLRenderer";
import { scaleLinear } from "d3-scale";

{
  // domain ... initial domain
  // zoom ... zoom
  // pan ... pan
}

export function Scatterplot({
  xKey,
  yKey,
  model,
}: {
  xKey: string;
  yKey: string;
  model: SpatialModel;
}) {
  const [renderer, setRenderer] = useState<WebGLRenderer>();

  const { ref, width, height } = useElementSize();
  const [domains, setDomains] = useState({
    x: [0, 50],
    y: [0, 50],
  });
  const [transform, setTransform] = useState({
    k: 1,
    x: 0,
    y: 0,
  });

  const handleScroll = (event: React.UIEvent<HTMLCanvasElement, UIEvent>) => {
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

    const k = Math.max(0.1, transform.k * (1 + diff));

    const L1_x = [transform.x + x[0] * k, transform.y + x[1] * k];
    const S1_x = scaleLinear().domain(L1_x).range([0, width]);

    const d1x = S1_x.invert(px);

    const dxdiff = d0x - d1x;

    setTransform({
      k,
      x: transform.x + dxdiff,
      y: transform.y,
    });

    console.log(k);
  };

  const [] = useState();

  useEffect(() => {
    setRenderer(new WebGLRenderer(ref.current));
  }, []);

  useEffect(() => {
    setDomains({
      x: [model.bounds.minX, model.bounds.maxX],
      y: [model.bounds.minY, model.bounds.maxY],
    });
  }, [model]);

  useEffect(() => {
    if (!renderer || !domains) return;

    console.log(
      transform.x + transform.k * domains.x[0],
      transform.x + transform.k * domains.x[1]
    );

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

    console.log(x, y);
    console.log("RENDER");

    renderer.initialize(x, y, model.bounds);
    renderer.renderer.render(renderer.scene, renderer.camera);
  }, [setRenderer, ref, model, renderer]);

  useEffect(() => {
    if (!renderer) {
      return;
    }
    renderer.setSize(width, height);
    renderer.renderer.render(renderer.scene, renderer.camera);
  }, [width, height, renderer]);

  return (
    <canvas
      onWheel={handleScroll}
      style={{ width: "100%", height: "100%" }}
      width={width}
      height={height}
      ref={ref}
    ></canvas>
  );
}
