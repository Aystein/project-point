import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch, store } from './Store';
import { createSelector } from '@reduxjs/toolkit';
import { clusterAdapter } from './ClusterSlice';
import { layoutAdapter } from './ModelSlice';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const selectDatasets = createSelector(
  (state: RootState) => state.datasets,
  (state) => Object.values(state.files.entities).map((entry) => entry)
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


export const selectClusters = clusterSelectors.selectAll;
