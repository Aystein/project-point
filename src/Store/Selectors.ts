import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./Store";

const selectSelf = (state: RootState) => state;

export const Selectors = {
  data: createSelector(selectSelf, (state) => state.data),
  models: createSelector(selectSelf, (state) => state.models.models),
  views: createSelector(selectSelf, (state) => state.views),
};
