import { EntityId, EntityState } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { SpatialModel } from './ModelSlice';
import { VectorLike } from '../Interfaces';
import { Rectangle } from '../WebGL/Math/Rectangle';
export interface ViewAttributes {
    workspace: SpatialModel;
}
export interface ViewState {
    id: EntityId;
    attributes: ViewAttributes;
}
export interface ViewsState {
    views: EntityState<ViewState>;
    active: EntityId;
}
export declare const addSubEmbedding: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<{
    filter: number[];
    Y: VectorLike[];
    area: Rectangle;
}, "world/addSubEmbedding">, updateEmbedding: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<{
    id: EntityId;
    Y: VectorLike[];
}, "world/updateEmbedding">, removeEmbedding: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<{
    id: EntityId;
}, "world/removeEmbedding">, translateArea: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<{
    id: EntityId;
    x: number;
    y: number;
}, "world/translateArea">;
export declare const viewAdapter: import("@reduxjs/toolkit").EntityAdapter<ViewState>;
export declare const viewslice: import("@reduxjs/toolkit").Slice<import("immer/dist/internal").WritableDraft<ViewsState>, {
    updatePosition: (state: import("immer/dist/internal").WritableDraft<ViewsState>, action: PayloadAction<VectorLike[]>) => void;
}, "views">;
export declare const updatePosition: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<VectorLike[], "views/updatePosition">;
declare const _default: import("redux").Reducer<import("immer/dist/internal").WritableDraft<ViewsState>, import("redux").AnyAction>;
export default _default;
