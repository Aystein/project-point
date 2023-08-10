/* eslint-disable no-restricted-globals */
import { UMAP } from 'umap-js';
import * as d3 from 'd3-force';
import { scaleLinear } from 'd3-scale';
import { getBounds, getMinMax, normalizeVectors01 } from '../Util';
import { VectorLike } from '../Interfaces';
import {
  convergeLayout,
  forceNormalization,
  forceNormalizationNew,
} from '../Layouts/ForceUtil';
import { POINT_RADIUS } from '../Layouts/Globals';

interface UMAPWorkerProps {
  data: {
    X;
    D;
    N;
    area;
    type;
    xLayout?: number[];
    yLayout?: number[];
    axis: 'x' | 'y' | 'xy';
  };
}

self.onmessage = ({
  data: { X, D, N, area, type, xLayout, yLayout, axis },
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
  let nodes: VectorLike[];

  if (axis === 'x') {
    const data = embedding.map((arr) => arr[0]);
    const scale = scaleLinear().domain(getMinMax(data)).range([0, 1]);
    Y = data.map((arr, i) => ({ x: scale(arr), y: yLayout[i] }));
  } else if (axis === 'y') {
    const data = embedding.map((arr) => arr[0]);
    const scale = scaleLinear().domain(getMinMax(data)).range([0, 1]);
    Y = data.map((arr, i) => ({ y: scale(arr), x: xLayout[i] }));
  } else if (axis === 'xy') {
    Y = embedding.map((arr) => ({ x: arr[0], y: arr[1] }));
    Y = normalizeVectors01(Y);
  }

  nodes = structuredClone(Y);

  const [normalizeX, normalizeY, worldX, worldY, radius] =
    forceNormalizationNew(area);

  self.postMessage({
    type: 'message',
    message: 'Force layout ...',
  });


  self.postMessage({
    type: 'finish',
    Y: Y.map((node) => ({
      x: worldX(node.x),
      y: worldY(node.y),
    })),
    xLayout: Y.map((value) => value.x),
    yLayout: Y.map((value) => value.y),
  });
};
