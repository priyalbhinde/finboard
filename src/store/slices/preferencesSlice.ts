import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserPreferences } from '@/types';

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  autoRefresh: true,
  refreshInterval: 60000,
  currency: 'USD',
  notifications: true,
};

interface PreferencesState extends UserPreferences {
  loading: boolean;
  error: string | null;
}

const initialState: PreferencesState = {
  ...defaultPreferences,
  loading: false,
  error: null,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload;
    },
    loadPreferences: (state, action: PayloadAction<UserPreferences>) => {
      Object.assign(state, action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTheme,
  setAutoRefresh,
  setRefreshInterval,
  setCurrency,
  setNotifications,
  loadPreferences,
  setLoading,
  setError,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
