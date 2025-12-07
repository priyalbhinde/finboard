"use client";

import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useTheme } from "next-themes";
import { AppDispatch } from "@/store";
import {
  setEditMode,
  addWidget,
  setSelectedWidget,
  setCurrentDashboard,
} from "@/store/slices/dashboardSlice";
import { Dashboard, Widget } from "@/types";
import { downloadJSON } from "@/utils";
import { StorageService } from "@/services/microservices";
import { STORAGE_KEYS } from "@/config";
import { IntelligentWidgetConfig } from "./IntelligentWidgetConfig";
import { TemplateSelector } from "./TemplateSelector";
import styles from "./DashboardHeader.module.css";

interface DashboardHeaderProps {
  dashboard: Dashboard;
  onAddWidget: (widgetType: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  dashboard,
  onAddWidget,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { setTheme, theme } = useTheme();
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateWidget = (widget: Widget) => {
    dispatch(addWidget(widget));
    dispatch(setSelectedWidget(widget.id));
    setShowConfigPanel(false);
  };

  const handleSelectTemplate = (templateDashboard: Dashboard) => {
    dispatch(setCurrentDashboard(templateDashboard));
    StorageService.setItem(STORAGE_KEYS.DASHBOARD, templateDashboard);
    setShowTemplateSelector(false);
    alert(
      `✅ Template "${templateDashboard.name}" loaded with ${templateDashboard.widgets.length} widgets!`
    );
  };

  const handleExport = () => {
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      dashboard: dashboard,
    };
    downloadJSON(
      exportData,
      `finboard-${dashboard.name.replace(/\s+/g, "-")}-${Date.now()}.json`
    );
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validate imported data
        if (data.dashboard && data.dashboard.widgets) {
          const importedDashboard: Dashboard = {
            ...data.dashboard,
            id: dashboard.id, // Keep current dashboard ID
            updatedAt: Date.now(),
          };
          dispatch(setCurrentDashboard(importedDashboard));
          StorageService.setItem(STORAGE_KEYS.DASHBOARD, importedDashboard);
          alert(
            `✅ Dashboard imported successfully! ${importedDashboard.widgets.length} widgets loaded.`
          );
        } else {
          alert("❌ Invalid dashboard file format");
        }
      } catch (err) {
        alert(
          "❌ Failed to parse dashboard file. Please check the file format."
        );
        console.error("Import error:", err);
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be re-imported
    event.target.value = "";
  };

  const handleToggleTheme = () => {
    // Toggle html class directly and persist choice so CSS variables respond immediately
    try {
      const htmlEl = document.documentElement;
      const currentlyDark = htmlEl.classList.contains("dark");

      if (currentlyDark) {
        // Switch to light
        htmlEl.classList.remove("dark");
        htmlEl.classList.add("light");
        localStorage.setItem("finboard-theme", "light");
        if (setTheme) setTheme("light");
      } else {
        // Switch to dark
        htmlEl.classList.remove("light");
        htmlEl.classList.add("dark");
        localStorage.setItem("finboard-theme", "dark");
        if (setTheme) setTheme("dark");
      }
    } catch (e) {
      // ignore in SSR
      if (setTheme) setTheme(theme === "light" ? "dark" : "light");
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.leftSection}>
          <h1 className={styles.title}>{dashboard.name}</h1>
          <p className={styles.description}>
            {dashboard.description} • {dashboard.widgets.length} widgets
          </p>
        </div>

        <div className={styles.rightSection}>
          <button
            className={styles.button}
            onClick={() => setShowTemplateSelector(true)}
            title="Load dashboard template"
          >
            📋 Templates
          </button>

          <button
            className={styles.button}
            onClick={() => dispatch(setEditMode(true))}
            title="Edit dashboard"
          >
            ✏️ Edit
          </button>

          <button
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={() => setShowConfigPanel(true)}
            title="Add custom widget"
          >
            ➕ Add Widget
          </button>

          <button
            className={styles.button}
            onClick={handleToggleTheme}
            title="Toggle dark/light mode"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            className={styles.button}
            onClick={handleImport}
            title="Import dashboard"
          >
            ⬆️ Import
          </button>

          <button
            className={styles.button}
            onClick={handleExport}
            title="Export dashboard"
          >
            ⬇️ Export
          </button>
        </div>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </header>

      {showConfigPanel && (
        <IntelligentWidgetConfig
          onCreateWidget={handleCreateWidget}
          onClose={() => setShowConfigPanel(false)}
        />
      )}

      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </>
  );
};
