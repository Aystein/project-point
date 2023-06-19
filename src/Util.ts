import { EntityId } from '@reduxjs/toolkit';
import { Boundaries, VectorLike } from './Interfaces';

export function isEntityId(value): value is EntityId {
  return typeof value === 'string' || typeof value === 'number';
}

export function getMinMax(values: number[]) {
  let minX = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;

  values.forEach((sample) => {
    minX = Math.min(minX, sample);
    maxX = Math.max(maxX, sample);
  });

  return [minX, maxX];
}

export function getBounds(spatial: VectorLike[]): Boundaries {
  // Get rectangle that fits around data set
  let minX = 1000;
  let maxX = -1000;
  let minY = 1000;
  let maxY = -1000;

  spatial.forEach((sample) => {
    minX = Math.min(minX, sample.x);
    maxX = Math.max(maxX, sample.x);
    minY = Math.min(minY, sample.y);
    maxY = Math.max(maxY, sample.y);
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
  };
}
