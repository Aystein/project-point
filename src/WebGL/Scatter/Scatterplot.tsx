import { useEffect, useState } from 'react';
import { SpatialModel } from '../../Store/ModelSlice';
import { useVisContext } from '../VisualizationContext';
import * as React from 'react';
import { ScatterTrace } from '../Math/ScatterTrace';

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
}: {
  n: number;
  x: number[];
  x2: string | ColumnTemp;
  y: number[];
  model: SpatialModel;
  color?: string | string[];
  size?: number[];
  opacity?: number[];
  globalConfig?: GlobalConfig;
  hover: number;
  interpolate: boolean;
}) {
  const [myRenderer, setRenderer] = useState<ScatterTrace>();

  const [timestamp, setTimestamp] = React.useState(0);

  const {
    ref,
    width,
    height,
    registerRenderFunction,
    requestFrame,
    scaledXDomain,
    scaledYDomain,
    zoom,
  } = useVisContext();

  const render = (renderer: THREE.WebGLRenderer) => {
    if (!myRenderer) {
      return;
    }

    myRenderer.render(renderer, 0, 0);
  };

  const renderRef = React.useRef(render);
  renderRef.current = render;

  useEffect(() => {
    myRenderer?.setColor(color);
  }, [color, myRenderer]);

  useEffect(() => {
    registerRenderFunction((renderer) => {
      renderRef.current(renderer);
    });
    setTimeout(() => requestFrame(), 500);
  }, []);

  useEffect(() => {
    myRenderer?.setHover(hover);
  }, [hover, myRenderer]);

  useEffect(() => {
    if (!myRenderer) return;

    myRenderer.updateBounds(
      scaledXDomain.domain(),
      scaledYDomain.domain(),
      zoom,
      width,
      height,
      model.bounds
    );
    // 600 / 10 -> 60
    requestFrame();
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
      myRenderer.setX(x);
      myRenderer.setY(y);

      requestFrame();
    }
  }, [x, y, myRenderer]);

  useEffect(() => {
    if (!model) return;

    const rend = new ScatterTrace(n);

    rend.onDirty = () => {
      requestFrame();
    };

    rend.initialize({
      x,
      y,
      bounds: model.bounds,
    });

    setRenderer(rend);

    requestFrame();
  }, [setRenderer, ref, n]);

  return null;
}
