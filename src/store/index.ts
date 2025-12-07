import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import preferencesReducer from './slices/preferencesSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    preferences: preferencesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['dashboard/setCurrentDashboard', 'dashboard/updateWidget'],
        ignoredPaths: ['dashboard.currentDashboard', 'dashboard.widgets'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
