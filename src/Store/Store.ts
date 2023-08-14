import {
  combineReducers,
  configureStore,
  createAction,
  createReducer,
  nanoid,
} from '@reduxjs/toolkit';
import { Column, Row, dataReducer } from './DataSlice.';
import viewReducer from './ViewSlice';
import { datasetReducer } from './FilesSlice';
import { DataType } from '../Interfaces';
import isNumber from 'lodash/isNumber';
import { clusterReducer } from './ClusterSlice';
import { settingsReducer } from './SettingsSlice';
import { POINT_RADIUS } from '../Layouts/Globals';
import { spread } from '../Util';

const combined = combineReducers({
  data: dataReducer,
  views: viewReducer,
  datasets: datasetReducer,
  clusters: clusterReducer,
  settings: settingsReducer
});

export type RootState = ReturnType<typeof combined>;

export const loadDatasetGlobal = createAction<Row[]>('loadDataset');

const reducer = createReducer<RootState>(undefined, (builder) => {
  builder.addCase(loadDatasetGlobal, (state, action) => {
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

    rows.forEach((row, index) => {
      row.index = index;
    });

    state.data.id = id;
    state.data.rows = rows;
    state.data.columns = columns;

    const A = Math.pow(POINT_RADIUS, 2) * rows.length;
    const r = Math.sqrt(A);

    state.views.positions = rows.map((row) => ({
      x: spread(10, r),
      y: spread(10, r),
    }));

    state.views.filter = Array.from({ length: rows.length }).map((_, i) => {
      return i;
    })
    state.views.filterLookup = {}
    state.views.filter.forEach((globalIndex, i) => {
      state.views.filterLookup[globalIndex] = i
    })

    state.views.history = [];
    state.views.activeHistory = null;

    state.views.selection = null;
    state.views.localSelection = null;
    state.views.localHover = null;
    state.views.hover = null;

    state.views.workspace = {
      id: nanoid(),
      children: [],
      filter: Array.from({ length: rows.length }).map((_, i) => {
        return i;
      }),
      area: null,
      color: rows.map(() => [0.5, 0.5, 0.5, 1]).flat(),
      shape: rows.map(() => 0),
      x: state.views.positions.map((value) => spread(0.5, 0.5)),
      y: state.views.positions.map((value) => spread(0.5, 0.5)),
    };
  });

  builder.addDefaultCase(combined);
});

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
