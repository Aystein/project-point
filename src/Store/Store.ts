import {
  combineReducers,
  configureStore,
  createAction,
  createAsyncThunk,
  createReducer,
  nanoid,
} from '@reduxjs/toolkit';
import { Column, Row, dataReducer } from './DataSlice.';
import viewReducer, { modelAdapter } from './ViewSlice';
import { datasetReducer } from './FilesSlice';
import { DataType } from '../Interfaces';
import isNumber from 'lodash/isNumber';
import { clusterReducer } from './ClusterSlice';
import { settingsReducer } from './SettingsSlice';
import { POINT_RADIUS } from '../Layouts/Globals';
import { spread } from '../Util';
import { Engine } from '../ts/engine/engine';
import { parseCSV } from '../DataLoading/CSVLoader';
import { DEFAULT_COLOR, hexToInt } from '../Utility/ColorScheme';
import { getPlugins } from '../Plugins/Util';

const combined = combineReducers({
  data: dataReducer,
  views: viewReducer,
  datasets: datasetReducer,
  clusters: clusterReducer,
  settings: settingsReducer,
});

export type RootState = ReturnType<typeof combined>;

export const loadDatasetGlobal = createAction<Row[]>('loadDataset');

const reducer = createReducer<RootState>(undefined, (builder) => {
  builder.addCase(loadDatasetGlobal, (state, action) => {
    const rows = action.payload;

    const id = nanoid();

    const header = Object.keys(rows[0]);

    const datasetType = getPlugins().find((plugin) => plugin.hasLayout(header))?.type;

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
    state.data.type = datasetType;

    const A = Math.pow(POINT_RADIUS, 2) * rows.length;
    const r = Math.sqrt(A);

    state.views.positions = rows.map((row) => ({
      x: spread(Engine.board_size / 2, r),
      y: spread(Engine.board_size / 2, r),
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

    state.views.lines = null;

    state.views.bounds = rows.map(() => [5, 5, 15, 15]).flat()
    state.views.models = modelAdapter.getInitialState();
    state.views.color = rows.map(() => hexToInt(DEFAULT_COLOR));
    state.views.shape = rows.map(() => 0);
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

export const loadDatasetUrl = createAsyncThunk(
  'users/loadDataset',
  async (name: string, { dispatch }) => {
    const file = `datasets/${name}/chunk.csv`;
    const response = await fetch(file);
    const rows = await parseCSV(await response.text());

    dispatch(loadDatasetGlobal(rows));
  }
);

export const loadDataset = createAsyncThunk(
  'users/loadDataset',
  async (name: string, { dispatch }) => {
    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle(name);
    const file = await fileHandle.getFile();
    const reader = new FileReader();

    reader.onload = async () => {
      const rows = await parseCSV(reader.result.toString());
      dispatch(loadDatasetGlobal(rows));
    };

    reader.readAsBinaryString(file.slice(100));
  }
);

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
