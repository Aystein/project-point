import { EntityId, EntityState } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Boundaries, VectorLike } from '../Interfaces';
import { IRectangle } from '../WebGL/Math/Rectangle';
interface BaseModel {
    id: EntityId;
}
export type EmbeddingParameters = {
    embedding: 'tsne';
    perplexity: number;
};
export interface SpatialModel extends BaseModel {
    oid: 'spatial';
    id: EntityId;
    parameters?: EmbeddingParameters;
    spatial: VectorLike[];
    flatSpatial: VectorLike[];
    bounds: Boundaries;
    filter: number[];
    children: SpatialModel[];
    area: IRectangle;
}
export type Model = SpatialModel;
export interface ModelsState {
    models: EntityState<Model>;
}
export declare const modelAdapter: import("@reduxjs/toolkit").EntityAdapter<SpatialModel>;
export declare const modelSlice: import("@reduxjs/toolkit").Slice<ModelsState, {
    initializeModel: (state: import("immer/dist/internal").WritableDraft<ModelsState>, action: PayloadAction<{
        parent: Model;
        model: Model;
    }>) => void;
}, "models">;
export declare const initializeModel: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<{
    parent: Model;
    model: Model;
}, "models/initializeModel">;
declare const _default: import("redux").Reducer<ModelsState, import("redux").AnyAction>;
export default _default;
