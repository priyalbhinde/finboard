import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Widget, Dashboard, UserPreferences } from '@/types';

interface DashboardState {
  currentDashboard: Dashboard | null;
  dashboards: Dashboard[];
  widgets: Record<string, Widget>;
  selectedWidgetId: string | null;
  isEditMode: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  currentDashboard: null,
  dashboards: [],
  widgets: {},
  selectedWidgetId: null,
  isEditMode: false,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setCurrentDashboard: (state, action: PayloadAction<Dashboard>) => {
      state.currentDashboard = action.payload;
      state.widgets = action.payload.widgets.reduce(
        (acc, widget) => {
          acc[widget.id] = widget;
          return acc;
        },
        {} as Record<string, Widget>
      );
    },
    addDashboard: (state, action: PayloadAction<Dashboard>) => {
      state.dashboards.push(action.payload);
    },
    deleteDashboard: (state, action: PayloadAction<string>) => {
      state.dashboards = state.dashboards.filter((d) => d.id !== action.payload);
    },
    addWidget: (state, action: PayloadAction<Widget>) => {
      if (state.currentDashboard) {
        state.currentDashboard.widgets.push(action.payload);
        state.widgets[action.payload.id] = action.payload;
      }
    },
    updateWidget: (state, action: PayloadAction<Widget>) => {
      state.widgets[action.payload.id] = action.payload;
      if (state.currentDashboard) {
        const index = state.currentDashboard.widgets.findIndex(
          (w) => w.id === action.payload.id
        );
        if (index !== -1) {
          state.currentDashboard.widgets[index] = action.payload;
        }
      }
    },
    deleteWidget: (state, action: PayloadAction<string>) => {
      if (state.currentDashboard) {
        state.currentDashboard.widgets = state.currentDashboard.widgets.filter(
          (w) => w.id !== action.payload
        );
      }
      delete state.widgets[action.payload];
    },
    rearrangeWidgets: (state, action: PayloadAction<Widget[]>) => {
      if (state.currentDashboard) {
        state.currentDashboard.widgets = action.payload;
      }
    },
    setSelectedWidget: (state, action: PayloadAction<string | null>) => {
      state.selectedWidgetId = action.payload;
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
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
  setCurrentDashboard,
  addDashboard,
  deleteDashboard,
  addWidget,
  updateWidget,
  deleteWidget,
  rearrangeWidgets,
  setSelectedWidget,
  setEditMode,
  setLoading,
  setError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
