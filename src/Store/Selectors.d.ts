import { RootState } from './Store';
export declare const Selectors: {
    data: (state: RootState) => import("./DataSlice.").DataState;
    models: (state: RootState) => import("@reduxjs/toolkit").EntityState<import("./ModelSlice").SpatialModel>;
    views: (state: RootState) => import("immer/dist/internal").WritableDraft<import("./ViewSlice").ViewsState>;
};
