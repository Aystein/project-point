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
import { EntryOptionPlugin } from 'webpack';

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

    usedSpace += portion + padding;

    const extent = portion / 3;

    group.forEach((item, i) => {
      Y[item.relativeIndex] = { x: centerX + (-2 + Math.random()) * extent, y: yLayout[item.relativeIndex] };
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
