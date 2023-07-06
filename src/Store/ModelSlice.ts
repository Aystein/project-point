import { EntityId } from '@reduxjs/toolkit';
import { Boundaries, VectorLike } from '../Interfaces';
import { IRectangle } from '../WebGL/Math/Rectangle';

interface BaseModel {
  id: EntityId;
}

export type EmbeddingParameters = {
  embedding: 'tsne';
  perplexity: number;
};

export interface SpatialModel extends BaseModel {
  oid: 'spatial';
  id: EntityId;

  parameters?: EmbeddingParameters;

  // The boundaries of the spatial data
  bounds: Boundaries;

  // The indices of the rows this model operates on
  filter: number[];

  children: SpatialModel[];

  area: IRectangle;

  x?: number[]
  y?: number[]

  color?: number[]
  shape?: number[]
}

export type Model = SpatialModel;
