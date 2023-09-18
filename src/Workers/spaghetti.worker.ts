/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-globals */
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';
import { VectorLike } from '../Interfaces';
import {
  forceNormalizationNew,
} from '../Layouts/ForceUtil';
import { LabelContainer } from '../Store/ModelSlice';
import { IRectangle } from '../WebGL/Math/Rectangle';
import mapValues from 'lodash/mapValues';
import { nanoid } from '@reduxjs/toolkit';
import { stratify, treemap, treemapSlice } from 'd3-hierarchy';
import { POINT_RADIUS } from '../Layouts/Globals';
import { scaleLinear } from 'd3-scale';
import { getMinMax } from '../Util';

interface Props {
  data: {
    X: { [key: string]: string | number }[];
    area: IRectangle;
    features: string[];
    secondary: string;
    type: string;
    axis: 'x' | 'y';
    Y_in: VectorLike[];
  };
}

var nest = function (seq, fns: ((v) => unknown)[]) {
  if (!fns.length)
    return seq;
  var first = fns[0];
  var rest = fns.slice(1);
  return mapValues(groupBy(seq, first), function (value) {
    return nest(value, rest)
  });
};

function position(min: number, max: number, i: number, n: number) {
  const step = (max - min) / n;

  return {
    min: min + i * step,
    max: min + (i + 1) * step,
  }
}

self.onmessage = ({
  data: { X, area, type, features, axis, secondary },
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
    return value.value[features[0]];
  });

  const hierarchy = nest(relativeIndices, features.map((feature) => {
    return (value) => {
      return value.value[feature];
    }
  }))

  const maxGroupLengths = features.map((feature) => {
    return new Set(X.map((value) => value[feature])).size
  })
  console.log(maxGroupLengths);

  const Y = new Array<VectorLike>(N);

  const [scaleX, scaleY, worldX, worldY, radius] = forceNormalizationNew(area);

  let stepSize = 1 / (keys(groups).length + 1);
  let centerX = stepSize;

  const maxGroupLength = Math.max(...keys(groups).map((key) => groups[key].length))

  console.log(hierarchy);
  let totalHeight = 0;

  const linearScale = scaleLinear().domain(getMinMax(X.map((value) => value[secondary] as number))).range(axis === 'y' ? [area.x, area.x + area.width] : [area.y, area.y + area.height])

  function traverse(group) {
    const len = keys(group).length;
    let y = 0;

    keys(group).forEach((value) => {
      const set = group[value];

      if (Array.isArray(set)) {
        // one line
        console.log(set, len);
        y += POINT_RADIUS * 2;
        set.forEach((item) => {
          const secAxis = linearScale(item.value[secondary]);
          const primary = totalHeight + y;

          Y[item.relativeIndex] = { x: axis === 'y' ? secAxis : primary, y: axis === 'y' ? primary : secAxis };
        })
      } else {
        // traverse
        traverse(set);
      }
    })

    totalHeight += y;
    totalHeight += POINT_RADIUS * 5;
  }

  traverse(hierarchy);


  /**for (const key of keys(groups)) {
    const group = groups[key];

    labels.labels.push({ position: centerX, content: key });

    group.forEach((item, i) => {
      let secondary = i / maxGroupLength;
      let primary = centerX;

      if (features.length > 1) {
        // hierarchy[features[0]][features[1]]
      }

      Y[item.relativeIndex] = { x: axis === 'y' ? secondary : primary, y: axis === 'y' ? primary : secondary };
    });

    centerX += stepSize;
  }**/ 

  self.postMessage({
    type: 'finish',
    // @ts-ignore
    Y: Y.map((value) => ({ x: value.x, y: axis === 'y' ? area.y + value.y : value.y })),
    labels: [labels],
  });
};
