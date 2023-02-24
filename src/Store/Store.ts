import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import dataReducer from "./DataSlice.";
import modelReducer from "./ModelSlice";
import viewReducer from "./ViewSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    data: dataReducer,
    models: modelReducer,
    views: viewReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
