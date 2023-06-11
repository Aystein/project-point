/* eslint-disable no-restricted-globals */
import * as d3 from 'd3-force';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { convergeLayout, forceNormalization } from '../Layouts/ForceUtil';
import { VectorLike } from '../Interfaces';

interface Props {
  data: {
    n: number;
    area: IRectangle;
    type: string;
  };
}

self.onmessage = ({ data: { n, area, type } }: Props) => {
  if (type !== 'init') {
    return;
  }

  self.postMessage({
    type: 'message',
    message: 'Calculating embedding ...',
  });

  let nodes: Partial<VectorLike>[] = Array.from({ length: n }).map(() => ({}));

  const [scaleX, scaleY, radius] = forceNormalization(area);

  self.postMessage({
    type: 'message',
    message: 'Force layout ...',
  });

  var simulation = d3
    .forceSimulation(nodes)
    .force('collision', d3.forceCollide().radius(radius))
    .force('x', d3.forceX(scaleX(area.x + area.width / 2)))
    .force('y', d3.forceY(scaleY(area.y + area.height / 2)))
    .stop();

  convergeLayout(simulation);

  self.postMessage({
    type: 'finish',
    // @ts-ignore
    Y: simulation
      .nodes()
      .map((node) => ({ x: scaleX.invert(node.x), y: scaleY.invert(node.y) })),
  });
};
