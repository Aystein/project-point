import { EntityId, EntityState, createEntityAdapter } from '@reduxjs/toolkit';
import { IRectangle } from '../WebGL/Math/Rectangle';

interface BaseModel {
  id: EntityId;
}

export type EmbeddingParameters = {
  embedding: 'tsne';
  perplexity: number;
};

export type PositionLabelContainer = {
  discriminator: 'positionedlabels';
  type: 'x' | 'y';
  labels: { position: number; content: string }[];
}

export type ScaleLabelContainer = {
  discriminator: 'scalelabels';
  type: 'x' | 'y';
  labels: { domain: number[]; range: number[] };
}

export type AnnotationLabelContainer = {
  discriminator: 'annotations';
  type: 'xy',
  labels: { position: IRectangle; content: string }[]
}

export type LabelContainer = PositionLabelContainer | ScaleLabelContainer | AnnotationLabelContainer;


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

export type SpaghettiConfiguration = {
  channel: 'xy',
  type: 'spaghetti',
  columns: string[],
  timeColumn: string,
}

export type UmapConfiguration = {
  channel: 'xy' | 'x' | 'y',
  type: 'umap',
  columns: string[],
  perplexity: number,
  neighbors: number,
}

export type LayoutConfiguration = LinearScaleConfiguration | CondenseConfiguration | ColorConfiguration | GroupConfiguration | UmapConfiguration | LineConfiguration | SpaghettiConfiguration;

export const layoutAdapter = createEntityAdapter<LayoutConfiguration>({
  selectId: (model) => model.channel
});

export type ColorFilter = {
  color: string,
  column: string,
  active: boolean,
}[]

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

  colorFilter?: ColorFilter,

  layoutConfigurations: EntityState<LayoutConfiguration>;
}

export type Model = SpatialModel;
