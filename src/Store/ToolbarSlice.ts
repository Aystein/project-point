import {
    PayloadAction,
    createSlice
} from '@reduxjs/toolkit';

const initialState = {
    selectedTool: ''
};

export type ToolbarType = typeof initialState;

const toolbarSlice = createSlice({
    name: 'tools',
    initialState,
    reducers: {
        setTool: (state, action: PayloadAction<string>) => {
            state.selectedTool = action.payload;
        },
    },
});

export const toolbarReducer = toolbarSlice.reducer;
export const { setTool } = toolbarSlice.actions;
