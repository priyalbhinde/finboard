"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Widget } from "@/types";
import styles from "./APIDataWidget.module.css";

interface APIDataWidgetProps {
  widget: Widget;
  onDelete: (id: string) => void;
  onEdit: (widget: Widget) => void;
}

export const APIDataWidget: React.FC<APIDataWidgetProps> = ({
  widget,
  onDelete,
  onEdit,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);

  const config = widget.config;
  const apiUrl = config.apiUrl as string;
  const displayMode = (config.displayMode as string) || "table";
  const selectedFields = (config.selectedFields as string[]) || [];
  const pageSize = (config.pageSize as number) || 10;
  const refreshInterval = (config.refreshInterval as number) || 60000;

  // Calculate responsive column width
  const getColumnWidth = useCallback(
    (columnCount: number, columnName: string): string => {
      const wideColumns = [
        "headline",
        "summary",
        "description",
        "name",
        "title",
        "url",
      ];
      const narrowColumns = ["id", "symbol", "rank", "index", "#"];

      const colLower = columnName.toLowerCase();

      if (wideColumns.some((w) => colLower.includes(w))) {
        return columnCount > 6 ? "250px" : "300px";
      }
      if (narrowColumns.some((n) => colLower.includes(n))) {
        return "80px";
      }
      if (
        colLower.includes("price") ||
        colLower.includes("change") ||
        colLower.includes("percent")
      ) {
        return "120px";
      }
      if (colLower.includes("time") || colLower.includes("date")) {
        return "150px";
      }

      if (columnCount > 8) return "100px";
      if (columnCount > 5) return "130px";
      return "auto";
    },
    []
  );

  // Get nested value from path
  const getNestedValue = useCallback((obj: any, path: string): any => {
    if (!path) return obj;
    const parts = path.split(".");
    let value = obj;
    for (const part of parts) {
      if (value === null || value === undefined) return undefined;
      value = value[part];
    }
    return value;
  }, []);

  // Flatten object for display
  const flattenObject = useCallback((obj: any, prefix = ""): any => {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.assign(result, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        result[newKey] = `[${value.length} items]`;
      } else {
        result[newKey] = value;
      }
    }
    return result;
  }, []);

  // Process API response
  const processResponse = useCallback(
    (responseData: any): { rows: any[]; cols: string[] } => {
      // If response is already an array
      if (Array.isArray(responseData) && responseData.length > 0) {
        const flattened = responseData.map((item) =>
          typeof item === "object" ? flattenObject(item) : { value: item }
        );
        const cols = flattened.length > 0 ? Object.keys(flattened[0]) : [];
        return { rows: flattened, cols };
      }

      // If no fields selected, find best array
      if (selectedFields.length === 0) {
        const arrayKeys = [
          "data.stocks", // Indian stocks API
          "data.indices",
          "data.allocations",
          "data.quarterlyResults",
          "data",
          "stocks",
          "results",
          "items",
          "top_gainers",
          "top_losers",
          "coins",
          "rates",
        ];
        for (const key of arrayKeys) {
          const value = getNestedValue(responseData, key);
          if (Array.isArray(value) && value.length > 0) {
            const flattened = value.map((item) =>
              typeof item === "object" ? flattenObject(item) : { value: item }
            );
            const cols = flattened.length > 0 ? Object.keys(flattened[0]) : [];
            return { rows: flattened, cols };
          }
        }

        return {
          rows: [flattenObject(responseData)],
          cols: Object.keys(flattenObject(responseData)),
        };
      }

      // Check if selected field is an ARRAY
      for (const field of selectedFields) {
        const value = getNestedValue(responseData, field);

        if (Array.isArray(value) && value.length > 0) {
          const flattened = value.map((item) =>
            typeof item === "object" ? flattenObject(item) : { value: item }
          );
          const cols = flattened.length > 0 ? Object.keys(flattened[0]) : [];
          return { rows: flattened, cols };
        }
      }

      // Check if selected field is an OBJECT
      for (const field of selectedFields) {
        const value = getNestedValue(responseData, field);
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          const keys = Object.keys(value);
          if (keys.length > 1) {
            const rows = keys.map((key) => ({
              name: key,
              value: value[key],
            }));
            return { rows, cols: ["name", "value"] };
          }
        }
      }

      // Create single row with selected fields
      const row: any = {};
      for (const field of selectedFields) {
        const value = getNestedValue(responseData, field);
        const columnName = field.split(".").pop() || field;
        row[columnName] = value;
      }

      if (Object.values(row).some((v) => v !== undefined)) {
        return { rows: [row], cols: Object.keys(row) };
      }

      return { rows: [], cols: [] };
    },
    [selectedFields, getNestedValue, flattenObject]
  );

  // Fetch data from API
  const fetchData = useCallback(
    async (showRefreshAnimation = false) => {
      if (!apiUrl) return;

      if (showRefreshAnimation) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await fetch(apiUrl, {
          mode: "cors",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();
        const { rows, cols } = processResponse(result);

        setData(rows);
        setColumns(cols);
        setLastUpdated(new Date().toLocaleTimeString());
        setCountdown(Math.floor(refreshInterval / 1000));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [apiUrl, processResponse, refreshInterval]
  );

  // Auto refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  // Countdown timer
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) =>
        prev > 0 ? prev - 1 : Math.floor(refreshInterval / 1000)
      );
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, [refreshInterval]);

  const handleManualRefresh = () => {
    fetchData(true);
    setCountdown(Math.floor(refreshInterval / 1000));
  };

  // Format cell value
  const formatValue = (value: any, columnName?: string): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";

    const colLower = (columnName || "").toLowerCase();

    // Handle Unix timestamps
    if (
      (colLower.includes("time") ||
        colLower.includes("date") ||
        colLower === "datetime") &&
      typeof value === "number"
    ) {
      const ts = value > 9999999999 ? value : value * 1000;
      const date = new Date(ts);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    if (typeof value === "number") {
      if (colLower.includes("percent") || colLower.includes("change")) {
        return (value >= 0 ? "+" : "") + value.toFixed(2) + "%";
      }
      if (Math.abs(value) >= 1000000000)
        return (value / 1000000000).toFixed(2) + "B";
      if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(2) + "M";
      if (Math.abs(value) >= 1000)
        return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
      if (Math.abs(value) < 1 && value !== 0) return value.toFixed(6);
      return value % 1 === 0 ? String(value) : value.toFixed(2);
    }
    if (typeof value === "object") {
      if (Array.isArray(value)) return `[${value.length} items]`;
      return JSON.stringify(value).substring(0, 50);
    }
    const strVal = String(value);
    if (strVal.length > 80) return strVal.substring(0, 80) + "...";
    return strVal;
  };

  // Get color for numeric values
  const getValueColor = (value: any, columnName: string): string => {
    const colLower = columnName.toLowerCase();
    const isChangeColumn =
      colLower.includes("change") ||
      colLower.includes("percent") ||
      colLower.includes("gain") ||
      colLower.includes("loss");

    if (isChangeColumn) {
      const numVal = typeof value === "number" ? value : parseFloat(value);
      if (!isNaN(numVal)) {
        if (numVal > 0) return "#10b981";
        if (numVal < 0) return "#ef4444";
      }
    }
    return "inherit";
  };

  const tableStyle = useMemo(() => {
    const needsScroll = columns.length > 5;
    return { minWidth: needsScroll ? `${columns.length * 120}px` : "100%" };
  }, [columns.length]);

  const renderTableView = () => {
    if (data.length === 0)
      return <div className={styles.noData}>No data available</div>;

    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table} style={tableStyle}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{ minWidth: getColumnWidth(columns.length, col) }}
                >
                  {col.toUpperCase().replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, pageSize).map((row: any, idx: number) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col} style={{ color: getValueColor(row[col], col) }}>
                    {formatValue(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.tableInfo}>
          Showing {Math.min(pageSize, data.length)} of {data.length} items
        </div>
      </div>
    );
  };

  const renderCardView = () => {
    if (data.length === 0)
      return <div className={styles.noData}>No data available</div>;

    const importantCols = columns
      .filter((col) => {
        const colLower = col.toLowerCase();
        return [
          "name",
          "symbol",
          "price",
          "change",
          "value",
          "headline",
          "title",
          "source",
        ].some((k) => colLower.includes(k));
      })
      .slice(0, 4);

    const displayCols =
      importantCols.length > 0 ? importantCols : columns.slice(0, 4);

    return (
      <div className={styles.cardContent}>
        <div className={styles.cardGrid}>
          {data.slice(0, 8).map((item, idx) => (
            <div key={idx} className={styles.card}>
              {displayCols.map((col) => (
                <div key={col} className={styles.cardItem}>
                  <div className={styles.cardLabel}>
                    {col.replace(/_/g, " ")}
                  </div>
                  <div
                    className={styles.cardValue}
                    style={{ color: getValueColor(item[col], col) }}
                  >
                    {formatValue(item[col], col)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChartView = () => {
    if (data.length === 0)
      return <div className={styles.noData}>No data available</div>;

    const numericCols = columns.filter((col) => {
      const colLower = col.toLowerCase();
      const firstVal = data[0]?.[col];
      return typeof firstVal === "number" || !isNaN(parseFloat(firstVal));
    });

    if (numericCols.length === 0)
      return <div className={styles.noData}>No numeric data for chart</div>;

    const valueCol =
      numericCols.find(
        (c) =>
          c.toLowerCase().includes("change") ||
          c.toLowerCase().includes("percent")
      ) || numericCols[0];
    const labelCol =
      columns.find((c) => {
        const cl = c.toLowerCase();
        return (
          cl.includes("name") || cl.includes("symbol") || cl.includes("ticker")
        );
      }) || columns[0];

    const maxVal = Math.max(
      ...data.map((d) => Math.abs(parseFloat(d[valueCol]) || 0))
    );

    return (
      <div className={styles.chartContent}>
        {data.slice(0, 10).map((item, idx) => {
          const val = parseFloat(item[valueCol]) || 0;
          const barWidth = maxVal > 0 ? (Math.abs(val) / maxVal) * 100 : 0;

          return (
            <div key={idx} className={styles.chartBar}>
              <div className={styles.chartLabel}>
                {item[labelCol] || `#${idx + 1}`}
              </div>
              <div className={styles.chartBarContainer}>
                <div
                  className={styles.chartBarFill}
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: val >= 0 ? "#10b981" : "#ef4444",
                  }}
                />
              </div>
              <div
                className={styles.chartValue}
                style={{ color: val >= 0 ? "#10b981" : "#ef4444" }}
              >
                {formatValue(val, valueCol)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate widget height
  const widgetHeight = widget.size?.height;

  return (
    <div
      className={styles.widget}
      style={widgetHeight ? { height: `${widgetHeight}px` } : undefined}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{widget.title}</h3>
        <div className={styles.headerActions}>
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              {lastUpdated} {countdown}s
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            className={`${styles.refreshBtn} ${
              isRefreshing ? styles.spinning : ""
            }`}
            title="Refresh now"
            disabled={isRefreshing}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(widget)}
            className={styles.actionBtn}
            title="Edit widget"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(widget.id)}
            className={styles.closeBtn}
            title="Close widget"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {loading && <div className={styles.loading}>Loading...</div>}
      {error && <div className={styles.error}>Error: {error}</div>}
      {!loading && !error && data.length > 0 && (
        <>
          {displayMode === "table" && renderTableView()}
          {displayMode === "card" && renderCardView()}
          {displayMode === "chart" && renderChartView()}
        </>
      )}
      {!loading && !error && data.length === 0 && (
        <div className={styles.noData}>
          No data to display. Try selecting different fields.
        </div>
      )}
    </div>
  );
};
