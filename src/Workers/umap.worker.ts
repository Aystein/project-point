/* eslint-disable no-restricted-globals */
import { UMAP } from 'umap-js';
import { scaleLinear } from 'd3-scale';
import { getMinMax, normalizeVectors01 } from '../Util';
import { VectorLike } from '../Interfaces';
import {
  scaleToWorld,
} from '../Layouts/ForceUtil';
import { LabelContainer } from '../Store/interfaces';

interface UMAPWorkerProps {
  data: {
    X;
    D;
    N;
    area;
    type;
    Y_in: VectorLike[];
    axis: 'x' | 'y' | 'xy';
  };
}

self.onmessage = ({
  data: { X, D, N, area, type, Y_in, axis },
}: UMAPWorkerProps) => {
  if (type !== 'init') {
    return;
  }

  const nComponents = axis === 'xy' ? 2 : 1;

  self.postMessage({
    type: 'message',
    message: 'Calculating embedding ...',
  });

  const umap = new UMAP({
    nComponents,
    nEpochs: 200,
    nNeighbors: 15,
  });
  const embedding = umap.fit(X);

  let Y: VectorLike[];
  const labels: LabelContainer[] = [];

  if (axis === 'x') {
    const data = embedding.map((arr) => arr[0]);
    const scale = scaleLinear().domain(getMinMax(data)).range([0, 1]);
    Y = data.map((arr, i) => ({ x: scale(arr), y: Y_in[i].y }));

    labels.push({
      discriminator: 'positionedlabels',
      type: 'x',
      labels: [{ position: 0.5, content: 'umap-x' }],
    })
  } else if (axis === 'y') {
    const data = embedding.map((arr) => arr[0]);
    const scale = scaleLinear().domain(getMinMax(data)).range([0, 1]);
    Y = data.map((arr, i) => ({ y: scale(arr), x: Y_in[i].x }));

    labels.push({
      discriminator: 'positionedlabels',
      type: 'y',
      labels: [{ position: 0.5, content: 'umap-y' }],
    })
  } else if (axis === 'xy') {
    Y = embedding.map((arr) => ({ x: arr[0], y: arr[1] }));
    Y = normalizeVectors01(Y);

    labels.push({
      discriminator: 'positionedlabels',
      type: 'x',
      labels: [{ position: 0.5, content: 'umap-x' }],
    })
    labels.push({
      discriminator: 'positionedlabels',
      type: 'y',
      labels: [{ position: 0.5, content: 'umap-y' }],
    })
  }

  const [worldX, worldY] = scaleToWorld(area);

  self.postMessage({
    type: 'message',
    message: 'Force layout ...',
  });

  console.log(Y);

  self.postMessage({
    type: 'finish',
    Y: Y.map((node) => ({
      x: axis !== 'y' ? worldX(node.x) : node.x,
      y: axis !== 'x' ? worldY(node.y) : node.y,
    })),
    labels,
  });
};
