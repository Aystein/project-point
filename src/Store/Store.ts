import {
  combineReducers,
  configureStore,
  createAction,
  createAsyncThunk,
  createReducer,
  nanoid,
  Reducer,
} from '@reduxjs/toolkit';
import undoable, { includeAction, excludeAction } from 'redux-undo';
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
import { historySlice } from './HistorySlice';
import { produce } from 'immer';
import cloneDeep from 'lodash/cloneDeep';

type StateWithHistory<T> = {
    past: T[];
    present: T;
    future: T[];
};

function createUndoableReducer2<T>(reducer: Reducer<T>): Reducer<StateWithHistory<T>> {

  return createReducer<StateWithHistory<T>>({
    past: [],
    present: reducer(undefined, { type: 'unknown' }),
    future: [],
  }, (builder) => {
    builder.addCase('UNDO', (state) => {
      const { past, present, future } = state;
      
      if (past.length === 0) {
        return state;
      }



      const newPresent = past[past.length - 1];

      return {
        past: past.slice(0, past.length - 1),
        present: newPresent,
        future: [present, ...future]
      };
    })
    builder.addCase('REDO', (state) => {
      const { past, present, future } = state;

      if (future.length === 0) {
        return state;
      }

      return {
        past: [...past, present],
        present: future[0],
        future: future.slice(1),
      };
    })
    builder.addDefaultCase((state, action) => {
      const { past, present, future } = state;

      const newState = produce(state.present, (draft) => {
        reducer(draft, action);
      })

      if (action.type === 'views/updatePositionByFilter') {
        return {
          past: [...past, present],
          present: newState,
          future: [],
        }
      }

      state.present = newState;
    })
  });

}

function createUndoableReducer<T>(reducer: Reducer<T>): Reducer<StateWithHistory<T>> {
  return (state, action) => {
    const { past, present, future } = state;

    if (action.type === 'UNDO') {
      if (past.length === 0) {
        return state;
      }

      return {
        past: past.slice(0, past.length - 1),
        present: past[past.length - 1],
        future: [present, ...future]
      };
    }
    if (action.type === 'REDO') {
      if (future.length === 0) {
        return state;
      }

      return {
        past: [...past, present],
        present: future[0],
        future: future.slice(1),
      };
    }

    const newPresent = reducer(present, action);

    if (action.type === 'views/updatePositionByFilter') {
      return {
        past: [...past, present],
        present: newPresent,
        future: [],
      };
    }

    return {
      past: state.past,
      present: newPresent,
      future: state.future,
    }
  };
}

/* const undoableViews = undoable(viewReducer, {
  ignoreInitialState: true,
  limit: 10,
  filter: function filterActions(action, currentState, previousHistory) {
    return action.type === 'views/updatePositionByFilter';
  }
}) */

const undoableViews = createUndoableReducer2(viewReducer);

const combined = combineReducers({
  data: dataReducer,
  views: createUndoableReducer2(viewReducer),
  datasets: datasetReducer,
  clusters: clusterReducer,
  settings: settingsReducer,
  history: historySlice.reducer,
});

export type RootState = ReturnType<typeof combined>;

export const loadDatasetGlobal = createAction<Row[]>('loadDataset');

export const storess = createAction<any>('storeSS');
export const loadss = createAction<any>('loadSS');

const reducer = createReducer<RootState>(combined(undefined, { type: 'unknown' }), (builder) => {
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

    state.views.present.positions = rows.map((row) => ({
      x: spread(Engine.board_size / 2, r),
      y: spread(Engine.board_size / 2, r),
    }));

    state.views.present.filter = Array.from({ length: rows.length }).map((_, i) => {
      return i;
    })
    state.views.present.filterLookup = {}
    state.views.present.filter.forEach((globalIndex, i) => {
      state.views.present.filterLookup[globalIndex] = i
    })

    state.views.present.history = [];
    state.views.present.activeHistory = null;

    state.views.present.selection = null;
    state.views.present.localSelection = null;
    state.views.present.localHover = null;
    state.views.present.hover = null;

    state.views.present.lines = null;

    state.views.present.bounds = rows.map(() => [5, 5, 15, 15]).flat()
    state.views.present.models = modelAdapter.getInitialState();
    state.views.present.color = rows.map(() => hexToInt(DEFAULT_COLOR));
    state.views.present.shape = rows.map(() => 0);
  })
  .addDefaultCase((state, action) => {
    // combined(state, action)
    // default case that returns combined reducer
    return combined(state, action);
  });
});

export const store = configureStore({
  reducer: reducer,
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
