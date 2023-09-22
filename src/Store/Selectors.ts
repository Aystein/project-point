import { useSelector } from 'react-redux';
import { RootState } from './Store';
import { modelAdapter } from './ViewSlice';
import { createSelector } from '@reduxjs/toolkit';

export const Selectors = {
  data: (state: RootState) => state.data,
  views: (state: RootState) => state.views,
};

export const selectModelById = (entityId: number) => {
  return createSelector(
    (state: RootState) => state.views.models,
    (state) => modelAdapter.getSelectors().selectById(state, entityId)
  );
};

export const selectActiveModel = createSelector(
  (state: RootState) => state.views,
  (views) => views.models.entities[views.activeModel],
);
