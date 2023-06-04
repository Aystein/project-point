import {
  createEntityAdapter,
  createSlice,
  EntityId,
  EntityState,
} from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Boundaries, VectorLike } from '../Interfaces'
import { IRectangle, Rectangle } from '../WebGL/Math/Rectangle'

interface BaseModel {
  id: EntityId
}

export type EmbeddingParameters = {
  embedding: 'tsne'
  perplexity: number
}

export interface SpatialModel extends BaseModel {
  oid: 'spatial'
  id: EntityId

  parameters?: EmbeddingParameters

  // The spatial data of this model (x, y coordinates)
  spatial: VectorLike[]

  // Hierarchically unnested spatial data. VERY useful as reactive state for spatial data
  flatSpatial: VectorLike[]

  // The boundaries of the spatial data
  bounds: Boundaries

  // The indices of the rows this model operates on
  filter: number[]

  children: SpatialModel[]

  area: IRectangle

  interpolate: boolean
}

export type Model = SpatialModel

export interface ModelsState {
  models: EntityState<Model>
}

export const modelAdapter = createEntityAdapter<Model>({})

const initialState: ModelsState = {
  models: modelAdapter.getInitialState(),
}

export const modelSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    initializeModel: (
      state,
      action: PayloadAction<{ parent: Model; model: Model }>
    ) => {
      //state.models.entities.
      //modelAdapter.addOne(state.models, action.payload)
    },
  },
})

// Action creators are generated for each case reducer function
export const { initializeModel } = modelSlice.actions

export default modelSlice.reducer
