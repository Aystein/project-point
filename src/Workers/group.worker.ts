/* eslint-disable no-restricted-globals */
import * as d3 from 'd3-force';
import { IRectangle, Rectangle } from '../WebGL/Math/Rectangle';
import { scaleLinear } from 'd3-scale';
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';
import { VectorLike } from '../Interfaces';
import {
  convergeLayout,
  forceNormalization,
  forceNormalizationNew,
} from '../Layouts/ForceUtil';
import { LabelContainer } from '../Store/ModelSlice';

interface Props {
  data: {
    X: { [key: string]: string | number }[];
    area: IRectangle;
    feature: string;
    type: string;
    axis: 'x' | 'y';
    xLayout: number[];
    yLayout: number[];
  };
}

self.onmessage = ({
  data: { X, area, type, feature, xLayout, yLayout },
}: Props) => {
  if (type !== 'init') {
    return;
  }

  const labels: LabelContainer = {
    discriminator: 'positionedlabels',
    type: 'x',
    labels: [],
  };

  self.postMessage({
    type: 'message',
    message: 'Calculating groups',
  });

  const relativeIndices = X.map((value, i) => ({
    relativeIndex: i,
    value,
  }));

  const N = X.length;
  const groups = groupBy(relativeIndices, (value) => {
    return value.value[feature];
  });

  const Y = new Array<VectorLike>(N);

  const [scaleX, scaleY, worldX, worldY, radius] = forceNormalizationNew(area);

  const padding = 1 / (keys(groups).length + 10);
  let usedSpace = padding;

  let leftSpace = 1 - padding * (keys(groups).length + 1);

  for (const key of keys(groups)) {
    const group = groups[key];

    const portion = leftSpace * (group.length / N);
    const centerX = usedSpace + portion / 2;

    labels.labels.push({ position: centerX, content: key });

    const Y_group = group.map((entry) => ({
      x: centerX,
      y: yLayout[entry.relativeIndex],
    }));
    const nodes = group.map((entry) => ({
      x: centerX,
      y: yLayout[entry.relativeIndex],
    }));
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
      .force('collision', d3.forceCollide().radius(radius))
      //.force('center', d3.forceCenter(scaleX(centerX), scaleY(centerY)))
      .force(
        'x',
        d3.forceX().x(function (d) {
          return scaleX(Y_group[d.index].x);
        })
      )
      .force(
        'y',
        d3.forceY().y(function (d) {
          return scaleY(Y_group[d.index].y);
        })
      )
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
    Y: Y.map((value) => ({ x: worldX(value.x), y: worldY(value.y) })),
    xLayout: Y.map((value) => value.x),
    yLayout: Y.map((value) => value.y),
    labels,
  });
};
