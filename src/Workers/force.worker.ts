import { VectorLike } from '../Interfaces';
import * as d3 from 'd3-force';
import { convergeLayout, forceNormalizationNew } from '../Layouts/ForceUtil';

/* eslint-disable no-restricted-globals */
interface UMAPWorkerProps {
  data: {
    area;
    type;
    N;
    xLayout: number[];
    yLayout: number[];
  };
}

self.onmessage = ({
  data: { area, xLayout, yLayout, type, N },
}: UMAPWorkerProps) => {
  if (type !== 'init') {
    return;
  }

  self.postMessage({
    type: 'message',
    message: 'Calculating embedding ...',
  });

  // Compute initial data
  let Y = new Array<VectorLike>(N);

  for (let i = 0; i < N; i++) {
    Y[i] = { x: xLayout[i], y: yLayout[i] };
  }

  self.postMessage({
    type: 'message',
    message: 'Force layout ...',
  });

  const [normalizeX, normalizeY, worldX, worldY, radius] =
    forceNormalizationNew(area);

  self.postMessage({
    type: 'finish',
    Y: Y.map((node) => ({
      x: worldX(node.x),
      y: worldY(node.y),
    })),
    xLayout,
    yLayout,
  });
};
