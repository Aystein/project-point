import {
  createEntityAdapter,
  createSlice,
  EntityId,
  EntityState,
  nanoid,
} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { SpatialModel } from './ModelSlice';
import { VectorLike } from '../Interfaces';
import { getBounds } from '../Util';
import { Rectangle } from '../WebGL/Math/Rectangle';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

export interface ViewsState {
  workspace: SpatialModel;
}

const initialState: ViewsState = {
  workspace: undefined,
};

export const viewslice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    updatePosition: (state, action: PayloadAction<VectorLike[]>) => {
      state.workspace.spatial = action.payload;
    },
    removeEmbedding: (state, action: PayloadAction<{ id: EntityId }>) => {
      state.workspace.children.splice(
        state.workspace.children.findIndex(
          (value) => value.id === action.payload.id
        ),
        1
      );

      const flatSpatial = state.workspace.spatial.map((value) => ({
        x: value.x,
        y: value.y,
      }));

      state.workspace.children.forEach((child) => {
        const scaleX = scaleLinear()
          .domain([child.bounds.minX, child.bounds.maxX])
          .range([
            child.area.x + child.area.width * 0.01,
            child.area.x + child.area.width * 0.99,
          ]);
        const scaleY = scaleLinear()
          .domain([child.bounds.minY, child.bounds.maxY])
          .range([
            child.area.y + child.area.height * 0.01,
            child.area.y + child.area.height * 0.99,
          ]);

        child.filter.forEach((i, k) => {
          flatSpatial[i] = {
            x: scaleX(child.spatial[k].x),
            y: scaleY(child.spatial[k].y),
          };
        });
      });

      state.workspace.interpolate = true;
      state.workspace.flatSpatial = flatSpatial;
    },
    translateArea: (
      state,
      action: PayloadAction<{ id: EntityId; x: number; y: number }>
    ) => {
      const { id, x, y } = action.payload;
      const model = state.workspace.children.find((value) => value.id === id);

      model.area.x += x;
      model.area.y += y;

      model.spatial = model.spatial.map((value) => ({
        x: value.x + x,
        y: value.y + y,
      }));

      const flatSpatial = state.workspace.spatial.map((value) => ({
        x: value.x,
        y: value.y,
      }));

      state.workspace.children.forEach((child) => {
        child.filter.forEach((i, k) => {
          flatSpatial[i] = {
            x: child.spatial[k].x,
            y: child.spatial[k].y,
          };
        });
      });

      state.workspace.interpolate = false;
      state.workspace.flatSpatial = flatSpatial;
    },
    updateEmbedding: (
      state,
      action: PayloadAction<{ id: EntityId; Y: VectorLike[] }>
    ) => {
      const { Y, id } = action.payload;

      const model = state.workspace.children.find((value) => value.id === id);
      model.spatial = Y;
      model.bounds = getBounds(Y);

      const flatSpatial = state.workspace.spatial.map((value) => ({
        x: value.x,
        y: value.y,
      }));

      state.workspace.children.forEach((child) => {
        child.filter.forEach((i, k) => {
          flatSpatial[i] = {
            x: child.spatial[k].x,
            y: child.spatial[k].y,
          };
        });
      });

      state.workspace.interpolate = true;
      state.workspace.flatSpatial = flatSpatial;
    },

    setColor: (
      state,
      action: PayloadAction<{ id: EntityId; colors: number[] }>
    ) => {
      const { colors, id } = action.payload;

      const model = state.workspace.children.find((value) => value.id === id);
      model.color = Array.from({length: model.filter.length}).map(() => [1, 0, 0, 1]).flat()

      

      model.filter.forEach((i) => {
        state.workspace.color[i * 4] = colors[i * 4 + 0]
        state.workspace.color[i * 4 + 1] = colors[i * 4 + 1]
        state.workspace.color[i * 4 + 2] = colors[i * 4 + 2]
        state.workspace.color[i * 4 + 3] = colors[i * 4 + 3]
      })
    },
    setShape: (
      state,
      action: PayloadAction<{ id: EntityId; shape: number[] }>
    ) => {
      const { shape, id } = action.payload;

      const model = state.workspace.children.find((value) => value.id === id);
      model.shape = shape

      model.filter.forEach((i) => {
        state.workspace.shape[i] = shape[i]
      })
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

      const Y = filter.map((i) => state.workspace.flatSpatial[i]);

      const subModel: SpatialModel = {
        oid: 'spatial',
        id: nanoid(),
        spatial: Y,
        flatSpatial: Y,
        bounds: Y ? getBounds(Y) : null,
        filter,
        area: area.serialize(),
        children: [],
        interpolate: true,
      };

      state.workspace.children.push(subModel);
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  updatePosition,
  addSubEmbedding,
  updateEmbedding,
  removeEmbedding,
  translateArea,
  setColor,
  setShape
} = viewslice.actions;

export default viewslice.reducer;
