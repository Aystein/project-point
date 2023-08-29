import {
    PayloadAction,
    createSlice
} from '@reduxjs/toolkit';

const initialState = {
    delta: 2200,
    substeps: 15,
    radiusScaling: 1,
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
    },
});

export const settingsReducer = clusterSlice.reducer;
export const { setSettings } = clusterSlice.actions;
