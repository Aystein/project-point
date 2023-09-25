import type { EntityState, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, EntityId, nanoid } from '@reduxjs/toolkit';
import isEqual from 'lodash/isEqual';
import { VectorLike } from '../Interfaces';
import { getMinMax, scaleInto } from '../Util';
import { Rectangle } from '../WebGL/Math/Rectangle';
import { LabelContainer, layoutAdapter, LayoutConfiguration, SpatialModel } from './interfaces';
import { runCondenseLayout, runForceLayout, runGroupLayout, runUMAPLayout } from '../Layouts/Layouts';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { RootState } from './Store';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { RGBColor, color } from 'd3-color';
import { encode } from '../DataLoading/Encode';
import groupBy from 'lodash/groupBy';

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

  bounds: number[];

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

  bounds: undefined,
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
      const colorArr = state.color.slice(0);

      model.filter.forEach((index, j) => {
        colorArr[index] = colors[j];
      });

      state.color = colorArr;
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
    upsertLayoutConfig: (state, action: PayloadAction<{ id: EntityId, layoutConfig: LayoutConfiguration }>) => {
      const { id, layoutConfig } = action.payload;

      const model = state.models.entities[id];
      layoutAdapter.upsertOne(model.layoutConfigurations, layoutConfig)
    },
    removeLayoutConfig: (state, action: PayloadAction<{ channel: string }>) => {
      const activeModel = state.models.entities[state.activeModel];

      switch (action.payload.channel) {
        case 'line':
          break;
      }
      
      layoutAdapter.removeOne(activeModel.layoutConfigurations, action.payload.channel);
    }
  },
});

export const rerunLayouts = createAsyncThunk(
  'layouts/rerun',
  async ({ id }: { id: EntityId }, { dispatch, getState }) => {

  }
)

export const setLayoutConfig = createAsyncThunk(
  'layouts/set',
  async ({ id, layoutConfig }: { id: EntityId; layoutConfig: LayoutConfiguration }, { dispatch, getState, requestId }) => {
    const state = getState() as RootState;
    const model = state.views.models.entities[id];
    const modelRows = model.filter
      .map((i) => state.data.rows[i]);

    dispatch(upsertLayoutConfig({ id, layoutConfig }))

    if (layoutConfig.channel === 'x' || layoutConfig.channel === 'y') {
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
    } else if (layoutConfig.channel === 'color') {
      switch (layoutConfig.type) {
        case 'setcolor': {
          const filteredRows = modelRows
            .map((row) => row[layoutConfig.column]);
          const extent = getMinMax(filteredRows);

          let colorScale =
            layoutConfig.featureType === 'categorical'
              ? scaleOrdinal(schemeCategory10).domain(filteredRows)
              : scaleLinear<string>().domain(extent).range(['red', 'green']);

          const mappedColors = filteredRows.map((row) => {
            const value = color(colorScale(row)) as RGBColor
            return (value.r << 24) | (value.g << 16) | (value.b << 8) | Math.floor(value.opacity * 255)
          });

          dispatch(
            setColor({
              id: model.id,
              colors: mappedColors
                .map((hex) => {
                  return hex;
                })
            })
          );
          break;
        }
      }
    } else if (layoutConfig.channel === 'xy') {
      switch (layoutConfig.type) {
        case 'group': {
          const { Y, x, y, labels } = await runGroupLayout(
            modelRows,
            model.area,
            layoutConfig.column,
            layoutConfig.strategy,
          );

          dispatch(updateLabels({ id: model.id, labels }));
          dispatch(
            updatePositionByFilter({ position: Y, filter: model.filter })
          );

          break;
        }
        case 'umap': {
          const { X, N, D } = encode(state.data, model.filter, layoutConfig.columns);

          const { Y, labels } = await runUMAPLayout({
            X,
            N,
            D,
            area: model.area,
            axis: 'xy',
            Y_in: model.filter.map((i) => state.views.positions[i]),
          });

          dispatch(
            updatePositionByFilter({ position: Y, filter: model.filter })
          );
        }
      }
    } else if (layoutConfig.channel === 'line') {
      switch (layoutConfig.type) {
        case 'setline': {
          const grouped = groupBy(modelRows, (value) => value[layoutConfig.column]);
          const lines = new Array<number>();

          Object.keys(grouped).forEach((group) => {
            const values = grouped[group];
            values.forEach((row, i) => {
              if (i < values.length - 1) {
                lines.push(values[i].index, values[i + 1].index);
              }
            });
          });

          dispatch(setLines(lines));
          break;
        }
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
  activateModel,
  upsertLayoutConfig,
  removeLayoutConfig
} = viewslice.actions;

export default viewslice.reducer;
