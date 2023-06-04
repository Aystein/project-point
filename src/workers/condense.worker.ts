/* eslint-disable no-restricted-globals */
import * as d3 from 'd3-force';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { scaleLinear } from 'd3-scale';

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

  const centerX = area.x + area.width / 2;
  const centerY = area.y + area.height / 2;

  let nodes = Array.from({ length: n }).map(() => ({ }));

  const factor = 500 / area.width

  const scaleX = scaleLinear()
  .domain([area.x, area.x + area.width])
  .range([
    area.x,
    area.x + area.width * factor,
  ])
  const scaleY = scaleLinear()
    .domain([area.y, area.y + area.height])
    .range([
      area.y,
      area.y + area.height * factor,
    ])
  
  self.postMessage({
    type: 'message',
    message: 'Force layout ...',
  });
  console.log(0.002 * factor)
  var simulation = d3
    .forceSimulation(nodes)
    .force(
      'collision',
      d3.forceCollide().radius(0.006 * factor)
    )
    .force('x', d3.forceX(scaleX(centerX)))
    .force('y', d3.forceY(scaleY(centerY)))
    //.force('charge', d3.forceManyBody().strength(1))
    .stop();

  for (
    var i = 0,
      n = Math.ceil(
        Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
      );
    i < n;
    ++i
  ) {
    // console.log("TICK")
    simulation.tick();
  }

  self.postMessage({
    type: 'finish',
    // @ts-ignore
    Y: simulation.nodes().map((node) => ({ x: scaleX.invert(node.x), y: scaleY.invert(node.y) })),
  });
};
