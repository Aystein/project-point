/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-globals */
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';
import { VectorLike } from '../Interfaces';
import {
  forceNormalizationNew
} from '../Layouts/ForceUtil';
import { LabelContainer } from '../Store/ModelSlice';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { stratify, treemap, treemapSquarify } from 'd3-hierarchy';
import { nanoid } from '@reduxjs/toolkit';
import { fillRect } from './util';
import { POINT_RADIUS } from '../Layouts/Globals';

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
  data: { X, area, type, feature, yLayout },
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

/**   for (const key of keys(groups)) {
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
**/
  const data: { id, parent? }[] = [{ id: 'root' }];

  for (const key of keys(groups)) {
    data.push({ id: key, parent: 'root' })

    const group = groups[key];
    group.forEach((item) => {
      data.push({ id: nanoid(), parent: key })
    });
  }

  
  const root = stratify<{ id, parent? }>().id((d) => d.id).parentId((d) => d.parent)(data).count();
  const map = treemap().tile(treemapSquarify).padding(POINT_RADIUS * 3).size([area.width, area.height])(root);
  console.log(map);

  for (const key of keys(groups)) {
    const group = groups[key];
    const c = map.children.find((child) => child.id === key);
    const group_area: IRectangle = { x: c.x0 + area.x, y: c.y0 + area.y, width: c.x1 - c.x0, height: c.y1 - c.y0 };

    const Y_group = fillRect(group_area, group.length, POINT_RADIUS)

    group.forEach((item, i) => {
      Y[item.relativeIndex] = Y_group[i];
    });
  }


  self.postMessage({
    type: 'finish',
    // @ts-ignore
    Y,// : Y.map((value) => ({ x: worldX(value.x), y: worldY(value.y) })),
    labels: [labels],
  });
};
