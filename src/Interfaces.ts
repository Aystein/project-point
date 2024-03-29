export enum DataType {
  // Unknown data
  Unknown,

  // Strictly numeric values
  Numeric,

  // Strictly date timestamps or date string
  Date,

  // Strictly ordinal data
  Ordinal,
}

export interface VectorLike {
  x: number;
  y: number;
}

export interface Boundaries {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerX: number;
  centerY: number;
  extentX: number;
  extentY: number;
}


export interface Pattern {
  modifier: string;
  expression: string;
}
