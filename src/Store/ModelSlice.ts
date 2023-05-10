import {
  createEntityAdapter,
  createSlice,
  EntityId,
  EntityState,
} from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Boundaries, VectorLike } from '../Interfaces'

interface BaseModel {
  id: EntityId
}

export interface SpatialModel extends BaseModel {
  oid: 'spatial'
  id: EntityId
  
  // The spatial data of this model (x, y coordinates)
  spatial: VectorLike[]

  // The boundaries of the spatial data
  bounds: Boundaries
}

export interface NeuralModel extends BaseModel {
  oid: 'neural'
  id: EntityId
  features: string[]
  classLabel: string[]
}

export type Model = SpatialModel | NeuralModel

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
    initializeModel: (state, action: PayloadAction<Model>) => {
      modelAdapter.addOne(state.models, action.payload)
    },
  },
})

// Action creators are generated for each case reducer function
export const { initializeModel } = modelSlice.actions

export default modelSlice.reducer
