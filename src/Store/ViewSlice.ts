import {
  createEntityAdapter,
  createSlice,
  EntityId,
  EntityState,
  nanoid,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Model, SpatialModel } from "./ModelSlice";
import { VectorLike } from "../Interfaces";

export interface ViewAttributes {
  workspace: SpatialModel;
  colorEncoding: string;
}

export interface ViewState {
  id: EntityId;
  attributes: ViewAttributes;
}

export interface ViewsState {
  views: EntityState<ViewState>;
  active: EntityId;
}

const attributeSlice = createSlice({
  name: "world",
  initialState: undefined as ViewAttributes,
  reducers: {
  },
});

export const { } = attributeSlice.actions;

export const viewAdapter = createEntityAdapter<ViewState>({});

const initialState: ViewsState = {
  views: viewAdapter.getInitialState(),
  active: undefined,
};

initialState.views = viewAdapter.addOne(initialState.views, {
  id: nanoid(),
  attributes: { workspace: null, colorEncoding: null },
});

export const viewslice = createSlice({
  name: "views",
  initialState,
  reducers: {
    updatePosition: (state, action: PayloadAction<VectorLike[]>) => {
      state.views.entities[state.active].attributes.workspace.spatial = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addDefaultCase((state, action) => {
      if (state.active !== null && state.active !== undefined) {
        const active = state.views.entities[state.active];
        active.attributes = attributeSlice.reducer(active.attributes, action);
      } else if (state.views.ids.length > 0) {
        const active = state.views.entities[state.views.ids[0]];
        active.attributes = attributeSlice.reducer(active.attributes, action);
      }
    });
  },
});

// Action creators are generated for each case reducer function
export const { updatePosition } = viewslice.actions;

export default viewslice.reducer;
