import {
  EntityId,
  PayloadAction,
  createEntityAdapter,
  createSlice,
  nanoid,
} from '@reduxjs/toolkit';

export const clusterAdapter = createEntityAdapter<Cluster>();

export interface Cluster {
  id: EntityId;

  // Display name, can be changed
  name: string;

  // Incides of the points
  indices: number[];
}

const initialState = {
  clusters: clusterAdapter.getInitialState(),
};

export const clusterSlice = createSlice({
  name: 'clusters',
  initialState,
  reducers: {
    addCluster: (state, action: PayloadAction<Omit<Cluster, 'id'>>) => {
      clusterAdapter.addOne(state.clusters, {
        ...action.payload,
        id: nanoid(),
      });
    },
  },
});

export const clusterReducer = clusterSlice.reducer;
export const { addCluster } = clusterSlice.actions;
