/* eslint-disable @typescript-eslint/naming-convention */
import { useEffect, useState } from 'react';
import { SpatialModel } from '../../Store/ModelSlice';
import { useVisContext } from '../VisualizationContext';
import * as React from 'react';
import { Scatter } from '../../Scatter/Scatter';
import { Lines } from '../../Scatter/Lines';
import { Engine } from '../../ts/engine/engine';
import { Mesh } from '../../ts/engine/initial-conditions/models/mesh';
import { Particles } from '../../ts/engine/initial-conditions/models/models';

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
  const [myRenderer, setRenderer] = useState<Scatter>();
  const [lines, setLines] = useState<Lines>();

  const [timestamp, setTimestamp] = React.useState(0);
  const ref = React.useRef<HTMLCanvasElement>();

  const [device, adapter] = useDevice();

  const { width, height, scaledXDomain, scaledYDomain, zoom } = useVisContext();

  useEffect(() => {
    if (myRenderer) {
      myRenderer.interpolateBetweenFrames = interpolate;
    }
  }, [interpolate, myRenderer]);

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
    if (!device || !adapter) return () => { };
    if (!width || !height) return () => { };

    let active = true;

    const scatter = new Scatter(
      n,
      ref.current.getContext('webgpu'),
      {
        background: [1, 1, 1, 1],
      },
      device
    );


    /**const renderer = new Renderer(device);
    
    setInterval(async () => {
      const encoder = device.createCommandEncoder();
      engine.compute(encoder, 0.02, [0, 0, 0]);

      renderer.render(encoder, engine.spheresBuffer.gpuBuffer, ref.current.getContext('webgpu'))

      const commandBuffer = encoder.finish();

      device.queue.submit([commandBuffer]);

      
    }, 500)

    return;*/

    const N = n;
    const engine = new Engine(device, N, {
      particlesContainerMesh: Mesh.load(Particles.XX),
      obstaclesMesh: null,
      spheresRadius: 0.012,
    })

    scatter.createBuffers(width, height).then(() => {
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

      function mainLoop(): void {
        if (scatter.disposed) {
          return;
        }
        const encoder = device.createCommandEncoder();

        for (let i = 0; i < 20; i++) {
          engine.compute(encoder, 0.0005, [0, 0])
        }

        scatter.frame(encoder, engine.spheresBuffer);
        const commandBuffer = encoder.finish();

        device.queue.submit([commandBuffer]);
        requestAnimationFrame(mainLoop);
      }

      requestAnimationFrame(mainLoop);

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
