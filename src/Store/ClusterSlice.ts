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

  // Label of the cluster, mostly taken from dataset
  label: string;

  // Incides of the points
  indices: number[];
}

const initialState = {
  clusters: clusterAdapter.getInitialState(),
};

initialState.clusters = clusterAdapter.addOne(initialState.clusters, {
  id: nanoid(),
  name: 'Test',
  label: '0',
  indices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
});

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
