import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { DataType } from "../Interfaces";
import isNumber from "lodash/isNumber";

export interface Row {
  index: number;
}

interface NumberColumn {
  key: string;
  type: DataType.Numeric;
  domain: number[];
}

interface OrdinalColumn {
  key: string;
  type: DataType.Ordinal;
  domain: string[];
}

interface DateColumn {
  key: string;
  type: DataType.Date;
  domain?: never;
}

interface UnknownColumn {
  key: string;
  type: DataType.Unknown;
  domain?: never;
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
  name: "data",
  initialState,
  reducers: {},
});

export const dataReducer = dataSlice.reducer;
