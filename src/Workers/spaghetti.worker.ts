/* eslint-disable no-restricted-globals */
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';
import { VectorLike } from '../Interfaces';
import {
  forceNormalizationNew,
} from '../Layouts/ForceUtil';
import { LabelContainer } from '../Store/ModelSlice';
import { IRectangle } from '../WebGL/Math/Rectangle';

interface Props {
  data: {
    X: { [key: string]: string | number }[];
    area: IRectangle;
    feature: string;
    type: string;
    axis: 'x' | 'y';
  };
}

self.onmessage = ({
  data: { X, area, type, feature, axis },
}: Props) => {
  if (type !== 'init') {
    return;
  }

  const labels: LabelContainer = {
    discriminator: 'positionedlabels',
    type: axis,
    labels: [],
  };

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

  let stepSize = 1 / (keys(groups).length + 1);
  let centerX = stepSize;
  
  for (const key of keys(groups)) {
    const group = groups[key];

    labels.labels.push({ position: centerX, content: key });

    group.forEach((item, i) => {
      Y[item.relativeIndex] = { x: axis === 'y' ? i / group.length : centerX, y: axis === 'y' ? centerX : i / group.length };
    });

    centerX += stepSize;
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
