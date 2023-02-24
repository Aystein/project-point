import {
  createAction,
  createEntityAdapter,
  createReducer,
  createSelector,
  createSlice,
  EntityId,
  EntityState,
  nanoid,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Model, SpatialModel } from "./ModelSlice";
import { RootState } from "./Store";

export interface ViewAttributes {
  workspace: EntityId | SpatialModel;
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
    changeWorkspace: (state, action: PayloadAction<EntityId>) => {
      state.workspace = action.payload;
    },
  },
});

export const { changeWorkspace } = attributeSlice.actions;

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
    addView: (state, action: PayloadAction<Model>) => {
      viewAdapter.addOne(state.views, {
        id: nanoid(),
        attributes: {
          workspace: action.payload.id,
          colorEncoding: "",
        },
      });
    },
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
export const {} = viewslice.actions;

export default viewslice.reducer;
