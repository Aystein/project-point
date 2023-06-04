import { DataState } from '../Store/DataSlice.';
import { VectorLike } from '../Interfaces';
export declare function encode(data: DataState, filter: number[], keys: string[]): {
    X: number[][];
    D: number;
    N: number;
};
export declare function unmap(array: number[]): VectorLike[];
