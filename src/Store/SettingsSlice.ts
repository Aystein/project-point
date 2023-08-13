import {
    PayloadAction,
    createSlice
} from '@reduxjs/toolkit';

const initialState = {
    delta: 1500,
    substeps: 10,
    radiusScaling: 1,
};

type StateType = typeof initialState;

const clusterSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSettings: (state, action: PayloadAction<Partial<StateType>>) => {
            state.delta = action.payload.delta ?? state.delta;
            state.substeps = action.payload.substeps ?? state.substeps;
            state.radiusScaling = action.payload.radiusScaling ?? state.radiusScaling;
        },
    },
});

export const settingsReducer = clusterSlice.reducer;
export const { setSettings } = clusterSlice.actions;
