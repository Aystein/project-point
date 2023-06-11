/* eslint-disable no-restricted-globals */
import { UMAP } from 'umap-js';
import * as d3 from 'd3-force';
import { scaleLinear } from 'd3-scale';
import { getBounds } from '../Util';
import { VectorLike } from '../Interfaces';
import { convergeLayout, forceNormalization } from '../Layouts/ForceUtil';

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

  console.log(embedding);

  let Y: VectorLike[];
  let nodes: VectorLike[];

  if (axis === 'x') {
    Y = embedding.map((arr, i) => ({ x: arr[0], y: yLayout[i] }));
  } else if (axis === 'y') {
    Y = embedding.map((arr, i) => ({ y: arr[0], x: xLayout[i] }));
  } else if (axis === 'xy') {
    Y = embedding.map((arr) => ({ x: arr[0], y: arr[1] }));
  }

  nodes = structuredClone(Y);

  const [normalizeX, normalizeY, radius] = forceNormalization(area);

  const embeddingBounds = getBounds(Y);

  const scaleX = scaleLinear()
    .domain([embeddingBounds.minX, embeddingBounds.maxX])
    .range([area.x + area.width * 0.01, area.x + area.width * 0.99]);
  const scaleY = scaleLinear()
    .domain([embeddingBounds.minY, embeddingBounds.maxY])
    .range([area.y + area.height * 0.01, area.y + area.height * 0.99]);

  Y = Y.map((value) => ({
    x: normalizeX(scaleX(value.x)),
    y: normalizeY(scaleY(value.y)),
  }));

  self.postMessage({
    type: 'message',
    message: 'Force layout ...',
  });

  var simulation = d3
    .forceSimulation(nodes)
    .force('collision', d3.forceCollide().radius(radius))
    .force(
      'x',
      d3.forceX().x(function (d) {
        return Y[d.index].x;
      })
    )
    .force(
      'y',
      d3.forceY().y(function (d) {
        return Y[d.index].y;
      })
    )
    .stop();

  convergeLayout(simulation);

  self.postMessage({
    type: 'finish',
    Y: simulation.nodes().map((node) => ({
      x: normalizeX.invert(node.x),
      y: normalizeY.invert(node.y),
    })),
    xLayout: Y.map((value) => normalizeX.invert(value.x)),
    yLayout: Y.map((value) => normalizeY.invert(value.y)),
  });
};
