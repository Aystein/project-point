/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { useEffect, useState } from 'react';
import { setGlobalEngine } from '../../MainTabs/HistoryTab';
import { Scatter } from '../../Scatter/Scatter';
import { useAppSelector } from '../../Store/hooks';
import { Engine } from '../../ts/engine/engine';
import { useVisContext } from '../VisualizationContext';
import { Card } from '@mantine/core';
import { Shadow } from '../../Store/interfaces';
import { useDevice } from './useDevice';

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
  y,
  color,
  size,
  opacity,
  bounds,
  globalConfig = { pointSize: 16 },
  hover,
  selection,
  shape,
  line,
  interpolate,
  shadows,
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
  bounds?: number[];
  interpolate?: boolean;
  shadows?: Shadow[];
}) {
  const [myRenderer, setRenderer] = useState<{ scatter: Scatter, engine: Engine }>();

  const [timestamp, setTimestamp] = React.useState(0);
  const ref = React.useRef<HTMLCanvasElement>();

  const [device, adapter] = useDevice();

  const { width, height, scaledXDomain, scaledYDomain, zoom } = useVisContext();

  const settings = useAppSelector((state) => state.settings);

  const settingsRef = React.useRef(settings);
  settingsRef.current = settings;

  const tick = () => {
    if (myRenderer && !interpolate) {
      myRenderer.scatter.requestFrame(settingsRef.current);
    }
  }

  useEffect(() => {
    myRenderer?.scatter.setColor(new Uint32Array(color));
  }, [color, myRenderer]);

  useEffect(() => {
    if (bounds) {
      myRenderer?.scatter.setBounds(new Float32Array(bounds));
    } else {
      myRenderer?.scatter.setBounds(new Float32Array(Array.from({ length: n }).map(() => [5, 5, 20, 20]).flat()));
    }
  }, [bounds, myRenderer, n]);

  useEffect(() => {
    myRenderer?.scatter.setLine(line);
  }, [line, myRenderer]);

  useEffect(() => {
    let arr = Array.from({ length: n }).map(() => 0);

    (selection ?? []).forEach((value) => {
      arr[value] = 1;
    });

    myRenderer?.scatter.setSelection(selection ?? []);

    tick();
  }, [selection, myRenderer, n]);

  useEffect(() => {
    myRenderer?.scatter.setShape(new Float32Array(shape));
  }, [shape, myRenderer]);

  useEffect(() => {
    myRenderer?.scatter.setHover(hover ?? []);
    // myRenderer?.engine.setHover(hover ?? []);
  }, [hover, myRenderer]);

  useEffect(() => {
    myRenderer?.engine.addShadowPoints(shadows ?? []);
  }, [shadows, myRenderer])

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
    if (!device || !adapter) return () => { };

    let active = true;

    const scatter = new Scatter(
      n,
      ref.current.getContext('webgpu'),
      {
        background: [0.8, 0.8, 0.8, 1],
      },
      device,
      x,
      y,
    );

    const engine = scatter.engine;

    scatter.createBuffers(ref.current);

    setRenderer({ engine, scatter });

    if (interpolate) {
      setGlobalEngine(engine);
      scatter.startLoop(settingsRef);
    }

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
