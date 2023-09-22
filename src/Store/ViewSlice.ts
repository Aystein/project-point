import type { EntityState, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityId, nanoid } from '@reduxjs/toolkit';
import isEqual from 'lodash/isEqual';
import { VectorLike } from '../Interfaces';
import { getMinMax, scaleInto } from '../Util';
import { Rectangle } from '../WebGL/Math/Rectangle';
import { LabelContainer, layoutAdapter, LayoutConfiguration, SpatialModel } from './ModelSlice';
import { runCondenseLayout, runForceLayout } from '../Layouts/Layouts';
import { scaleLinear } from 'd3-scale';
import { RootState } from './Store';

export type Selection = {
  global: number[];
  local: number[];
}

export const modelAdapter = createEntityAdapter<SpatialModel>();

export interface ViewsState {
  history: SpatialModel[];

  hover: number[];
  localHover: number[];

  selection: number[];
  localSelection: number[];

  lines: number[];
  positions: VectorLike[];

  color?: number[];
  shape?: number[];

  filter: number[];
  filterLookup: Record<number, number>

  lineWidth: number;
  activeHistory: number;

  activeModel: EntityId;

  models: EntityState<SpatialModel>
}

const initialState: ViewsState = {

  hover: undefined,
  localHover: undefined,

  selection: undefined,
  localSelection: undefined,

  lines: undefined,
  positions: undefined,
  lineWidth: 1,

  filter: [],
  filterLookup: {},

  history: [],
  activeHistory: -1,

  activeModel: undefined,

  models: modelAdapter.getInitialState(),

  shape: undefined,
  color: undefined,
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
    activateModel: (state, action: PayloadAction<{ id: EntityId }>) => {
      const { id } = action.payload;
      state.activeModel = id;
    },
    swapView: (state, action: PayloadAction<{ id: EntityId }>) => {
      const children = state.models;
      const swap = state.history.find((value) => value.id === action.payload.id);

      state.activeHistory = state.history.indexOf(swap);
      state.models = children;
      state.selection = null;
      state.localSelection = null;
      state.hover = null;
      state.localHover = null;

      state.positions = swap.x.map((x, i) => ({ x, y: swap.y[i] }))

      state.filter = swap.filter;

      state.filterLookup = {}
      state.filter.forEach((globalIndex, i) => {
        state.filterLookup[globalIndex] = i
      })
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
      action: PayloadAction<{ id: EntityId; labels: LabelContainer[] }>
    ) => {
      const { id, labels } = action.payload;
      const model = state.models.entities[id];

      (labels ?? []).forEach((labelContainer) => {
        model.labels =
          model.labels?.filter((value) => value.type !== labelContainer.type) ?? [];
        model.labels.push(labelContainer);
      })
    },
    removeEmbedding: (state, action: PayloadAction<{ id: EntityId }>) => {
      modelAdapter.removeOne(state.models, action.payload.id)
    },
    addView: (state, action: PayloadAction<{ filter: number[], localSelection: number[], positions: VectorLike[] }>) => {
      const { filter, localSelection, positions } = action.payload;

      const [normalizedPositions, extent] = scaleInto(positions);

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
        layoutConfigurations: layoutAdapter.getInitialState(),
      });
    },
    translateArea: (
      state,
      action: PayloadAction<{ id: EntityId; x: number; y: number }>
    ) => {
      const { id, x, y } = action.payload;
      const model = state.models.entities[id];

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
      const model = state.models.entities[id];

      model.area.width = width;
      model.area.height = height;
    },
    setHover: (state, action: PayloadAction<number[]>) => {
      const globalHover = action.payload;

      if (isEqual(state.hover, globalHover)) {
        return;
      }

      state.hover = globalHover;

      const localHover = []

      for (const globalIndex of globalHover ?? []) {
        const i = state.filter ? state.filterLookup[globalIndex] : globalIndex;

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

      for (const globalIndex of globalSelection ?? []) {
        const i = state.filter ? state.filterLookup[globalIndex] : globalIndex;

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

      const model = state.models.entities[id];
      const color = state.color.slice(0);

      model.filter.forEach((index, j) => {
        color[index * 4] = colors[j * 4 + 0];
        color[index * 4 + 1] = colors[j * 4 + 1];
        color[index * 4 + 2] = colors[j * 4 + 2];
        color[index * 4 + 3] = colors[j * 4 + 3];
      });

      state.color = color;
    },
    setShape: (
      state,
      action: PayloadAction<{ id: EntityId; shape: number[] }>
    ) => {
      const { id } = action.payload;

      const model = state.models.entities[id];
      const shape = state.shape.slice(0);

      model.filter.forEach((i, local) => {
        shape[i] = action.payload.shape[local];
      });

      state.shape = shape;
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

      const subModel: SpatialModel = {
        id: nanoid(),
        filter,
        area: area.serialize(),
        children: [],
        layoutConfigurations: layoutAdapter.getInitialState(),
      };

      state.activeModel = subModel.id;

      modelAdapter.addOne(state.models, subModel);
    },
  },
});

export const setLayoutConfig = createAsyncThunk(
  'layouts/set',
  async ({ id, layoutConfig }: { id: EntityId; layoutConfig: LayoutConfiguration }, { dispatch, getState }) => {
    const state = getState() as RootState;
    const model = state.views.models.entities[id];

    switch (layoutConfig.type) {
      case 'numericalscale': {
        const X = model.filter
          .map((i) => state.data.rows[i])
          .map((row) => row[layoutConfig.column]);

        const domain = getMinMax(X);

        let scale = scaleLinear().domain(domain).range([0, 1]);

        const mapped = X.map((value) => scale(value));

        const labels: LabelContainer = {
          discriminator: 'scalelabels',
          type: layoutConfig.channel,
          labels: {
            domain,
            range: [0, 1],
          },
        };

        const { Y } = await runForceLayout({
          N: model.filter.length,
          area: model.area,
          axis: layoutConfig.channel,
          Y_in: model.filter.map((i) => state.views.positions[i]),
          X: mapped
        });

        dispatch(updateLabels({ id: model.id, labels: [labels] }));

        dispatch(
          updatePositionByFilter({ position: Y, filter: model.filter })
        );
        break;
      }
      case 'condense': {
        console.log("condesne")
        const { Y, labels } = await runCondenseLayout(
          model.filter.length,
          model.area,
          layoutConfig.channel,
          model.filter.map((i) => state.views.positions[i])
        );

        dispatch(updateLabels({
          id: model.id, labels
        }));
        dispatch(
          updatePositionByFilter({ position: Y, filter: model.filter })
        );
        break;
      }
    }
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
  updateLabels,
  changeSize,
  swapView,
  deleteHistory,
  activateModel
} = viewslice.actions;

export default viewslice.reducer;
