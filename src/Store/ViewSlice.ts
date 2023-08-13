import { createAsyncThunk, createSelector, createSlice, EntityId, nanoid } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { LabelContainer, SpatialModel } from './ModelSlice';
import { VectorLike } from '../Interfaces';
import { getBounds, normalizeVectors, scaleInto } from '../Util';
import { Rectangle } from '../WebGL/Math/Rectangle';
import { scaleLinear } from 'd3-scale';
import { RootState } from './Store';

export type Selection = {
  global: number[];
  local: number[];
}

export interface ViewsState {
  history: SpatialModel[];
  workspace: SpatialModel;

  hover: number[];
  localHover: number[];

  selection: number[];
  localSelection: number[];

  lines: number[];
  positions: VectorLike[];
  filter: number[];
  lineWidth: number;
  activeHistory: number;
}

const initialState: ViewsState = {
  workspace: undefined,

  hover: undefined,
  localHover: undefined,

  selection: undefined,
  localSelection: undefined,

  lines: undefined,
  positions: undefined,
  lineWidth: 1,
  filter: [],
  history: [],
  activeHistory: -1
};

export const viewslice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    updatePositionByFilter: (
      state,
      action: PayloadAction<{ position: VectorLike[]; filter: number[] }>
    ) => {
      const { filter, position } = action.payload;

      filter.forEach((globalIndex, localIndex) => {
        state.positions[globalIndex] = position[localIndex];
      });
    },
    swapView: (state, action: PayloadAction<{ id: EntityId }>) => {
      const children = state.workspace.children;
      const swap = state.history.find((value) => value.id === action.payload.id);
      state.workspace = { ...swap };
      state.activeHistory = state.history.indexOf(swap);
      state.workspace.children = children;
      state.selection = null;
      state.localSelection = null;
      state.hover = null;
      state.localHover = null;
      console.log(state.workspace.x.map((x, i) => ({ x, y: state.workspace.y[i] })))
      state.positions = state.workspace.x.map((x, i) => ({ x, y: state.workspace.y[i] }))
      state.filter = swap.filter;
    },
    deleteHistory: (state, action: PayloadAction<{ historyIndex: number }>) => {
      const { historyIndex } = action.payload;

      state.history.splice(historyIndex, 1)
      if (historyIndex === state.activeHistory) {
        state.activeHistory = -1;
      }
    },
    updateLabels: (
      state,
      action: PayloadAction<{ id: EntityId; labels: LabelContainer }>
    ) => {
      const { id, labels } = action.payload;
      const model = state.workspace.children.find((value) => value.id === id);

      if (labels) {
        model.labels =
          model.labels?.filter((value) => value.type !== labels.type) ?? [];
        model.labels.push(labels);
      }
    },
    updateTrueEmbedding: (
      state,
      action: PayloadAction<{
        id: EntityId;
        x?: number[];
        y?: number[];
      }>
    ) => {
      const { id, x, y } = action.payload;
      const model = state.workspace.children.find((value) => value.id === id);

      if (x) {
        model.filter.forEach((index, local) => {
          state.workspace.x[index] = x[local];
        });
      }

      if (y) {
        model.filter.forEach((index, local) => {
          state.workspace.y[index] = y[local];
        });
      }
    },
    removeEmbedding: (state, action: PayloadAction<{ id: EntityId }>) => {
      state.workspace.children.splice(
        state.workspace.children.findIndex(
          (value) => value.id === action.payload.id
        ),
        1
      );
    },
    addView: (state, action: PayloadAction<{ filter: number[], localSelection: number[], positions: VectorLike[] }>) => {
      const { filter, localSelection, positions } = action.payload;

      const [normalizedPositions, extent] = scaleInto(positions);

      const bounds = getBounds(normalizedPositions);
      console.log(normalizedPositions);
      state.history.push({
        id: nanoid(),
        filter,
        children: [],
        area: {
          x: 10 - extent / 2,
          y: 10 - extent / 2,
          width: extent,
          height: extent
        },
        x: normalizedPositions.map((value) => value.x),
        y: normalizedPositions.map((value) => value.y),
      });
    },
    translateArea: (
      state,
      action: PayloadAction<{ id: EntityId; x: number; y: number }>
    ) => {
      const { id, x, y } = action.payload;
      const model = state.workspace.children.find((value) => value.id === id);

      model.area.x += x;
      model.area.y += y;

      model.filter.forEach((globalIndex) => {
        state.positions[globalIndex].x += x;
        state.positions[globalIndex].y += y;
      });
    },
    changeSize: (
      state,
      action: PayloadAction<{ id: EntityId; width: number; height: number }>
    ) => {
      const { id, width, height } = action.payload;
      const model = state.workspace.children.find((value) => value.id === id);

      model.area.width = width;
      model.area.height = height;
    },
    setHover: (state, action: PayloadAction<number[]>) => {
      const globalHover = action.payload;

      state.hover = globalHover;

      const localHover = []
      const filterLookup = {}
      state.filter.forEach((globalIndex, i) => {
        filterLookup[globalIndex] = i
      })
      for (const globalIndex of globalHover ?? []) {
        const i = state.filter ? filterLookup[globalIndex] : globalIndex;

        if (i >= 0) {
          localHover.push(i);
        }
      }

      state.localHover = localHover;
    },
    setSelection: (state, action: PayloadAction<number[]>) => {
      const globalSelection = action.payload;

      state.selection = globalSelection;

      const localSelection = []
      const filterLookup = {}
      state.filter.forEach((globalIndex, i) => {
        filterLookup[globalIndex] = i
      })

      for (const globalIndex of globalSelection ?? []) {
        const i = state.filter ? filterLookup[globalIndex] : globalIndex;

        if (i >= 0) {
          localSelection.push(i);
        }
      }

      state.localSelection = localSelection;
    },
    setColor: (
      state,
      action: PayloadAction<{ id: EntityId; colors: number[] }>
    ) => {
      const { colors, id } = action.payload;

      const model = state.workspace.children.find((value) => value.id === id);
      model.color = Array.from({ length: model.filter.length })
        .map(() => [1, 0, 0, 1])
        .flat();

      model.filter.forEach((index, j) => {
        state.workspace.color[index * 4] = colors[j * 4 + 0];
        state.workspace.color[index * 4 + 1] = colors[j * 4 + 1];
        state.workspace.color[index * 4 + 2] = colors[j * 4 + 2];
        state.workspace.color[index * 4 + 3] = colors[j * 4 + 3];
      });
    },
    setShape: (
      state,
      action: PayloadAction<{ id: EntityId; shape: number[] }>
    ) => {
      const { shape, id } = action.payload;

      const model = state.workspace.children.find((value) => value.id === id);

      model.filter.forEach((i, local) => {
        state.workspace.shape[i] = shape[local];
      });
    },
    setLines: (state, action: PayloadAction<number[]>) => {
      state.lines = action.payload;
    },
    addSubEmbedding: (
      state,
      action: PayloadAction<{
        filter: number[];
        Y: VectorLike[];
        area: Rectangle;
      }>
    ) => {
      const { filter, area } = action.payload;

      const Y = filter.map((i) => state.positions[i]);

      const subModel: SpatialModel = {
        id: nanoid(),
        filter,
        area: area.serialize(),
        children: [],
      };

      state.workspace.children.push(subModel);
    },
  },
});

export const loadDataset = createAsyncThunk(
  'views/readxy',
  async (engine, { dispatch }) => {
  }
);

// Action creators are generated for each case reducer function
export const {
  updatePositionByFilter,
  addSubEmbedding,
  removeEmbedding,
  translateArea,
  setColor,
  setShape,
  setHover,
  setSelection,
  setLines,
  addView,
  updateTrueEmbedding,
  updateLabels,
  changeSize,
  swapView,
  deleteHistory
} = viewslice.actions;

export default viewslice.reducer;
