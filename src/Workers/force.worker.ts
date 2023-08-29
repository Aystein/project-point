import { VectorLike } from '../Interfaces';
import * as d3 from 'd3-force';
import { convergeLayout, forceNormalizationNew, scaleToWorld } from '../Layouts/ForceUtil';

/* eslint-disable no-restricted-globals */
interface UMAPWorkerProps {
  data: {
    area;
    type;
    N;
    axis: 'x' | 'y';
    Y_in: VectorLike[];
    X: number[];
  };
}

self.onmessage = ({
  data: { area, X, Y_in, type, N, axis },
}: UMAPWorkerProps) => {
  if (type !== 'init') {
    return;
  }

  const [worldX, worldY] = scaleToWorld(area);

  self.postMessage({
    type: 'finish',
    Y: Y_in.map((node, i) => ({
      x: axis === 'x' ? worldX(X[i]) : node.x,
      y: axis === 'y' ? worldY(X[i]) : node.y,
    })),
  });
};
