import { createSlice } from '@reduxjs/toolkit';
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

const initialState: DataState = {
  id: null,
  rows: [],
  columns: [],
};

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
});

export const dataReducer = dataSlice.reducer;
