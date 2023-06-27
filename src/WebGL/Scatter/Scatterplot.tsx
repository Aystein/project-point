/* eslint-disable @typescript-eslint/naming-convention */
import { useEffect, useState } from 'react';
import { SpatialModel } from '../../Store/ModelSlice';
import { useVisContext } from '../VisualizationContext';
import * as React from 'react';
import { ScatterTrace } from './ScatterTrace';
import { Scatter } from '../../Scatter/Scatter';
import { Lines } from '../../Scatter/Lines';

type ColumnTemp = {
  values: number[];
  domain: number[];
};

interface GlobalConfig {
  pointSize: number;
}

function useDevice() {
  const [value, setValue] = React.useState<[GPUDevice, GPUAdapter]>(null);

  React.useEffect(() => {
    (async () => {
      if (!navigator.gpu) {
        throw new Error('WebGPU not supported on this browser.');
      }

      const adapter = await navigator.gpu.requestAdapter();

      if (!adapter) {
        throw new Error('No appropriate GPUAdapter found.');
      }

      const device = await adapter.requestDevice();

      setValue([device, adapter]);
    })();
  }, []);

  return value ?? [null, null];
}

export function Scatterplot({
  n,
  x,
  x2,
  y,
  model,
  color,
  size,
  opacity,
  globalConfig = { pointSize: 16 },
  hover,
  interpolate = true,
  selection,
  shape,
  line,
}: {
  n: number;
  x: number[];
  x2: string | ColumnTemp;
  y: number[];
  model: SpatialModel;
  color?: number[];
  size?: number[];
  opacity?: number[];
  globalConfig?: GlobalConfig;
  hover: number[];
  selection: number[];
  interpolate: boolean;
  shape?: number[];
  line: number[];
}) {
  const [myRenderer, setRenderer] = useState<Scatter>();
  const [lines, setLines] = useState<Lines>();

  const [timestamp, setTimestamp] = React.useState(0);
  const ref = React.useRef<HTMLCanvasElement>();

  const [device, adapter] = useDevice();

  const { width, height, scaledXDomain, scaledYDomain, zoom } = useVisContext();

  useEffect(() => {
    myRenderer?.setColor(new Float32Array(color));
  }, [color, myRenderer]);

  useEffect(() => {
    myRenderer?.setLine(line);
  }, [line, myRenderer]);

  useEffect(() => {
    myRenderer?.setSelection(selection ?? []);
  }, [selection, myRenderer]);

  useEffect(() => {
    myRenderer?.setShape(new Float32Array(shape));
  }, [shape, myRenderer]);

  useEffect(() => {
    myRenderer?.setHover(hover ?? []);
  }, [hover, myRenderer]);

  useEffect(() => {
    if (!myRenderer) return;

    myRenderer.updateBounds(scaledXDomain.domain(), scaledYDomain.domain());
  }, [
    scaledXDomain,
    scaledYDomain,
    myRenderer,
    zoom,
    timestamp,
    width,
    height,
  ]);

  useEffect(() => {
    if (myRenderer) {
      //myRenderer.setX(x, interpolate);
      //myRenderer.setY(y, interpolate);

      const xy = new Float32Array(
        Array.from({ length: n * 2 }).map(() => -2 + Math.random() * 4)
      );
      for (let i = 0; i < n; i++) {
        xy[i * 2] = x[i];
        xy[i * 2 + 1] = y[i];
      }
      myRenderer.setXY(xy);
    }
  }, [x, y, myRenderer, n]);

  useEffect(() => {
    if (width !== 0 && height !== 0) {
      ref.current.width = width * window.devicePixelRatio;
      ref.current.height = height * window.devicePixelRatio;
    }
  }, [width, height]);

  useEffect(() => {
    if (adapter && device) {
      ref.current.getContext('webgpu').configure({
        device: device,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: 'opaque',
      });
    }
  }, [adapter, device]);

  useEffect(() => {
    if (!device || !adapter) return () => {};
    if (!width || !height) return () => {};

    let active = true;

    const scatter = new Scatter(
      n,
      ref.current.getContext('webgpu'),
      {
        background: [1, 1, 1, 1],
      },
      device
    );

    const N = n;

    scatter.createBuffers(width, height).then(() => {
      scatter.setXY(
        new Float32Array(
          Array.from({ length: N * 2 }).map(() => -2 + Math.random() * 4)
        )
      );
      scatter.setColor(
        new Float32Array(
          Array.from({ length: N })
            .map(() => [Math.random(), Math.random(), Math.random(), 1])
            .flat()
        )
      );
      scatter.frame();

      if (active) {
        setRenderer(scatter);
      }
    });

    return () => {
      active = false;
      scatter.dispose();
    };
  }, [setRenderer, ref, n, device, adapter, width, height]);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
