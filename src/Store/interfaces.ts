import { EntityId, EntityState, createEntityAdapter } from '@reduxjs/toolkit';
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


export type LinearScaleConfiguration = {
  channel: 'x' | 'y';
  type: 'numericalscale';
  column: string;
}

export type CondenseConfiguration = {
  channel: 'x' | 'y' | 'xy',
  type: 'condense'
}

export type ColorConfiguration = {
  channel: 'color',
  type: 'setcolor',
  column: string,
  featureType: 'categorical' | 'numerical'
}

export type LineConfiguration = {
  channel: 'line',
  type: 'setline',
  column: string,
}

export type GroupConfiguration = {
  channel: 'xy',
  type: 'group',
  column: string,
  strategy: 'slice' | 'treemap'
}

export type UmapConfiguration = {
  channel: 'xy' | 'x' | 'y',
  type: 'umap',
  columns: string[],
  perplexity: number,
  neighbors: number,
}

export type LayoutConfiguration = LinearScaleConfiguration | CondenseConfiguration | ColorConfiguration | GroupConfiguration | UmapConfiguration | LineConfiguration;

export const layoutAdapter = createEntityAdapter<LayoutConfiguration>({
  selectId: (model) => model.channel
});

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

  layoutConfigurations: EntityState<LayoutConfiguration>;
}

export type Model = SpatialModel;
