import { RootState } from "./Store";

export const Selectors = {
  data: (state: RootState) => state.data,
  models: (state: RootState) => state.models.models,
  views: (state: RootState) => state.views,
};