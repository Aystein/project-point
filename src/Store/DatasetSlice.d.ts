import { EntityId, EntityState } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Model } from './ModelSlice';
export interface SingleFile {
    name: string;
}
export interface ViewsState {
    views: EntityState<SingleFile>;
    active: EntityId;
}
export declare const changeWorkspace: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<EntityId, "world/changeWorkspace">;
export declare const fileAdapter: import("@reduxjs/toolkit").EntityAdapter<SingleFile>;
export declare const viewslice: import("@reduxjs/toolkit").Slice<import("immer/dist/internal").WritableDraft<ViewsState>, {
    addFile: (state: import("immer/dist/internal").WritableDraft<ViewsState>, action: PayloadAction<Model>) => void;
}, "views">;
export declare const initializeDatasets: import("@reduxjs/toolkit").AsyncThunk<string[], void, {
    state?: unknown;
    dispatch?: import("redux").Dispatch<import("redux").AnyAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const deleteDataset: import("@reduxjs/toolkit").AsyncThunk<string, string, {
    state?: unknown;
    dispatch?: import("redux").Dispatch<import("redux").AnyAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const storeDataset: import("@reduxjs/toolkit").AsyncThunk<string, File, {
    state?: unknown;
    dispatch?: import("redux").Dispatch<import("redux").AnyAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const loadDataset: import("@reduxjs/toolkit").AsyncThunk<void, string, {
    state?: unknown;
    dispatch?: import("redux").Dispatch<import("redux").AnyAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const datasetReducer: import("redux").Reducer<import("immer/dist/internal").WritableDraft<ViewsState>, import("redux").AnyAction>;
