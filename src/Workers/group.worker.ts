/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-globals */
import groupBy from 'lodash/groupBy';
import keys from 'lodash/keys';
import { VectorLike } from '../Interfaces';
import {
  forceNormalizationNew
} from '../Layouts/ForceUtil';
import { LabelContainer } from '../Store/interfaces';
import { IRectangle, Rectangle } from '../WebGL/Math/Rectangle';
import { RatioSquarifyTilingFactory, stratify, treemap, treemapSlice, treemapSquarify } from 'd3-hierarchy';
import { nanoid } from '@reduxjs/toolkit';
import { fillRect } from './util';
import { POINT_RADIUS } from '../Layouts/Globals';
import { Stream } from 'stream';

interface Props {
  data: {
    X: { [key: string]: string | number }[];
    area: IRectangle;
    feature: string;
    type: string;
    strategy: 'slice' | 'treemap';
  };
}


self.onmessage = ({
  data: { X, area, type, feature, strategy },
}: Props) => {
  if (type !== 'init') {
    return;
  }

  const area_rect = Rectangle.deserialize(area);

  const labels: LabelContainer = {
    discriminator: 'annotations',
    type: 'xy',
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

  const data: { id, parent? }[] = [{ id: 'root' }];

  for (const key of keys(groups)) {
    data.push({ id: key, parent: 'root' })

    const group = groups[key];
    group.forEach((item) => {
      data.push({ id: nanoid(), parent: key })
    });
  }

  let algorithm = strategy === 'slice' ? treemapSlice : treemapSquarify;
  
  const root = stratify<{ id, parent? }>().id((d) => d.id).parentId((d) => d.parent)(data).count();
  const map = treemap().tile(algorithm).paddingTop(POINT_RADIUS * 3).size([area.width, area.height])(root);

  for (const key of keys(groups)) {
    const group = groups[key];
    const c = map.children.find((child) => child.id === key);

    const group_area: IRectangle = { x: c.x0 + area.x, y: c.y0 + area.y, width: c.x1 - c.x0, height: c.y1 - c.y0 };

    const { Y: Y_group, bounds: realBounds } = fillRect(group_area, group.length, POINT_RADIUS)

    const normalizedW = area_rect.percentY(POINT_RADIUS * 12) - area_rect.percentY(0);

    labels.labels.push({ position: {
      x: area_rect.percentX(realBounds.x),
      y: area_rect.percentY(realBounds.y) - normalizedW,
      width: area_rect.percentX(realBounds.x + realBounds.width) - area_rect.percentX(realBounds.x),
      height: normalizedW,
    }, content: key })

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