import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch, store } from './Store';
import { createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { clusterAdapter } from './ClusterSlice';
import { layoutAdapter } from './interfaces';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const selectDatasets = createSelector(
  (state: RootState) => state.datasets.files.entities,
  (state) => Object.values(state)
);

export const filterData = createSelector(
  (state: RootState) => state.data,
  (entities) => {
    return;
  }
);

const clusterSelectors = clusterAdapter.getSelectors<RootState>(
  (state) => state.clusters.clusters
);

const layoutSelectors = layoutAdapter.getSelectors()

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  rejectValue: string
  // extra: { s: string; n: number } // This is extra data prop, can leave it out if you are not passing extra data
}>()

export const selectClusters = clusterSelectors.selectAll;
