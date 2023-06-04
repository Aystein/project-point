import { Row } from './DataSlice.';
declare const combined: import("redux").Reducer<import("redux").CombinedState<{
    data: import("./DataSlice.").DataState;
    models: import("./ModelSlice").ModelsState;
    views: import("immer/dist/internal").WritableDraft<import("./ViewSlice").ViewsState>;
    datasets: import("immer/dist/internal").WritableDraft<import("./DatasetSlice").ViewsState>;
}>, import("redux").AnyAction>;
export type RootState = ReturnType<typeof combined>;
export declare const loadDatasetGlobal: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<Row[], string>;
export declare const store: import("@reduxjs/toolkit/dist/configureStore").ToolkitStore<import("redux").EmptyObject & {
    data: import("./DataSlice.").DataState;
    models: import("./ModelSlice").ModelsState;
    views: import("immer/dist/internal").WritableDraft<import("./ViewSlice").ViewsState>;
    datasets: import("immer/dist/internal").WritableDraft<import("./DatasetSlice").ViewsState>;
}, import("redux").AnyAction, [import("@reduxjs/toolkit").ThunkMiddleware<import("redux").CombinedState<{
    data: import("./DataSlice.").DataState;
    models: import("./ModelSlice").ModelsState;
    views: import("immer/dist/internal").WritableDraft<import("./ViewSlice").ViewsState>;
    datasets: import("immer/dist/internal").WritableDraft<import("./DatasetSlice").ViewsState>;
}>, import("redux").AnyAction, undefined>]>;
export type AppDispatch = typeof store.dispatch;
export {};
