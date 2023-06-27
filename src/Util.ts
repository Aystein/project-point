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


/**
 * Performs a test if a point is inside a polygon based on the idea from
 * https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
 * 
 * This method will not need the same start/end point since it wraps around the edges of the array
 * 
 * @param {*} test a point to test against
 * @param {*} polygon a polygon in the form [[x,y], [x,y], ...]
 * @returns true if the point lies inside the polygon, false otherwise
 */
export function pointInPolygon(testx, testy, polygon) {
  let intersections = 0;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [prevX, prevY] = polygon[j];
      const [x, y] = polygon[i];

      // count intersections
      if (((y > testy) != (prevY > testy)) && (testx < (prevX - x) * (testy - y) / (prevY - y) + x)) {
          intersections++;
      }
  }

  // point is in polygon if intersection count is odd
  return intersections & 1;
}