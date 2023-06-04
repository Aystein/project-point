export declare enum DataType {
    Unknown = 0,
    Numeric = 1,
    Date = 2,
    Ordinal = 3
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
}
