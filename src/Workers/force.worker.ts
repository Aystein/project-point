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

  var simulation = d3
    .forceSimulation(Y)
    .force('collision', d3.forceCollide().radius(radius))
    .force(
      'x',
      d3.forceX().x(function (d) {
        return normalizeX(Y[d.index].x);
      })
    )
    .force(
      'y',
      d3.forceY().y(function (d) {
        return normalizeY(Y[d.index].y);
      })
    )
    .stop();

  //convergeLayout(simulation);

  console.log(simulation.nodes().map((node) =>  worldX(normalizeX.invert(node.x))))
  self.postMessage({
    type: 'finish',
    Y: simulation.nodes().map((node) => ({
      x: worldX(node.x),
      y: worldY(node.y),
    })),
    xLayout,
    yLayout,
  });
};
