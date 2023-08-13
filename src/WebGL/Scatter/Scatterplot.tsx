/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Lines } from '../../Scatter/Lines';
import { Scatter } from '../../Scatter/Scatter';
import { useAppSelector } from '../../Store/hooks';
import { Engine } from '../../ts/engine/engine';
import { useVisContext } from '../VisualizationContext';
import { POINT_RADIUS } from '../../Layouts/Globals';

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
  y,
  color,
  size,
  opacity,
  globalConfig = { pointSize: 16 },
  hover,
  selection,
  shape,
  line,
  interpolate,
}: {
  n: number;
  x: number[];
  y: number[];
  color?: number[];
  size?: number[];
  opacity?: number[];
  globalConfig?: GlobalConfig;
  hover?: number[];
  selection?: number[];
  shape?: number[];
  line?: number[];
  interpolate?: boolean;
}) {
  const [myRenderer, setRenderer] = useState<{ scatter: Scatter, engine: Engine }>();

  const [timestamp, setTimestamp] = React.useState(0);
  const ref = React.useRef<HTMLCanvasElement>();

  const [device, adapter] = useDevice();

  const { width, height, scaledXDomain, scaledYDomain, zoom } = useVisContext();

  const settings = useAppSelector((state) => state.settings);

  const settingsRef = React.useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (myRenderer) {
      myRenderer.scatter.interpolateBetweenFrames = interpolate;
    }
  }, [interpolate, myRenderer]);

  useEffect(() => {
    myRenderer?.scatter.setColor(new Float32Array(color));
  }, [color, myRenderer]);

  useEffect(() => {
    myRenderer?.scatter.setLine(line);
  }, [line, myRenderer]);

  useEffect(() => {
    let arr = Array.from({ length: n }).map(() => 0);

    (selection ?? []).forEach((value) => {
      arr[value] = 1;
    });

    myRenderer?.engine.setSelection(arr);
    // myRenderer?.scatter.setSelection(selection ?? []);
  }, [selection, myRenderer, n]);

  useEffect(() => {
    myRenderer?.scatter.setShape(new Float32Array(shape));
  }, [shape, myRenderer]);

  useEffect(() => {
    myRenderer?.scatter.setHover(hover ?? []);
  }, [hover, myRenderer]);

  useEffect(() => {
    if (!myRenderer) return;

    myRenderer.scatter.updateBounds(scaledXDomain.domain(), scaledYDomain.domain());
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
    if (myRenderer && x && x.length === myRenderer.engine.N) {
      myRenderer.engine.setForces(x, y);
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
  }, [device])

  useEffect(() => {
    if (!device || !adapter) return () => { };

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


    scatter.createBuffers().then(() => {
      const engine = new Engine(device, N, {
        spheresRadius: POINT_RADIUS,
        particlesPositions: Array.from({length: N}).map((_, i) => ([x[i], y[i]]))
      })
      const encoder = device.createCommandEncoder();
      engine.compute(encoder, settingsRef.current.delta / 1000000, 1)
      const commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);

      scatter.setXY(
        new Float32Array(
          Array.from({ length: N * 2 }).map(() => -2 + Math.random() * 4)
        )
      );
      scatter.setColor(
        new Float32Array(
          Array.from({ length: N })
            .map(() => [0.5, 0.5, 0.5, 1])
            .flat()
        )
      );


      if (active) {
        setRenderer({ engine, scatter });

        function mainLoop(scatter: Scatter, device, engine: Engine): void {
          if (scatter.disposed) {
            return;
          }
          
          
          const encoder = device.createCommandEncoder();
          if (interpolate) {
            for (let i = 0; i < settingsRef.current.substeps; i++) {
              engine.compute(encoder, settingsRef.current.delta / 1000000, settingsRef.current.radiusScaling)
            }
          }
        
          scatter.frame(encoder, engine.spheresBuffer);
        
          const commandBuffer = encoder.finish();
          device.queue.submit([commandBuffer]);
        
          requestAnimationFrame(() => mainLoop(scatter, device, engine));
        }

        requestAnimationFrame(() => mainLoop(scatter, device, engine));
      }
    });

    return () => {
      active = false;
      scatter.dispose();
    };
  }, [setRenderer, ref, n, device, adapter]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
