import { EntityId } from '@reduxjs/toolkit';
import { Boundaries, VectorLike } from './Interfaces';
export declare function isEntityId(value: any): value is EntityId;
export declare function getBounds(spatial: VectorLike[]): Boundaries;
