import { createSlice } from '@reduxjs/toolkit';



interface Cluster {
    // Display name, can be changed
    name: string

    // Label of the cluster, mostly taken from dataset
    label: string

    // Incides of the points
    indices: number[]
}

interface ClusterSet {
    
}

const initialState = {
  
};

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
});

export const dataReducer = dataSlice.reducer;
