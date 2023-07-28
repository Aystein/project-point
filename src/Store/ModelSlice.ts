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

export type LabelContainer =
  | {
      discriminator: 'positionedlabels';
      type: 'x' | 'y' | 'absolute';
      labels: { position: number; content: string }[];
    }
  | {
      discriminator: 'scalelabels';
      type: 'x' | 'y';
      labels: { domain: number[]; range: number[] };
    };

export interface SpatialModel extends BaseModel {
  id: EntityId;

  parameters?: EmbeddingParameters;

  // The indices of the rows this model operates on
  filter: number[];

  children: SpatialModel[];

  area: IRectangle;

  x?: number[];
  y?: number[];

  color?: number[];
  shape?: number[];

  labels?: LabelContainer[];
}

export type Model = SpatialModel;
