/* eslint-disable no-restricted-globals */
import * as d3 from 'd3-force';
import { IRectangle, Rectangle } from '../WebGL/Math/Rectangle';
import { scaleLinear } from 'd3-scale';
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';
import range from 'lodash/range';
import { VectorLike } from '../Interfaces';

interface Props {
  data: {
    X: { [key: string]: string | number }[];
    area: IRectangle;
    feature: string;
    type: string;
  };
}

const SPACE_PER_UNIT = 0.006 * 0.006;

self.onmessage = ({ data: { X, area, type, feature } }: Props) => {
  if (type !== 'init') {
    return;
  }

  self.postMessage({
    type: 'message',
    message: 'Calculating groups',
  });

  const areaRect = Rectangle.deserialize(area);

  const relativeIndices = X.map((value, i) => ({
    relativeIndex: i,
    value,
  }));

  const N = X.length;
  const groups = groupBy(relativeIndices, (value) => {
    return value.value[feature];
  });

  const Y = new Array<VectorLike>(N);

  const totalSpace = N * SPACE_PER_UNIT * 10;
  const AR = area.width / area.height;

  const nw = Math.sqrt(totalSpace / AR);
  const nh = nw * AR;

  console.log(nw, nh);
  console.log(nw * nh);
  console.log(totalSpace);
  // totalSpace = width * width * AR

  const factor = 500 / area.width;

  const scaleX = scaleLinear()
    .domain([area.x, area.x + area.width])
    .range([area.x, area.x + area.width * factor]);
  const scaleY = scaleLinear()
    .domain([area.y, area.y + area.height])
    .range([area.y, area.y + area.height * factor]);

  /**const destinationRect = new Rectangle(
    areaRect.centerX - nw,
    areaRect.centerY - nh,
    nw * 2,
    nh * 2
  );**/
  const destinationRect = areaRect

  console.log(keys(groups));

  
  const padding = destinationRect.width / (keys(groups).length + 10)
  let usedSpace = padding;

  let leftSpace = destinationRect.width - padding * (keys(groups).length + 1)

  for (const key of keys(groups)) {
    const group = groups[key];

    const portion = leftSpace * (group.length / N);
    const centerX = destinationRect.x + usedSpace + portion / 2;
    
    const centerY = destinationRect.centerY;

    const nodes = group.map(() => ({ x: centerX, y: centerY }));
    usedSpace += portion + padding;

    function boxingForce() {
        const radius = 0.006 * factor;
    
        for (let node of nodes) {
            // Of the positions exceed the box, set them to the boundary position.
            // You may want to include your nodes width to not overlap with the box.
            // node.x = Math.max(centerX - portion / 2, Math.min(centerX + portion / 2, node.x));
            //node.y = Math.max(-radius, Math.min(radius, node.y));
            const min = scaleX(centerX - portion / 3)
            const max = scaleX(centerX + portion / 3)
            if (node.x < min) {
                node.x = min
            }
            if (node.x > max) {
                node.x = max
            }
        }
    }

    var simulation = d3
      .forceSimulation(nodes)
      .force('collision', d3.forceCollide().radius(0.006 * factor).strength(5))
      //.force('x', d3.forceX(scaleX(centerX)))
      //.force('y', d3.forceY(scaleY(centerY)))
      .force('center', d3.forceCenter(scaleX(centerX), scaleY(centerY)))
      .force('bound', boxingForce)
      //.force('charge', d3.forceManyBody().strength(1))
      .stop();

    for (
      let i = 0,
        n = Math.ceil(
          Math.log(simulation.alphaMin()) /
            Math.log(1 - simulation.alphaDecay())
        );
      i < n;
      ++i
    ) {
      // console.log("TICK")
      simulation.tick();
    }

    const y = simulation
      .nodes()
      // @ts-ignore
      .map((node) => ({ x: scaleX.invert(node.x), y: scaleY.invert(node.y) }));

    console.log(y);
    group.forEach((item, i) => {
      Y[item.relativeIndex] = y[i];
    });
  }

  self.postMessage({
    type: 'finish',
    // @ts-ignore
    Y,
  });
};
