import { RootState } from './Store';

export const Selectors = {
  data: (state: RootState) => state.data,
  views: (state: RootState) => state.views,
};
