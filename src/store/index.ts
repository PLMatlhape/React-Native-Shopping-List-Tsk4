// Redux Store Configuration
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import historyReducer from './slices/historySlice';
import shoppingReducer from './slices/shoppingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    shopping: shoppingReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
