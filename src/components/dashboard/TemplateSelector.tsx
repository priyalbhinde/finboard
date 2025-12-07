"use client";

import React, { useState } from "react";
import { Dashboard } from "@/types";
import { getTemplates, loadTemplate } from "@/templates";
import styles from "./TemplateSelector.module.css";

interface TemplateSelectorProps {
  onSelectTemplate: (dashboard: Dashboard) => void;
  onClose: () => void;
}

const templateIcons: Record<string, string> = {
  "Indian Market Dashboard": "🇮🇳",
  "Tech Stocks Monitor": "💻",
  "Market Overview": "📊",
  "Portfolio Tracker": "💼",
};

const templateColors: Record<string, string> = {
  "Indian Market Dashboard": "#ff9933",
  "Tech Stocks Monitor": "#3b82f6",
  "Market Overview": "#10b981",
  "Portfolio Tracker": "#8b5cf6",
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  onClose,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const templates = getTemplates();

  const handleSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      const dashboard = loadTemplate(selectedTemplate);
      if (dashboard) {
        onSelectTemplate(dashboard);
      }
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Choose a Template</h2>
          <p className={styles.subtitle}>
            Start with a pre-configured dashboard or create from scratch
          </p>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.templateGrid}>
          {templates.map((template) => (
            <div
              key={template.name}
              className={`${styles.templateCard} ${
                selectedTemplate === template.name ? styles.selected : ""
              }`}
              onClick={() => handleSelect(template.name)}
              style={{
                borderColor:
                  selectedTemplate === template.name
                    ? templateColors[template.name]
                    : undefined,
              }}
            >
              <div
                className={styles.templateIcon}
                style={{ background: templateColors[template.name] }}
              >
                {templateIcons[template.name] || "📋"}
              </div>
              <h3 className={styles.templateName}>{template.name}</h3>
              <p className={styles.templateDescription}>
                {template.description}
              </p>
              <div className={styles.templateMeta}>
                <span className={styles.widgetCount}>
                  {template.widgets.length} widgets
                </span>
                <span className={styles.themeTag}>{template.theme} theme</span>
              </div>
              <div className={styles.widgetPreview}>
                {template.widgets.slice(0, 4).map((widget, idx) => (
                  <span key={idx} className={styles.widgetTag}>
                    {widget.title.split(" ")[0]}
                  </span>
                ))}
                {template.widgets.length > 4 && (
                  <span className={styles.moreWidgets}>
                    +{template.widgets.length - 4} more
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Blank template option */}
          <div
            className={`${styles.templateCard} ${styles.blankTemplate} ${
              selectedTemplate === "blank" ? styles.selected : ""
            }`}
            onClick={() => setSelectedTemplate("blank")}
          >
            <div
              className={styles.templateIcon}
              style={{ background: "#6b7280" }}
            >
              ➕
            </div>
            <h3 className={styles.templateName}>Start Fresh</h3>
            <p className={styles.templateDescription}>
              Create an empty dashboard and add widgets manually
            </p>
            <div className={styles.templateMeta}>
              <span className={styles.widgetCount}>0 widgets</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={!selectedTemplate}
          >
            {selectedTemplate === "blank"
              ? "Create Empty Dashboard"
              : "Use Template"}
          </button>
        </div>
      </div>
    </div>
  );
};
