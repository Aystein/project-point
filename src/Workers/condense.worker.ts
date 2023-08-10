import * as d3 from 'd3-force';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { convergeLayout, forceNormalization, forceNormalizationNew } from '../Layouts/ForceUtil';
import { VectorLike } from '../Interfaces';
import { scaleLinear } from 'd3-scale';
import { UpdateText } from './util';
import { POINT_RADIUS } from '../Layouts/Globals';

interface Props {
  data: {
    n: number;
    area: IRectangle;
    axis: 'x' | 'y' | 'xy';
    type: string;
    xLayout?: number[];
    yLayout?: number[];
  };
}

self.onmessage = ({
  data: { n, area, type, axis, xLayout, yLayout },
}: Props) => {
  if (type !== 'init') {
    return;
  }

  UpdateText(self, 'Calculating embedding...');

  let nodes: Partial<VectorLike>[] = Array.from({ length: n }).map(() => ({}));

  const layoutScaleX = scaleLinear()
    .domain([0, 1])
    .range([area.x, area.x + area.width]);
  const layoutScaleY = scaleLinear()
    .domain([0, 1])
    .range([area.y, area.y + area.height]);

  const [scaleX, scaleY, worldX, worldY, radius] = forceNormalizationNew(area);

  UpdateText(self, 'Force layout...');

  var simulation = d3
    .forceSimulation(nodes)
    .force('collision', d3.forceCollide().radius(radius));

  if (axis === 'x') {
    simulation.force('x', d3.forceX(scaleX(area.x + area.width / 2)));
    simulation.force(
      'y',
      d3.forceY().y((node, i) => scaleY(layoutScaleY(yLayout[i])))
    );
  }
  if (axis === 'y') {
    simulation.force('y', d3.forceY(scaleY(area.y + area.height / 2)));
    simulation.force(
      'x',
      d3.forceX().x((node, i) => scaleX(layoutScaleX(xLayout[i])))
    );
  }
  if (axis === 'xy') {
    simulation.force('x', d3.forceX(scaleX(area.x + area.width / 2)));
    simulation.force('y', d3.forceY(scaleY(area.y + area.height / 2)));
  }
  simulation.stop();

  // convergeLayout(simulation);

  const A = n * Math.PI * (POINT_RADIUS * POINT_RADIUS);
  const r = Math.sqrt(A / Math.PI) / 2;
  // A = pi * r^2

  self.postMessage({
    type: 'finish',
    // @ts-ignore
    Y: simulation
      .nodes()
      .map((node) => ({ x: worldX(0.5 + -(r / 2) + Math.random() * r), y: worldY(0.5 + -(r / 2) + Math.random() * r) })),

    xLayout: axis != 'y' ? simulation.nodes().map(() => 0.5) : xLayout,
    yLayout: axis != 'x' ? simulation.nodes().map(() => 0.5) : yLayout,
  });
};
