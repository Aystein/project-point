import type { EntityState, PayloadAction } from '@reduxjs/toolkit';
import { EntityId, createAsyncThunk, createEntityAdapter, createSlice, nanoid } from '@reduxjs/toolkit';
import { RGBColor, color } from 'd3-color';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import groupBy from 'lodash/groupBy';
import isEqual from 'lodash/isEqual';
import { encode } from '../DataLoading/Encode';
import { Pattern, VectorLike } from '../Interfaces';
import { fillOperation, runAxisLayout, runCondenseLayout, runForceLayout, runGroupLayout, runSpaghettiLayout, runUMAPLayout } from '../Layouts/Layouts';
import { getMinMax, scaleInto } from '../Util';
import { IRectangle, Rectangle } from '../WebGL/Math/Rectangle';
import { RootState } from './Store';
import { createAppAsyncThunk } from './hooks';
import { LabelContainer, LayoutConfiguration, LineFilter, Sequence, Shadow, SpatialModel, layoutAdapter, sequenceAdapter } from './interfaces';
import { RegexMatcher } from '../regexEngine';
import { DEFAULT_SCALE } from '../Utility/ColorScheme';


export type Selection = {
  global: number[];
  local: number[];
}

export const modelAdapter = createEntityAdapter<SpatialModel>();

export type Tool = 'pan' | 'select' | 'box';

export type ToolbarType = typeof initialState;

export type ClusteringType = { indices: number[], centroid: VectorLike }[]

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

  shadows: Shadow[];

  lineWidth: number;
  activeHistory: number;

  activeModel: EntityId;

  models: EntityState<SpatialModel, EntityId>,

  selectedTool: Tool,

  clustering: ClusteringType,

  identifiedBundles: number[][],
  sequenceInput: number[][],

  clusteringResult: { meanStart: VectorLike, meanEnd: VectorLike, indices: number[] }[]
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

  shadows: [],

  history: [],
  activeHistory: -1,

  activeModel: undefined,

  models: modelAdapter.getInitialState(),

  shape: undefined,
  color: undefined,

  bounds: undefined,

  clustering: [],

  selectedTool: 'select' as Tool,

  identifiedBundles: [],
  sequenceInput: [],

  clusteringResult: [],
};

export const shadowSyncer = (state: ViewsState) => {
  let i = 0;
  const shadows = new Array<Shadow>();
  const lines = new Array<number>();

  Object.values(state.models.entities).forEach((model) => {
    shadows.push(...model.shadows);

    const modelLines = model.line.map((lineIndex) => {
      const idx = model.shadows.findIndex((e) => e.copyOf === lineIndex);

      if (idx >= 0) {
        return state.filter.length + idx + i;
      }

      return lineIndex;
    })

    lines.push(...modelLines)

    i += model.shadows.length;
  })


  state.shadows = shadows;
  state.lines = lines;
}

export const viewslice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    clearModel: (state, action: PayloadAction<{ id: EntityId }>) => {
      const model = state.models.entities[state.activeModel];

      model.labels = [];
      model.line = [];
      model.colorFilter = null;
      model.lineFilter = null;
    },
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
    setClustering: (state, action: PayloadAction<ClusteringType>) => {
      state.clustering = action.payload;
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

      shadowSyncer(state)
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
        line: [],
        x: normalizedPositions.map((value) => value.x),
        y: normalizedPositions.map((value) => value.y),
        layoutConfigurations: layoutAdapter.getInitialState(),
        filterToShadow: {},
        shadows: [],
        sequences: sequenceAdapter.getInitialState(),
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
    Trigger_DBSCAN: (state) => {

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
      action: PayloadAction<{ id: EntityId; colors: number[], colorFilter?: { column: string, color: string, active: boolean, indices: number[] }[] }>
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
    },
    syncShadows: (state) => {
      shadowSyncer(state)
    },
    setIdentifiedBundles: (state, action: PayloadAction<{ clustering: number[][], sequenceInput: number[][], clusteringResult }>) => {
      state.identifiedBundles = action.payload.clustering;
      state.sequenceInput = action.payload.sequenceInput;
      state.clusteringResult = action.payload.clusteringResult;
      console.log(structuredClone(action.payload));
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




export const selectByRegex = createAsyncThunk('layouts/selectbyregex',
  async ({ pattern }: {
    pattern: Pattern[];
  }, { dispatch, getState }) => {
    const state = getState() as RootState;

    const activeModel = state.views.present.models.entities[state.views.present.activeModel];

    const totalSelection = [];
    try {

      Object.values(activeModel.lineFilter).forEach((filter) => {
        const rows = filter.indices.map((index) => state.data.rows[index])
        const matcher = new RegexMatcher(pattern, rows as any);

        const path = matcher.match();
        if (path) {
          totalSelection.push(...path.map((index) => rows[index]).map((value) => value.index))
        }
      })
    } catch (e) {
      console.log(e);
    }

    dispatch(setSelection(totalSelection))
  })





export const removeLayoutConfigAsync = createAsyncThunk('layouts/addsubembedding',
  async ({ channel }: { channel: string }, { dispatch, getState }) => {
    dispatch(removeLayoutConfig({ channel }))
    dispatch(rerunLayouts({ id: (getState() as RootState).views.present.activeModel }))
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
      line: [],
      filterToShadow: {},
      shadows: [],
      sequences: sequenceAdapter.getInitialState(),
    };

    dispatch(addSubEmbedding(subModel))
    dispatch(setBounds({ id: modelId }))
    dispatch(setTool('select'))
    dispatch(activateModel({ id: modelId }))
    dispatch(rerunLayouts({ id: modelId }))
  })


/**
 * Transfers points from one container to another container.
 */
export const transfer = createAsyncThunk(
  'layouts/transfer',
  async ({ target, globalIds, focusAndContext }: { target?: EntityId, globalIds: number[], focusAndContext?: boolean }, { getState, dispatch }) => {
    let state = getState() as RootState;

    const globalIdsSet = new Set(globalIds);

    // Target model
    const targetModel = state.views.present.models.entities[target];

    // List of models where items are taken from
    const sourceModels = Object.values(state.views.present.models.entities).filter((model) => model.filter.some((value) => globalIdsSet.has(value)) && model !== targetModel);

    // Update filter and shadows of source models
    sourceModels.forEach((model) => {
      const shadowSet = new Set(model.shadows.map((shadow) => shadow.copyOf));
      const ids = model.filter.filter((value) => globalIdsSet.has(value));

      const shadows = ids.map((id) => {
        return {
          copyOf: id,
          position: state.views.present.positions[id],
          color: state.views.present.color[id],
        }
      })

      const newFilter = model.filter.filter((index) => !globalIdsSet.has(index))

      dispatch(updateModel({ id: model.id, changes: { shadows: [...shadows, ...model.shadows], filter: newFilter } }))
    })

    state = getState() as RootState;

    if (target) {
      // Delete shadows if points were moved back
      const shadowsAfterRemove = targetModel.shadows.filter((shadow) => !globalIdsSet.has(shadow.copyOf))

      dispatch(updateModel({ id: target, changes: { shadows: shadowsAfterRemove, filter: Array.from(new Set([...globalIds, ...targetModel.filter])).sort() } }))
      dispatch(setBounds({ id: target }))
      dispatch(rerunLayouts({ id: target }))
    } else {
      dispatch(deleteBounds(globalIds))
    }

    dispatch(syncShadows())
  }
)


export const rerunLayouts = createAppAsyncThunk(
  'layouts/rerun',
  async ({ id }: { id: EntityId }, { dispatch, getState }) => {
    const state = getState() as RootState;
    const model = state.views.present.models.entities[id];
    const modelRows = model.filter
      .map((i) => state.data.rows[i]);

    dispatch(setBounds({ id }))
    dispatch(clearModel({ id }))
    dispatch(setLines([]))


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
              Y_in: model.filter.map((i) => state.views.present.positions[i]),
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
              model.filter.map((i) => state.views.present.positions[i])
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
                ? scaleOrdinal(DEFAULT_SCALE).domain(filteredRows)
                : scaleLinear<string>().domain(extent).range(['red', 'green']);

            const mappedColors = filteredRows.map((row) => {
              const value = color(colorScale(row)) as RGBColor
              return (value.r << 24) | (value.g << 16) | (value.b << 8) | Math.floor(value.opacity * 255)
            });

            dispatch(
              setColor({
                id: model.id,
                colors: mappedColors,
                colorFilter: layoutConfig.featureType === 'categorical' ? colorScale.domain().map((value) => {
                  const indices = modelRows.filter((row) => row[layoutConfig.column] === value).map((row) => row.index);

                  return {
                    column: value,
                    color: colorScale(value),
                    active: true,
                    indices,
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
          case 'dual_axis': {
            const { Y, x, y, labels } = await runAxisLayout(
              modelRows,
              model.area,
              state.data.columns.find((col) => col.key === layoutConfig.xColumn),
              state.data.columns.find((col) => col.key === layoutConfig.yColumn),
            );

            dispatch(updateLabels({ id: model.id, labels }));
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
              model.filter.map((i) => state.views.present.positions[i])
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
              Y_in: model.filter.map((i) => state.views.present.positions[i]),
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
            const line = new Array<number>();
            const lineFilter: LineFilter = [];

            Object.keys(grouped).forEach((group) => {
              const values = grouped[group];

              const indices = values.map((v) => v.index);
              const reverseIndices = indices.reduce((acc, val, idx) => {
                acc[val] = idx;

                return acc;
              }, {});
              const neighboorLookup = {};
              values.forEach((row, i) => {
                const prev = values[i - 1]?.index;
                const next = values[i + 1]?.index;

                neighboorLookup[row.index] = { prev, next };
              })
              console.log({ value: group, indices, reverseIndices, neighboorLookup });

              lineFilter.push({ value: group, indices, reverseIndices, neighboorLookup })

              values.forEach((row, i) => {
                if (i < values.length - 1) {
                  line.push(values[i - 1]?.index ?? 1000000, values[i].index, values[i + 1].index, values[i + 2]?.index ?? 1000000);
                }
              });
            });

            dispatch(updateModel({ id: model.id, changes: { line, lineFilter } }));

            break;
          }
        }
      }
    })


    dispatch(syncShadows());
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
  clearModel,
  setClustering,
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
  updateModel,
  syncShadows,
  Trigger_DBSCAN,
  setIdentifiedBundles
} = viewslice.actions;

export default viewslice.reducer;
