import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityId,
  EntityState,
} from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import { parseCSV } from '../DataLoading/CSVLoader';
import { loadDatasetGlobal, RootState } from './Store';

export interface SingleFile {
  name: string;
  meta: {
    columns: number;
    rows: number;
  };
}

export interface FilesState {
  files: EntityState<SingleFile>;
  active: EntityId;
}

export const fileAdapter = createEntityAdapter<SingleFile>({
  selectId: (model: SingleFile) => model.name,
});

const initialState: FilesState = {
  files: fileAdapter.getInitialState(),
  active: undefined,
};

export const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(initializeDatasets.fulfilled, (state, action) => {
      fileAdapter.setAll(state.files, action.payload);
    });
    builder.addCase(deleteDataset.fulfilled, (state, action) => {
      fileAdapter.removeOne(state.files, action.payload);
    });
    builder.addCase(storeDataset.fulfilled, (state, action) => {
      fileAdapter.addOne(state.files, action.payload);
    });
  },
});

// Action creators are generated for each case reducer function
export const initializeDatasets = createAsyncThunk(
  'users/fetchByIdStatus',
  async () => {
    const opfsRoot = await navigator.storage.getDirectory();
    const files = new Array<SingleFile>();
    // @ts-ignore
    for await (let [name, handle] of opfsRoot) {
      const file = await handle.getFile();
      // read meta
      const meta = file.slice(0, 100);

      files.push({ name, meta: JSON.parse(await meta.text()) });
    }

    return files;
  }
);

export const deleteDataset = createAsyncThunk(
  'users/delete',
  async (name: string, { dispatch }) => {
    const opfsRoot = await navigator.storage.getDirectory();
    await opfsRoot.removeEntry(name);
    return name;
  }
);

export const storeDataset = createAsyncThunk(
  'users/storeforlater',
  async (
    {
      pickerFile,
      meta,
    }: { pickerFile: File; meta: { rows: number; columns: number } },
    { dispatch, getState }
  ) => {
    const state = getState() as RootState;

    await new Promise<string>((resolve) => {
      const reader = new FileReader();

      reader.onload = async () => {
        const content = reader.result.toString();

        await storeFileForLater(pickerFile.name, content, {
          rows: state.data.rows.length,
          columns: state.data.columns.length,
        });

        resolve(pickerFile.name);
      };

      reader.readAsText(pickerFile);
    });

    return {
      name: pickerFile.name,
      meta: {
        rows: state.data.rows.length,
        columns: state.data.columns.length,
      },
    };
  }
);

export const loadDataset = createAsyncThunk(
  'users/loadDataset',
  async (name: string, { dispatch }) => {
    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle(name);
    const file = await fileHandle.getFile();
    const reader = new FileReader();

    reader.onload = async () => {
      const rows = await parseCSV(reader.result.toString());
      dispatch(loadDatasetGlobal(rows));
    };

    reader.readAsBinaryString(file.slice(100));
  }
);

async function storeFileForLater(
  name: string,
  content: string,
  meta: { columns: number; rows: number }
) {
  const opfsRoot = await navigator.storage.getDirectory();

  const fileHandle = await opfsRoot.getFileHandle(name, { create: true });
  // Get a writable stream.
  // @ts-ignore
  const writable = await fileHandle.createWritable();

  await writable.write(JSON.stringify(meta).padEnd(100, ' '));
  // Write the contents of the file to the stream.
  await writable.write(content);
  // Close the stream, which persists the contents.
  await writable.close();
}

export const datasetReducer = filesSlice.reducer;
