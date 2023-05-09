import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch, store } from './Store'
import { createSelector } from '@reduxjs/toolkit'
import { viewAdapter } from './ViewSlice'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const selectDatasets = createSelector(
  (state: RootState) => state.datasets,
  (state) => Object.values(state.views.entities).map((entry) => entry.name)
)

export const allViews = viewAdapter.getSelectors(
  (state: RootState) => state.views.views
)
