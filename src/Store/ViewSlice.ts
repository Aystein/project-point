import {
  createEntityAdapter,
  createSlice,
  EntityId,
  EntityState,
  nanoid,
} from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { SpatialModel } from './ModelSlice'
import { VectorLike } from '../Interfaces'
import { getBounds } from '../Util'
import { Rectangle } from '../WebGL/Math/Rectangle'
import { scaleLinear } from 'd3-scale'

export interface ViewAttributes {
  workspace: SpatialModel
}

export interface ViewState {
  id: EntityId
  attributes: ViewAttributes
}

export interface ViewsState {
  views: EntityState<ViewState>
  active: EntityId
}

const attributeSlice = createSlice({
  name: 'world',
  initialState: undefined as ViewAttributes,
  reducers: {
    removeEmbedding: (state, action: PayloadAction<{ id: EntityId }>) => {
      state.workspace.children.splice(
        state.workspace.children.findIndex(
          (value) => value.id === action.payload.id
        ),
        1
      )

      const flatSpatial = state.workspace.spatial.map((value) => ({
        x: value.x,
        y: value.y,
      }))

      state.workspace.children.forEach((child) => {
        const scaleX = scaleLinear()
          .domain([child.bounds.minX, child.bounds.maxX])
          .range([
            child.area.x + child.area.width * 0.01,
            child.area.x + child.area.width * 0.99,
          ])
        const scaleY = scaleLinear()
          .domain([child.bounds.minY, child.bounds.maxY])
          .range([
            child.area.y + child.area.height * 0.01,
            child.area.y + child.area.height * 0.99,
          ])

        child.filter.forEach((i, k) => {
          flatSpatial[i] = {
            x: scaleX(child.spatial[k].x),
            y: scaleY(child.spatial[k].y),
          }
        })
      })

      state.workspace.interpolate = true
      state.workspace.flatSpatial = flatSpatial
    },
    translateArea: (state, action: PayloadAction<{ id: EntityId, x: number, y: number  }>) => {
      const { id, x, y } = action.payload
      const model = state.workspace.children.find((value) => value.id === id)

      model.area.x += x
      model.area.y += y

      model.spatial = model.spatial.map((value) => ({ x: value.x + x, y: value.y + y }))

      const flatSpatial = state.workspace.spatial.map((value) => ({
        x: value.x,
        y: value.y,
      }))

      state.workspace.children.forEach((child) => {
        child.filter.forEach((i, k) => {
          flatSpatial[i] = {
            x: child.spatial[k].x,
            y: child.spatial[k].y,
          }
        })
      })

      state.workspace.interpolate = false
      state.workspace.flatSpatial = flatSpatial
    },
    updateEmbedding: (
      state,
      action: PayloadAction<{ id: EntityId; Y: VectorLike[] }>
    ) => {
      const { Y, id } = action.payload

      const model = state.workspace.children.find((value) => value.id === id)
      model.spatial = Y
      model.bounds = getBounds(Y)

      const flatSpatial = state.workspace.spatial.map((value) => ({
        x: value.x,
        y: value.y,
      }))

      state.workspace.children.forEach((child) => {
        child.filter.forEach((i, k) => {
          flatSpatial[i] = {
            x: child.spatial[k].x,
            y: child.spatial[k].y,
          }
        })
      })

      state.workspace.interpolate = true
      state.workspace.flatSpatial = flatSpatial
    },
    addSubEmbedding: (
      state,
      action: PayloadAction<{
        filter: number[]
        Y: VectorLike[]
        area: Rectangle
      }>
    ) => {
      const { filter, area } = action.payload

      const Y = filter.map((i) => state.workspace.flatSpatial[i])

      const subModel: SpatialModel = {
        oid: 'spatial',
        id: nanoid(),
        spatial: Y,
        flatSpatial: Y,
        bounds: Y ? getBounds(Y) : null,
        filter,
        area: area.serialize(),
        children: [],
        interpolate: true,
      }

      state.workspace.children.push(subModel)
    },
  },
})

export const { addSubEmbedding, updateEmbedding, removeEmbedding, translateArea } = attributeSlice.actions

export const viewAdapter = createEntityAdapter<ViewState>({})

const initialState: ViewsState = {
  views: viewAdapter.getInitialState(),
  active: undefined,
}

initialState.views = viewAdapter.addOne(initialState.views, {
  id: nanoid(),
  attributes: { workspace: null },
})

export const viewslice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    updatePosition: (state, action: PayloadAction<VectorLike[]>) => {
      state.views.entities[state.active].attributes.workspace.spatial =
        action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addDefaultCase((state, action) => {
      if (state.active !== null && state.active !== undefined) {
        const active = state.views.entities[state.active]
        active.attributes = attributeSlice.reducer(active.attributes, action)
      } else if (state.views.ids.length > 0) {
        const active = state.views.entities[state.views.ids[0]]
        active.attributes = attributeSlice.reducer(active.attributes, action)
      }
    })
  },
})

// Action creators are generated for each case reducer function
export const { updatePosition } = viewslice.actions

export default viewslice.reducer
