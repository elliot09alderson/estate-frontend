import { configureStore } from '@reduxjs/toolkit';
import { estateApi } from './api-new';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [estateApi.reducerPath]: estateApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
        ignoredPaths: [
          'api.queries',
          'api.mutations',
        ],
      },
    }).concat(estateApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;