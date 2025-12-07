"use client";

import React, { useState } from "react";
import { Widget } from "@/types";
import styles from "./WidgetConfigPanel.module.css";

interface WidgetConfigPanelProps {
  widget: Widget;
  onUpdate: (widget: Widget) => void;
  onClose?: () => void;
}

type WidgetType = "table" | "finance-cards" | "chart" | "custom-api";

export const WidgetConfigPanel: React.FC<WidgetConfigPanelProps> = ({
  widget,
  onUpdate,
  onClose,
}) => {
  const [config, setConfig] = useState(widget.config);
  const [title, setTitle] = useState(widget.title);
  const [widgetType, setWidgetType] = useState<WidgetType>(
    (config.widgetType as WidgetType) || "custom-api"
  );

  // Custom API Widget states
  const [apiUrl, setApiUrl] = useState((config.apiUrl as string) || "");
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const [displayMode, setDisplayMode] = useState<"card" | "table" | "chart">(
    (config.displayMode as "card" | "table" | "chart" | undefined) || "card"
  );
  const [selectedFields, setSelectedFields] = useState<string[]>(
    (config.selectedFields as string[]) || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showArraysOnly, setShowArraysOnly] = useState(false);

  // Table Widget states
  const [rowsPerPage, setRowsPerPage] = useState(
    (config.rowsPerPage as number) || 10
  );
  const [enableSort, setEnableSort] = useState(
    (config.enableSort as boolean) ?? true
  );
  const [enableFilter, setEnableFilter] = useState(
    (config.enableFilter as boolean) ?? true
  );

  // Finance Cards states
  const [cardType, setCardType] = useState(
    (config.cardType as string) || "watchlist"
  );
  const [cardsPerRow, setCardsPerRow] = useState(
    (config.cardsPerRow as number) || 4
  );

  // Chart states
  const [chartType, setChartType] = useState(
    (config.chartType as string) || "line"
  );
  const [chartInterval, setChartInterval] = useState(
    (config.chartInterval as string) || "daily"
  );
  const [enableAnalytics, setEnableAnalytics] = useState(
    (config.enableAnalytics as boolean) ?? true
  );

  const handleTestApi = async () => {
    if (!apiUrl.trim()) {
      setTestResult("❌ Please enter an API URL");
      return;
    }

    setTestLoading(true);
    try {
      const response = await fetch(apiUrl, {
        mode: "cors",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        setTestResult(`❌ API Error: ${response.status}`);
        setAvailableFields([]);
      } else {
        const data = await response.json();
        const fields = extractFields(data);
        setAvailableFields(fields);

        if (fields.length > 0) {
          setTestResult(
            `✓ API connection successful! ${fields.length} fields found.`
          );
        } else {
          setTestResult("❌ No fields found");
        }
      }
    } catch (error) {
      setTestResult(`❌ Connection failed`);
      setAvailableFields([]);
    } finally {
      setTestLoading(false);
    }
  };

  const extractFields = (obj: any, prefix = "", depth = 0): string[] => {
    const fields: string[] = [];
    if (typeof obj !== "object" || obj === null) return fields;

    if (depth > 5) return fields;

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];

        if (value === null || value === undefined) {
          fields.push(fullKey);
        } else if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          fields.push(fullKey);
        } else if (Array.isArray(value)) {
          fields.push(fullKey);
          if (
            value.length > 0 &&
            typeof value[0] === "object" &&
            value[0] !== null
          ) {
            const arrayElementFields = extractFields(
              value[0],
              `${fullKey}.0`,
              depth + 1
            );
            fields.push(...arrayElementFields);
          }
        } else if (typeof value === "object") {
          const nestedFields = extractFields(value, fullKey, depth + 1);
          fields.push(...nestedFields);
        }
      }
    }

    return fields;
  };

  const filteredFields = availableFields.filter((field) => {
    const matchesSearch = field
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (showArraysOnly) {
      return matchesSearch && field.includes(".");
    }
    return matchesSearch;
  });

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleSave = () => {
    const updatedConfig: any = {
      ...config,
      widgetType,
    };

    if (widgetType === "custom-api") {
      updatedConfig.apiUrl = apiUrl;
      updatedConfig.displayMode = displayMode;
      updatedConfig.selectedFields = selectedFields;
    } else if (widgetType === "table") {
      updatedConfig.rowsPerPage = rowsPerPage;
      updatedConfig.enableSort = enableSort;
      updatedConfig.enableFilter = enableFilter;
    } else if (widgetType === "finance-cards") {
      updatedConfig.cardType = cardType;
      updatedConfig.cardsPerRow = cardsPerRow;
    } else if (widgetType === "chart") {
      updatedConfig.chartType = chartType;
      updatedConfig.chartInterval = chartInterval;
      updatedConfig.enableAnalytics = enableAnalytics;
    }

    onUpdate({
      ...widget,
      title,
      config: updatedConfig,
    });

    onClose?.();
  };

  return (
    <div className={styles.panel}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>
          Configure Widget
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "var(--text-tertiary)",
          }}
        >
          ✕
        </button>
      </div>

      {/* Widget Type Selection */}
      <div className={styles.group}>
        <label className={styles.label}>Widget Type</label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        >
          {[
            { value: "custom-api", label: "🔗 Custom API" },
            { value: "table", label: "📊 Table" },
            { value: "finance-cards", label: "💳 Cards" },
            { value: "chart", label: "📈 Chart" },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setWidgetType(type.value as WidgetType)}
              style={{
                padding: "12px",
                background:
                  widgetType === type.value
                    ? "var(--primary)"
                    : "var(--surface-secondary)",
                color:
                  widgetType === type.value ? "white" : "var(--text-color)",
                border: `2px solid ${
                  widgetType === type.value
                    ? "var(--primary)"
                    : "var(--border-color)"
                }`,
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s ease",
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Common Settings */}
      <div className={styles.group}>
        <label className={styles.label}>Widget Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          placeholder="e.g., Bitcoin Prices"
        />
      </div>

      {/* Custom API Widget Settings */}
      {widgetType === "custom-api" && (
        <>
          <div className={styles.group}>
            <label className={styles.label}>API URL</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                type="text"
                placeholder="https://api.example.com/data"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className={styles.input}
                style={{ flex: 1 }}
              />
              <button
                onClick={handleTestApi}
                disabled={testLoading}
                style={{
                  padding: "10px 16px",
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontWeight: "600",
                  opacity: testLoading ? 0.7 : 1,
                }}
              >
                {testLoading ? "Testing..." : "✓ Test"}
              </button>
            </div>
            {testResult && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  background: testResult.includes("✓")
                    ? "rgba(16, 185, 129, 0.1)"
                    : "rgba(239, 68, 68, 0.1)",
                  color: testResult.includes("✓")
                    ? "var(--success)"
                    : "var(--danger)",
                  border: testResult.includes("✓")
                    ? "1px solid var(--success)"
                    : "1px solid var(--danger)",
                }}
              >
                {testResult}
              </div>
            )}
          </div>

          {availableFields.length > 0 && (
            <>
              <div className={styles.group}>
                <label
                  className={styles.label}
                  style={{ marginBottom: "12px", display: "block" }}
                >
                  Display Mode
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["card", "table", "chart"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDisplayMode(mode)}
                      style={{
                        padding: "8px 14px",
                        background:
                          displayMode === mode
                            ? "var(--primary)"
                            : "var(--surface-secondary)",
                        color:
                          displayMode === mode ? "white" : "var(--text-color)",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {mode === "card" && "🎯 Card"}
                      {mode === "table" && "📋 Table"}
                      {mode === "chart" && "📊 Chart"}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.group}>
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.group}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showArraysOnly}
                    onChange={(e) => setShowArraysOnly(e.target.checked)}
                  />
                  Show nested fields only
                </label>
              </div>

              <div className={styles.group}>
                <label
                  className={styles.label}
                  style={{ fontSize: "12px", marginBottom: "8px" }}
                >
                  Available Fields
                </label>
                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                  }}
                >
                  {filteredFields.map((field) => (
                    <div
                      key={field}
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12px",
                      }}
                    >
                      <span>{field}</span>
                      <button
                        onClick={() => handleFieldToggle(field)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: selectedFields.includes(field)
                            ? "var(--primary)"
                            : "var(--text-tertiary)",
                          fontSize: "16px",
                        }}
                      >
                        {selectedFields.includes(field) ? "✓" : "+"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {selectedFields.length > 0 && (
                <div className={styles.group}>
                  <label
                    className={styles.label}
                    style={{ fontSize: "12px", marginBottom: "8px" }}
                  >
                    Selected Fields
                  </label>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {selectedFields.map((field) => (
                      <div
                        key={field}
                        style={{
                          padding: "6px 10px",
                          background: "var(--primary)",
                          color: "white",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                        }}
                      >
                        {field}
                        <button
                          onClick={() => handleFieldToggle(field)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "14px",
                            padding: 0,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Table Widget Settings */}
      {widgetType === "table" && (
        <>
          <div className={styles.group}>
            <label className={styles.label}>Rows Per Page</label>
            <input
              type="number"
              min="5"
              max="100"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
              className={styles.input}
            />
          </div>

          <div className={styles.group}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={enableSort}
                onChange={(e) => setEnableSort(e.target.checked)}
              />
              Enable Column Sorting
            </label>
          </div>

          <div className={styles.group}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={enableFilter}
                onChange={(e) => setEnableFilter(e.target.checked)}
              />
              Enable Filtering & Search
            </label>
          </div>

          <div
            style={{
              padding: "12px",
              background: "var(--surface-secondary)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            💡 Table widget displays real-time stock data with sorting,
            filtering, and pagination
          </div>
        </>
      )}

      {/* Finance Cards Settings */}
      {widgetType === "finance-cards" && (
        <>
          <div className={styles.group}>
            <label className={styles.label}>Card Type</label>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              className={styles.input}
            >
              <option value="watchlist">⭐ Watchlist</option>
              <option value="gainers">🚀 Market Gainers</option>
              <option value="losers">📉 Market Losers</option>
              <option value="performance">📊 Performance Data</option>
            </select>
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Cards Per Row</label>
            <input
              type="number"
              min="1"
              max="6"
              value={cardsPerRow}
              onChange={(e) => setCardsPerRow(parseInt(e.target.value))}
              className={styles.input}
            />
          </div>

          <div
            style={{
              padding: "12px",
              background: "var(--surface-secondary)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            💡 Finance cards show watchlist, market movers, and performance
            metrics at a glance
          </div>
        </>
      )}

      {/* Chart Settings */}
      {widgetType === "chart" && (
        <>
          <div className={styles.group}>
            <label className={styles.label}>Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className={styles.input}
            >
              <option value="line">📈 Line Chart</option>
              <option value="candle">🕯️ Candlestick Chart</option>
              <option value="bar">📊 Bar Chart</option>
            </select>
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Time Interval</label>
            <select
              value={chartInterval}
              onChange={(e) => setChartInterval(e.target.value)}
              className={styles.input}
            >
              <option value="1min">1 Minute</option>
              <option value="5min">5 Minutes</option>
              <option value="15min">15 Minutes</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className={styles.group}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={enableAnalytics}
                onChange={(e) => setEnableAnalytics(e.target.checked)}
              />
              <span>
                🤖 Show AI Price Analysis <strong>(Bonus)</strong>
              </span>
            </label>
          </div>

          <div
            style={{
              padding: "12px",
              background: "var(--surface-secondary)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            💡 View candlestick, line, or bar charts with multiple time
            intervals. AI analysis provides price predictions and trend
            insights!
          </div>
        </>
      )}

      {/* Save Button */}
      <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "var(--surface-secondary)",
            color: "var(--text-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};
