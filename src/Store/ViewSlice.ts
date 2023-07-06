import { createSlice, EntityId, nanoid } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { SpatialModel } from './ModelSlice';
import { VectorLike } from '../Interfaces';
import { getBounds } from '../Util';
import { Rectangle } from '../WebGL/Math/Rectangle';
import { scaleLinear } from 'd3-scale';

export interface ViewsState {
  workspace: SpatialModel;
  hover: number[];
  selection: number[];
  lines: number[];
  positions: VectorLike[];
  lineWidth: number;
}

const initialState: ViewsState = {
  workspace: undefined,
  hover: undefined,
  selection: undefined,
  lines: undefined,
  positions: undefined,
  lineWidth: 1,
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
    removeEmbedding: (state, action: PayloadAction<{ id: EntityId }>) => {
      state.workspace.children.splice(
        state.workspace.children.findIndex(
          (value) => value.id === action.payload.id
        ),
        1
      );
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
      })
    },
    setHover: (state, action: PayloadAction<number[]>) => {
      state.hover = action.payload;
    },
    setSelection: (state, action: PayloadAction<number[]>) => {
      state.selection = action.payload;
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
      model.shape = shape;

      model.filter.forEach((i) => {
        state.workspace.shape[i] = shape[i];
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
        oid: 'spatial',
        id: nanoid(),
        bounds: Y ? getBounds(Y) : null,
        filter,
        area: area.serialize(),
        children: [],
      };

      state.workspace.children.push(subModel);
    },
  },
});

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
} = viewslice.actions;

export default viewslice.reducer;
