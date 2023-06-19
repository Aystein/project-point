import { scaleLinear } from 'd3-scale';
import { VectorLike } from '../Interfaces';
import * as d3 from 'd3-force';
import { convergeLayout, forceNormalization } from '../Layouts/ForceUtil';
import { getBounds, getMinMax } from '../Util';

/* eslint-disable no-restricted-globals */
interface UMAPWorkerProps {
  data: {
    area;
    type;
    N;
    X: number[];
    xLayout: number[];
    yLayout: number[];
  };
}

self.onmessage = ({
  data: { area, xLayout, yLayout, type, N, X },
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

  const [min, max] = getMinMax(X);

  let scale = scaleLinear().domain([min, max]).range([area.x + area.width * 0.01, area.x + area.width * 0.99]);


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
    .forceSimulation(Y)
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
  });
};
