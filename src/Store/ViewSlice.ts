import type { EntityState, PayloadAction } from '@reduxjs/toolkit';
import { EntityId, createAsyncThunk, createEntityAdapter, createSlice, nanoid } from '@reduxjs/toolkit';
import { RGBColor, color } from 'd3-color';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import groupBy from 'lodash/groupBy';
import isEqual from 'lodash/isEqual';
import { encode } from '../DataLoading/Encode';
import { VectorLike } from '../Interfaces';
import { fillOperation, runCondenseLayout, runForceLayout, runGroupLayout, runSpaghettiLayout, runUMAPLayout } from '../Layouts/Layouts';
import { getMinMax, scaleInto } from '../Util';
import { IRectangle, Rectangle } from '../WebGL/Math/Rectangle';
import { RootState } from './Store';
import { LabelContainer, LayoutConfiguration, Model, SpatialModel, layoutAdapter } from './interfaces';
import { Root } from 'react-dom/client';

export type Selection = {
  global: number[];
  local: number[];
}

export const modelAdapter = createEntityAdapter<SpatialModel>();

export type Tool = 'pan' | 'select' | 'box';

export type ToolbarType = typeof initialState;

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

  models: EntityState<SpatialModel>,

  selectedTool: Tool
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

  selectedTool: 'select' as Tool
};

export const viewslice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    setTool: (state, action: PayloadAction<Tool>) => {
      state.selectedTool = action.payload;

      if (action.payload === 'pan') {
        state.activeModel = null;
      }
    },
    updatePositionByFilter: (
      state,
      action: PayloadAction<{ position: VectorLike[]; filter: number[]; axis?: 'x' | 'y' }>
    ) => {
      const { filter, position, axis } = action.payload;

      filter.forEach((globalIndex, localIndex) => {
        if (axis === 'x') {
          state.positions[globalIndex].x = position[localIndex].x;
        }
        if (axis === 'y') {
          state.positions[globalIndex].y = position[localIndex].y;
        }
        if (!axis) {
          state.positions[globalIndex] = position[localIndex];
        }
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
    setFilter: (state, action: PayloadAction<{ id: EntityId; filter: number[] }>) => {
      const { id, filter } = action.payload;
      const model = state.models.entities[id];

      model.filter = filter;
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
      const model = state.models.entities[action.payload.id];

      model.filter.forEach((globalIndex) => {
        state.bounds[globalIndex * 4 + 0] = 0;
        state.bounds[globalIndex * 4 + 1] = 0;
        state.bounds[globalIndex * 4 + 2] = 20;
        state.bounds[globalIndex * 4 + 3] = 20;
      })

      modelAdapter.removeOne(state.models, action.payload.id)
    },
    pushHistoryView: (state, action: PayloadAction<{ filter: number[], localSelection: number[], positions: VectorLike[] }>) => {
      const { filter, localSelection, positions } = action.payload;

      const [normalizedPositions, extent] = scaleInto(positions);

      const area = {
        x: 10 - extent / 2,
        y: 10 - extent / 2,
        width: extent,
        height: extent
      };

      state.history.push({
        id: nanoid(),
        filter,
        children: [],
        area,
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

      model.filter.forEach((globalIndex) => {
        state.bounds[globalIndex * 4 + 0] = model.area.x;
        state.bounds[globalIndex * 4 + 1] = model.area.y;
        state.bounds[globalIndex * 4 + 2] = model.area.x + model.area.width;
        state.bounds[globalIndex * 4 + 3] = model.area.y + model.area.height;
      })
    },
    setBounds: (state, action: PayloadAction<{ id: EntityId }>) => {
      const { id } = action.payload;
      const model = state.models.entities[id];

      model.filter.forEach((globalIndex) => {
        state.bounds[globalIndex * 4 + 0] = model.area.x;
        state.bounds[globalIndex * 4 + 1] = model.area.y;
        state.bounds[globalIndex * 4 + 2] = model.area.x + model.area.width;
        state.bounds[globalIndex * 4 + 3] = model.area.y + model.area.height;
      })
    },
    changeSize: (
      state,
      action: PayloadAction<{ id: EntityId; newArea: IRectangle }>
    ) => {
      const { id, newArea } = action.payload;
      const model = state.models.entities[id];

      model.area = newArea;
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
      action: PayloadAction<{ id: EntityId; colors: number[], colorFilter?: { column: string, color: string, active: boolean }[] }>
    ) => {
      const { colors, id } = action.payload;

      const model = state.models.entities[id];
      const colorArr = state.color.slice(0);

      model.filter.forEach((index, j) => {
        colorArr[index] = colors[j];
      });

      model.colorFilter = action.payload.colorFilter;

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
    updateModel: (state, action: PayloadAction<{ id: EntityId, changes: Partial<SpatialModel> }>) => {
      const { id, changes } = action.payload;
      modelAdapter.updateOne(state.models, { id, changes })
    },
    deleteBounds: (state, action: PayloadAction<number[]>) => {
      const area = new Rectangle(0, 0, 20, 20);

      action.payload.forEach((globalIndex) => {
        state.bounds[globalIndex * 4 + 0] = area.x;
        state.bounds[globalIndex * 4 + 1] = area.y;
        state.bounds[globalIndex * 4 + 2] = area.x + area.width;
        state.bounds[globalIndex * 4 + 3] = area.y + area.height;
      })
    },
    addSubEmbedding: (
      state,
      action: PayloadAction<SpatialModel>
    ) => {
      modelAdapter.addOne(state.models, action.payload);
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


/**
   const handleShape = () => {
    const onFinish = (feature: string) => {
      const filteredRows = model.filter.map((i) => data[i]);

      let shape = scaleOrdinal([0, 1, 2, 3]).domain(
        filteredRows.map((row) => row[feature])
      );

      const mappedColors = filteredRows.map((row) => shape(row[feature]));

      dispatch(
        setShape({
          id: model.id,
          shape: mappedColors,
        })
      );
    };

    openContextModal({
      modal: 'colorby',
      title: 'Shape by',
      innerProps: {
        onFinish,
      },
    });
  };

  const handleSpaghettiBy = async (axis: 'x' | 'y') => {
    const onFinish = async (groups: string[], secondary: string) => {
      const X = model.filter.map((i) => data[i]);

      const { Y, x, y, labels } = await runSpaghettiLayout(
        X,
        area,
        groups,
        secondary,
        axis,
        model.filter.map((i) => positions[i])
      );

      dispatch(updateLabels({ id: model.id, labels }));
      dispatch(updatePositionByFilter({ position: Y, filter: model.filter }));
    };

    openContextModal({
      modal: 'spaghetti',
      title: 'Spaghetti',
      innerProps: {
        onFinish,
      },
    });
  };
 */

export const removeLayoutConfigAsync = createAsyncThunk('layouts/addsubembedding',
  async ({ channel }: { channel: string }, { dispatch, getState }) => {
    dispatch(removeLayoutConfig({ channel }))
    dispatch(rerunLayouts({ id: (getState() as RootState).views.activeModel }))
  })

export const addSubEmbeddingAsync = createAsyncThunk('layouts/addsubembedding',
  async ({ filter, Y, area }: {
    filter: number[];
    Y: VectorLike[];
    area: Rectangle;
  }, { dispatch }) => {
    const modelId = nanoid();

    const subModel: SpatialModel = {
      id: modelId,
      filter,
      area: area.serialize(),
      children: [],
      layoutConfigurations: layoutAdapter.getInitialState(),
    };

    dispatch(addSubEmbedding(subModel))
    dispatch(setBounds({ id: modelId }))
    dispatch(setTool('select'))
    dispatch(activateModel({ id: modelId }))
    dispatch(rerunLayouts({ id: modelId }))
  })


export const transfer = createAsyncThunk(
  'layouts/transfer',
  async ({ target, globalIds }: { target?: EntityId, globalIds: number[] }, { getState, dispatch }) => {
    let state = getState() as RootState;

    const targetModel = state.views.models.entities[target];

    const globalIdsSet = new Set(globalIds);

    Object.values(state.views.models.entities).forEach((model) => {
      if (model.id !== target && model.filter.some((value) => globalIdsSet.has(value))) {
        const newSourceFilter = model.filter.filter((value) => !globalIdsSet.has(value));

        dispatch(setFilter({ id: model.id, filter: newSourceFilter }))
        dispatch(rerunLayouts({ id: model.id }))
      }
    })

    state = getState() as RootState;

    if (target) {
      console.log({ id: target, filter: Array.from(new Set([...globalIds, ...targetModel.filter])).sort((a, b) => a - b) })
      dispatch(setFilter({ id: target, filter: Array.from(new Set([...globalIds, ...targetModel.filter])).sort() }))
      dispatch(setBounds({ id: target }))
      dispatch(rerunLayouts({ id: target }))
    } else {
      dispatch(deleteBounds(globalIds))
    }
  }
)


export const rerunLayouts = createAsyncThunk(
  'layouts/rerun',
  async ({ id }: { id: EntityId }, { dispatch, getState }) => {
    const state = getState() as RootState;
    const model = state.views.models.entities[id];
    const modelRows = model.filter
      .map((i) => state.data.rows[i]);

    dispatch(setBounds({ id }))
    dispatch(updateModel({ id, changes: { labels: [] } }))

    const layoutIds = model.layoutConfigurations.ids;
    const layouts = Object.values(model.layoutConfigurations.entities);

    if (!layoutIds.includes('xy')) {
      if (!layoutIds.includes('x') && layoutIds.includes('y')) {
        layouts.push({
          type: 'condense',
          channel: 'x'
        })
      } else if (!layoutIds.includes('y') && layoutIds.includes('x')) {
        layouts.push({
          type: 'condense',
          channel: 'y'
        })
      } else {
        layouts.push({
          channel: 'xy',
          type: 'fillrect'
        })
      }
    }

    layouts.map(async (layoutConfig) => {
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
              updatePositionByFilter({ position: Y, filter: model.filter, axis: layoutConfig.channel })
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
                  }),
                colorFilter: layoutConfig.featureType === 'categorical' ? colorScale.domain().map((value) => {
                  return {
                    column: value,
                    color: colorScale(value),
                    active: true
                  }
                }) : null
              })
            );
            break;
          }
        }
      } else if (layoutConfig.channel === 'xy') {
        switch (layoutConfig.type) {
          case 'fillrect': {
            const { Y } = await fillOperation({ N: modelRows.length, area: model.area });
            dispatch(updatePositionByFilter({ position: Y, filter: model.filter }));
            break;
          }
          case 'spaghetti': {
            const { Y, x, y, labels } = await runSpaghettiLayout(
              modelRows,
              model.area,
              layoutConfig.columns,
              layoutConfig.timeColumn,
              'y',
              model.filter.map((i) => state.views.positions[i])
            );
            dispatch(updateLabels({ id: model.id, labels }));
            dispatch(updatePositionByFilter({ position: Y, filter: model.filter }));
            break;
          }
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
    })
  }
)

export const setLayoutConfig = createAsyncThunk(
  'layouts/set',
  async ({ id, layoutConfig }: { id: EntityId; layoutConfig: LayoutConfiguration }, { dispatch, getState, requestId }) => {
    dispatch(upsertLayoutConfig({ id, layoutConfig }))
    dispatch(rerunLayouts({ id }))
  }
);

// Action creators are generated for each case reducer function
export const {
  updatePositionByFilter,
  addSubEmbedding,
  removeEmbedding,
  translateArea,
  setColor,
  deleteBounds,
  setShape,
  setHover,
  setSelection,
  setLines,
  pushHistoryView,
  updateLabels,
  changeSize,
  swapView,
  deleteHistory,
  activateModel,
  upsertLayoutConfig,
  removeLayoutConfig,
  setTool,
  setBounds,
  setFilter,
  updateModel
} = viewslice.actions;

export default viewslice.reducer;
