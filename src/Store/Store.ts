import {
  combineReducers,
  configureStore,
  createAction,
  createReducer,
  createSlice,
  nanoid,
} from '@reduxjs/toolkit'
import { Column, Row, dataReducer } from './DataSlice.'
import modelReducer from './ModelSlice'
import viewReducer, { viewAdapter } from './ViewSlice'
import { datasetReducer } from './DatasetSlice'
import { DataType } from '../Interfaces'
import isNumber from 'lodash/isNumber'

const combined = combineReducers({
  data: dataReducer,
  models: modelReducer,
  views: viewReducer,
  datasets: datasetReducer,
})

export type RootState = ReturnType<typeof combined>

export const loadDatasetGlobal = createAction<Row[]>('loadDataset')

const reducer = createReducer<RootState>(undefined, (builder) => {
  builder.addCase(loadDatasetGlobal, (state, action) => {
    const rows = action.payload

    const id = nanoid()

    const header = Object.keys(rows[0])

    const columns: Column[] = header.map((key) => {
      return {
        key,
        type: DataType.Unknown,
      }
    })

    columns.forEach((column) => {
      let date = false
      let numeric = true
      let ordinal = true
      let empty = false
      let min = Number.MAX_SAFE_INTEGER
      let max = Number.MIN_SAFE_INTEGER
      let distinct = new Set<string>()

      rows.forEach((row) => {
        const value = row[column.key]

        if (value === null) {
          empty = true
          return
        }

        if (numeric && !isNumber(value)) {
          numeric = false
        }

        if (numeric) {
          if (value < min) {
            min = value
          }
          if (value > max) {
            max = value
          }

          ordinal = false
        }

        if (ordinal) {
          distinct.add(value)
        }

        if (distinct.size > 100) {
          ordinal = false
        }
      })

      if (numeric) {
        column.type = DataType.Numeric
        column.domain = [min, max]
      }
      if (ordinal) {
        column.type = DataType.Ordinal
        column.domain = Array.from(distinct)
      }
    })

    rows.forEach((row, index) => {
      row.index = index
    })

    state.data.id = id
    state.data.rows = rows
    state.data.columns = columns

    state.views.views = viewAdapter.getInitialState()
    const viewId = nanoid()
    const spatial = rows.map((row) => ({ x: -1 + (Math.random() * 2), y: -1 + (Math.random() * 2) }))
    state.views.views = viewAdapter.addOne(state.views.views, {
      id: viewId,
      attributes: {
        workspace: {
          oid: 'spatial',
          id: nanoid(),
          spatial,
          bounds: {
            minX: 0,
            maxX: 1,
            minY: 0,
            maxY: 1,
          },
          children: [],
          filter: null,
          flatSpatial: spatial,
          area: null,
        },
      },
    })
    state.views.active = viewId
  })
  builder.addDefaultCase(combined)
})

export const store = configureStore({
  reducer,
})

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
