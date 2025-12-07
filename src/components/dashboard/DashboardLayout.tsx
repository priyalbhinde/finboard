"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "next-themes";
import {
  setCurrentDashboard,
  addDashboard,
  setEditMode,
  deleteWidget,
  updateWidget,
} from "@/store/slices/dashboardSlice";
import { setSelectedWidget } from "@/store/slices/dashboardSlice";
import { RootState, AppDispatch } from "@/store";
import { Dashboard, Widget } from "@/types";
import { StorageService } from "@/services/microservices";
import { STORAGE_KEYS, GRID_SETTINGS } from "@/config";
import { generateId, createDefaultWidget } from "@/utils";
import { DashboardHeader } from "./DashboardHeader";
import { WidgetGrid } from "./WidgetGrid";
import { WidgetConfigPanel } from "./WidgetConfigPanel";
import styles from "./DashboardLayout.module.css";

export const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentDashboard, isEditMode, selectedWidgetId } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load dashboard from localStorage
    const savedDashboard = StorageService.getItem<Dashboard>(
      STORAGE_KEYS.DASHBOARD
    );
    if (savedDashboard) {
      dispatch(setCurrentDashboard(savedDashboard));
    } else {
      // Create default dashboard
      const newDashboard: Dashboard = {
        id: generateId("dashboard"),
        name: "My Financial Dashboard",
        description: "Track your favorite stocks and market data",
        widgets: [],
        theme: (theme || "dark") as "light" | "dark",
        layout: "grid",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch(addDashboard(newDashboard));
      dispatch(setCurrentDashboard(newDashboard));
    }
  }, []);

  useEffect(() => {
    if (currentDashboard) {
      StorageService.setItem(STORAGE_KEYS.DASHBOARD, currentDashboard);
    }
  }, [currentDashboard]);

  const handleAddWidget = (widgetType: string) => {
    // This will be called by the header
  };

  const handleRemoveWidget = (widgetId: string) => {
    dispatch(deleteWidget(widgetId));
  };

  const handleUpdateWidget = (widget: Widget) => {
    dispatch(updateWidget(widget));
  };

  const handleRearrange = (widgets: Widget[]) => {
    if (currentDashboard) {
      dispatch(
        setCurrentDashboard({
          ...currentDashboard,
          widgets,
          updatedAt: Date.now(),
        })
      );
    }
  };

  const handleEditWidget = (widget: Widget) => {
    dispatch(setSelectedWidget(widget.id));
    dispatch(setEditMode(true));
  };

  if (!mounted || !currentDashboard) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  const selectedWidget = selectedWidgetId
    ? currentDashboard.widgets.find((w) => w.id === selectedWidgetId)
    : null;

  return (
    <div
      className={`${styles.container} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
    >
      <DashboardHeader
        dashboard={currentDashboard}
        onAddWidget={handleAddWidget}
      />
      <div className={styles.content}>
        <WidgetGrid
          widgets={currentDashboard.widgets}
          isEditMode={isEditMode}
          selectedWidgetId={selectedWidgetId}
          onUpdateWidget={handleUpdateWidget}
          onRemoveWidget={handleRemoveWidget}
          onRearrange={handleRearrange}
          onEditWidget={handleEditWidget}
          onSelectWidget={(id) => dispatch(setSelectedWidget(id))}
        />
        {selectedWidget && isEditMode && (
          <div className={styles.configPanel}>
            <WidgetConfigPanel
              widget={selectedWidget}
              onUpdate={handleUpdateWidget}
              onClose={() => dispatch(setEditMode(false))}
            />
          </div>
        )}
      </div>
    </div>
  );
};
