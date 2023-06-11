/* eslint-disable no-restricted-globals */
import * as d3 from 'd3-force';
import { IRectangle, Rectangle } from '../WebGL/Math/Rectangle';
import { scaleLinear } from 'd3-scale';
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';
import range from 'lodash/range';
import { VectorLike } from '../Interfaces';
import { convergeLayout, forceNormalization } from '../Layouts/ForceUtil';

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

  const [scaleX, scaleY, radius] = forceNormalization(area);

  const destinationRect = areaRect;

  const padding = destinationRect.width / (keys(groups).length + 10);
  let usedSpace = padding;

  let leftSpace = destinationRect.width - padding * (keys(groups).length + 1);

  for (const key of keys(groups)) {
    const group = groups[key];

    const portion = leftSpace * (group.length / N);
    const centerX = destinationRect.x + usedSpace + portion / 2;

    const centerY = destinationRect.centerY;

    const nodes = group.map(() => ({ x: centerX, y: centerY }));
    usedSpace += portion + padding;

    function boxingForce() {
      for (let node of nodes) {
        const min = scaleX(centerX - portion / 3);
        const max = scaleX(centerX + portion / 3);
        if (node.x < min) {
          node.x = min;
        }
        if (node.x > max) {
          node.x = max;
        }
      }
    }

    var simulation = d3
      .forceSimulation(nodes)
      .force('collision', d3.forceCollide().radius(radius).strength(5))
      .force('center', d3.forceCenter(scaleX(centerX), scaleY(centerY)))
      .force('bound', boxingForce)
      .stop();

    convergeLayout(simulation);

    const y = simulation
      .nodes()
      // @ts-ignore
      .map((node) => ({ x: scaleX.invert(node.x), y: scaleY.invert(node.y) }));

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
