import { useSelector } from 'react-redux';
import { RootState } from './Store';
import { modelAdapter } from './ViewSlice';
import { createSelector } from '@reduxjs/toolkit';

export const Selectors = {
  data: (state: RootState) => state.data,
  views: (state: RootState) => state.views,
};
/**
export const selectModelById = (entityId: number) => {
  return createSelector(
    (state: RootState) => state.views.models,
    (state) => modelAdapter.getSelectors().selectById(state, entityId)
  );
};
*/
const activeModel = (state: RootState) => state.views.models.entities[state.views.activeModel];

export const selectActiveModel = createSelector(
  (state: RootState) => state.views,
  (views) => views.models.entities[views.activeModel],
);

export const selectChannelTypes = createSelector(
  activeModel,
  (model) => model ? Object.values(model.layoutConfigurations.entities).map((config) => config.channel) : []
)

export const {
  selectById: selectModelById2,
  selectIds: selectModelIds,
  selectEntities: selectModelEntities,
  selectAll: selectAllModels,
  selectTotal: selectTotalModels,
} = modelAdapter.getSelectors((state: RootState) => state.views.models)