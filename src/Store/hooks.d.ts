import { TypedUseSelectorHook } from 'react-redux';
import { RootState, AppDispatch } from './Store';
export declare const useAppDispatch: () => AppDispatch;
export declare const useAppSelector: TypedUseSelectorHook<RootState>;
export declare const selectDatasets: ((state: import("redux").EmptyObject & {
    data: import("./DataSlice.").DataState;
    models: import("./ModelSlice").ModelsState;
    views: import("immer/dist/internal").WritableDraft<import("./ViewSlice").ViewsState>;
    datasets: import("immer/dist/internal").WritableDraft<import("./DatasetSlice").ViewsState>;
}) => string[]) & import("reselect").OutputSelectorFields<(args_0: import("immer/dist/internal").WritableDraft<import("./DatasetSlice").ViewsState>) => string[], {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const allViews: import("@reduxjs/toolkit").EntitySelectors<import("./ViewSlice").ViewState, import("redux").CombinedState<{
    data: import("./DataSlice.").DataState;
    models: import("./ModelSlice").ModelsState;
    views: import("immer/dist/internal").WritableDraft<import("./ViewSlice").ViewsState>;
    datasets: import("immer/dist/internal").WritableDraft<import("./DatasetSlice").ViewsState>;
}>>;
export declare const filterData: ((state: import("redux").EmptyObject & {
    data: import("./DataSlice.").DataState;
    models: import("./ModelSlice").ModelsState;
    views: import("immer/dist/internal").WritableDraft<import("./ViewSlice").ViewsState>;
    datasets: import("immer/dist/internal").WritableDraft<import("./DatasetSlice").ViewsState>;
}) => void) & import("reselect").OutputSelectorFields<(args_0: import("./DataSlice.").DataState) => void, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const makeGenerateSpatial: () => ((state: any, modelId: any) => import("../Interfaces").VectorLike[]) & import("reselect").OutputSelectorFields<(args_0: import("./ModelSlice").ModelsState, args_1: any) => import("../Interfaces").VectorLike[], {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
