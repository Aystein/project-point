import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityId,
  EntityState,
} from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'
import { Model } from './ModelSlice'
import { parseCSV } from '../Loading/CSVLoader'
import { loadDatasetGlobal } from './Store'

export interface SingleFile {
  name: string
}

export interface ViewsState {
  views: EntityState<SingleFile>
  active: EntityId
}

const attributeSlice = createSlice({
  name: 'world',
  initialState: undefined as ViewsState,
  reducers: {
    changeWorkspace: (state, action: PayloadAction<EntityId>) => {},
  },
})

export const { changeWorkspace } = attributeSlice.actions

export const viewAdapter = createEntityAdapter<SingleFile>({
  selectId: (model: SingleFile) => model.name,
})

const initialState: ViewsState = {
  views: viewAdapter.getInitialState(),
  active: undefined,
}

export const viewslice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    addView: (state, action: PayloadAction<Model>) => {
      viewAdapter.addOne(state.views, {
        name: '',
      })
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(initializeDatasets.fulfilled, (state, action) => {
      viewAdapter.setAll(
        state.views,
        action.payload.map((name) => ({ name }))
      )
    })
  },
})

// Action creators are generated for each case reducer function
export const initializeDatasets = createAsyncThunk(
  'users/fetchByIdStatus',
  async () => {
    const opfsRoot = await navigator.storage.getDirectory()
    const files = new Array<string>()
    // @ts-ignore
    for await (let [name, handle] of opfsRoot) {
      files.push(name)
    }

    return files
  }
)

export const loadDataset = createAsyncThunk(
  'users/loadDataset',
  async (name: string, { dispatch }) => {
    const opfsRoot = await navigator.storage.getDirectory()
    const fileHandle = await opfsRoot.getFileHandle(name)
    const test = await fileHandle.getFile()
    const reader = new FileReader()

    reader.onload = async () => {
      const rows = await parseCSV(reader.result.toString())
      dispatch(loadDatasetGlobal(rows))
    }

    reader.readAsBinaryString(test)
  }
)

export const datasetReducer = viewslice.reducer
