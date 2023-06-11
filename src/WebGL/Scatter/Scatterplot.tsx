import { useEffect, useState } from 'react';
import { SpatialModel } from '../../Store/ModelSlice';
import { useVisContext } from '../VisualizationContext';
import * as React from 'react';
import { ScatterTrace } from './ScatterTrace';
import { Scatter } from '../../Scatter/Scatter';

type ColumnTemp = {
  values: number[];
  domain: number[];
};

interface GlobalConfig {
  pointSize: number;
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
  shape,
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
  hover: number;
  interpolate: boolean;
  shape?: number[];
}) {
  const [myRenderer, setRenderer] = useState<Scatter>();

  const [timestamp, setTimestamp] = React.useState(0);
  const ref = React.useRef<HTMLCanvasElement>();

  const {
    width,
    height,
    registerRenderFunction,
    requestFrame,
    scaledXDomain,
    scaledYDomain,
    zoom,
  } = useVisContext();

  useEffect(() => {
    myRenderer?.setColor(new Float32Array(color));
  }, [color, myRenderer]);

  useEffect(() => {
    myRenderer?.setShape(new Float32Array(shape));
  }, [shape, myRenderer]);

  useEffect(() => {
    myRenderer?.setHover([hover]);
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
      requestFrame();
    }
  }, [x, y, myRenderer, n, requestFrame]);

  useEffect(() => {
    if (width !== 0 && height !== 0) {
      ref.current.width = width * window.devicePixelRatio;
      ref.current.height = height * window.devicePixelRatio;
    }
  }, [width, height]);

  useEffect(() => {
    let active = true;

    const scatter = new Scatter(n, ref.current.getContext('webgpu'), {
      background: [1, 1, 1, 1],
    });
    const N = n;
    
    scatter.requestDevice().then(() => {
      scatter.createBuffers().then(() => {
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
    });

    return () => {
      active = false;
      scatter.dispose();
    };
  }, [setRenderer, ref, n]);

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
