import { EntityId, EntityState, createEntityAdapter } from '@reduxjs/toolkit';
import { IRectangle } from '../WebGL/Math/Rectangle';
import { VectorLike } from '../Interfaces';

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
  channel: 'x' | 'y',
  type: 'condense'
}

export type FillRectConfiguration = {
  channel: 'xy',
  type: 'fillrect',
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

export type DualAxisConfiguration = {
  channel: 'xy',
  type: 'dual_axis',
  xColumn: string,
  yColumn: string,
}

export type UmapConfiguration = {
  channel: 'xy' | 'x' | 'y',
  type: 'umap',
  columns: string[],
  perplexity: number,
  neighbors: number,
}

export type LayoutConfiguration = DualAxisConfiguration | LinearScaleConfiguration | CondenseConfiguration | ColorConfiguration | GroupConfiguration | UmapConfiguration | LineConfiguration | SpaghettiConfiguration | FillRectConfiguration;

export const layoutAdapter = createEntityAdapter<LayoutConfiguration>({
  selectId: (model) => model.channel
});

export type Shadow = {
  copyOf: number,
  position: VectorLike,
  color: number,
}

export type ColorFilter = {
  color: string,
  column: string,
  active: boolean,
  indices: number[]
}[]

export type LineFilter = {
  value: string,
  indices: number[],
  reverseIndices: { [index: number]: number }
  neighboorLookup: { [itemIndex: number]: { prev: number, next: number } }
}[]

// Defines a sequence using a set of indices
export type Sequence = {
  // Indices from the dataset
  indices: number[];
}

export const sequenceAdapter = createEntityAdapter<Sequence>();

export interface SpatialModel extends BaseModel {
  id: EntityId;

  parameters?: EmbeddingParameters;

  // The indices of the rows this model operates on
  filter: number[];

  // The dictionary that maps filter points to shadow points
  shadows: Shadow[]
  filterToShadow: Record<number, number>;

  children: EntityId[];

  area: IRectangle;

  x?: number[];
  y?: number[];

  color?: number[];
  shape?: number[];
  line: number[];

  labels?: LabelContainer[];

  colorFilter?: ColorFilter,
  lineFilter?: LineFilter

  layoutConfigurations: EntityState<LayoutConfiguration>;

  sequences: EntityState<Sequence>;
}





export type Model = SpatialModel;



