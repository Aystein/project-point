import { createReducer, createSlice, nanoid } from "@reduxjs/toolkit";
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

type Column = NumberColumn | OrdinalColumn | DateColumn | UnknownColumn;

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

export const counterSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<Row[]>) => {
      const rows = action.payload;

      const id = nanoid();

      const header = Object.keys(rows[0]);

      const columns: Column[] = header.map((key) => {
        return {
          key,
          type: DataType.Unknown,
        };
      });

      columns.forEach((column) => {
        let date = false;
        let numeric = true;
        let ordinal = true;
        let empty = false;
        let min = Number.MAX_SAFE_INTEGER;
        let max = Number.MIN_SAFE_INTEGER;
        let distinct = new Set<string>();

        rows.forEach((row) => {
          const value = row[column.key];

          if (value === null) {
            empty = true;
            return;
          }

          if (numeric && !isNumber(value)) {
            numeric = false;
          }

          if (numeric) {
            if (value < min) {
              min = value;
            }
            if (value > max) {
              max = value;
            }

            ordinal = false;
          }

          if (ordinal) {
            distinct.add(value);
          }

          if (distinct.size > 100) {
            ordinal = false;
          }
        });

        if (numeric) {
          column.type = DataType.Numeric;
          column.domain = [min, max];
        }
        if (ordinal) {
          column.type = DataType.Ordinal;
          column.domain = Array.from(distinct);
        }
      });

      state.id = id;
      state.rows = rows;
      state.columns = columns;
    },
  },
});

// Action creators are generated for each case reducer function
export const { initialize } = counterSlice.actions;

export default counterSlice.reducer;
