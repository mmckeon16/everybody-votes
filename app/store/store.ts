import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { resultsApi } from './api/resultsApi';

export const store = configureStore({
  reducer: {
    // [questionsApi.reducerPath]: questionsApi.reducer,
    [resultsApi.reducerPath]: resultsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      questionsApi.middleware,
      resultsApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
