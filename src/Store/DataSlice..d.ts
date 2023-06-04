import { DataType } from '../Interfaces';
export interface Row {
    index: number;
}
interface NumberColumn {
    key: string;
    type: DataType.Numeric;
    domain: number[];
    group?: string;
}
interface OrdinalColumn {
    key: string;
    type: DataType.Ordinal;
    domain: string[];
    group?: string;
}
interface DateColumn {
    key: string;
    type: DataType.Date;
    domain?: never;
    group?: string;
}
interface UnknownColumn {
    key: string;
    type: DataType.Unknown;
    domain?: never;
    group?: string;
}
export type Column = NumberColumn | OrdinalColumn | DateColumn | UnknownColumn;
export interface DataState {
    id: string;
    rows: Row[];
    columns: Column[];
}
export declare const dataSlice: import("@reduxjs/toolkit").Slice<DataState, {}, "data">;
export declare const dataReducer: import("redux").Reducer<DataState, import("redux").AnyAction>;
export {};
