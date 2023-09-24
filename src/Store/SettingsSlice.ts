import {
    PayloadAction,
    createSlice
} from '@reduxjs/toolkit';

const initialState = {
    delta: 8500,
    substeps: 5,
    radiusScaling: 1,
    activeTool: 'pan'
};

export type SettingsType = typeof initialState;

const clusterSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSettings: (state, action: PayloadAction<Partial<SettingsType>>) => {
            state.delta = action.payload.delta ?? state.delta;
            state.substeps = action.payload.substeps ?? state.substeps;
            state.radiusScaling = action.payload.radiusScaling ?? state.radiusScaling;
        },
        setActiveTool: (state, action: PayloadAction<string>) => {
            state.activeTool = action.payload;
        }
    },
});

export const settingsReducer = clusterSlice.reducer;
export const { setSettings, setActiveTool } = clusterSlice.actions;
