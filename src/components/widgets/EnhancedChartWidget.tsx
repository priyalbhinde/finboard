"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Widget } from "@/types";
import styles from "./EnhancedChartWidget.module.css";

interface ChartDataPoint {
  label: string;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface EnhancedChartWidgetProps {
  widget: Widget;
  onUpdate?: (widget: Widget) => void;
  onDelete?: (widgetId: string) => void;
  onEdit?: (widget: Widget) => void;
}

export const EnhancedChartWidget: React.FC<EnhancedChartWidgetProps> = ({
  widget,
  onEdit,
  onDelete,
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const config = widget.config;
  const chartType = (config.chartType as string) || "line";
  const apiUrl = config.apiUrl as string;
  const selectedFields = (config.selectedFields as string[]) || [];
  const refreshInterval = (config.refreshInterval as number) || 60;

  // Fetch data from API
  const fetchData = useCallback(
    async (isManualRefresh = false) => {
      if (!apiUrl) {
        // Use sample data if no API
        setChartData([
          { label: "10:00", value: 100 },
          { label: "11:00", value: 105 },
          { label: "12:00", value: 102 },
          { label: "13:00", value: 110 },
          { label: "14:00", value: 115 },
          { label: "15:00", value: 120 },
          { label: "16:00", value: 118 },
        ]);
        setLastUpdated(new Date().toLocaleTimeString());
        setCountdown(refreshInterval);
        return;
      }

      if (isManualRefresh) {
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

        const data = await response.json();
        const processedData = processApiData(data);
        setChartData(processedData);
        setLastUpdated(new Date().toLocaleTimeString());
        setCountdown(refreshInterval);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [apiUrl, selectedFields, refreshInterval]
  );

  // Process API data for charting
  const processApiData = (data: any): ChartDataPoint[] => {
    // Get nested value from path
    const getNestedValue = (obj: any, path: string): any => {
      const parts = path.split(".");
      let value = obj;
      for (const part of parts) {
        value = value?.[part];
      }
      return value;
    };

    // Handle CoinGecko market_chart format: { prices: [[timestamp, price], ...] }
    if (data.prices && Array.isArray(data.prices)) {
      return data.prices
        .slice(-30)
        .map((item: [number, number], idx: number) => ({
          label: new Date(item[0]).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value: item[1],
          close: item[1],
        }));
    }

    // Handle Alpha Vantage Time Series format
    if (data["Time Series (Daily)"]) {
      const timeSeries = data["Time Series (Daily)"];
      return Object.entries(timeSeries)
        .slice(0, 30)
        .reverse()
        .map(([date, values]: [string, any]) => ({
          label: date.slice(5), // MM-DD format
          value: parseFloat(values["4. close"]),
          open: parseFloat(values["1. open"]),
          high: parseFloat(values["2. high"]),
          low: parseFloat(values["3. low"]),
          close: parseFloat(values["4. close"]),
        }));
    }

    // Handle CoinGecko markets array (for bar charts)
    if (Array.isArray(data) && data[0]?.market_cap !== undefined) {
      return data.slice(0, 15).map((item) => ({
        label: item.symbol?.toUpperCase() || item.name || "Unknown",
        value: item.market_cap || item.current_price || item.total_volume || 0,
        close: item.current_price || 0,
      }));
    }

    // Handle array data
    if (Array.isArray(data)) {
      // Check if it's array of arrays (like prices)
      if (Array.isArray(data[0]) && data[0].length === 2) {
        return data.slice(-30).map((item: [number, number], idx: number) => ({
          label:
            typeof item[0] === "number" && item[0] > 1000000000
              ? new Date(item[0]).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : `#${idx + 1}`,
          value: item[1],
          close: item[1],
        }));
      }

      return data.slice(0, 30).map((item, idx) => ({
        label:
          item.date || item.time || item.name || item.symbol || `#${idx + 1}`,
        value: parseFloat(
          item.price || item.value || item.close || item.current_price || 0
        ),
        open: parseFloat(item.open || 0),
        high: parseFloat(item.high || 0),
        low: parseFloat(item.low || 0),
        close: parseFloat(item.close || item.price || item.current_price || 0),
      }));
    }

    // Handle nested object (like exchange rates)
    if (selectedFields.length > 0) {
      for (const field of selectedFields) {
        const value = getNestedValue(data, field);

        // Handle nested array like data.prices
        if (Array.isArray(value)) {
          if (Array.isArray(value[0]) && value[0].length === 2) {
            return value
              .slice(-30)
              .map((item: [number, number], idx: number) => ({
                label:
                  typeof item[0] === "number" && item[0] > 1000000000
                    ? new Date(item[0]).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : `#${idx + 1}`,
                value: item[1],
                close: item[1],
              }));
          }
          return value.slice(0, 30).map((item, idx) => ({
            label: item.date || item.name || item.symbol || `#${idx + 1}`,
            value: parseFloat(
              item.price || item.value || item.close || item.current_price || 0
            ),
          }));
        }

        if (typeof value === "object" && !Array.isArray(value)) {
          // Convert object to chart data (Time Series format)
          return Object.entries(value)
            .slice(0, 30)
            .map(([key, val]: [string, any]) => {
              if (typeof val === "object") {
                return {
                  label: key.slice(5) || key,
                  value: parseFloat(
                    val["4. close"] || val.close || val.price || 0
                  ),
                  open: parseFloat(val["1. open"] || val.open || 0),
                  high: parseFloat(val["2. high"] || val.high || 0),
                  low: parseFloat(val["3. low"] || val.low || 0),
                  close: parseFloat(
                    val["4. close"] || val.close || val.price || 0
                  ),
                };
              }
              return {
                label: key,
                value: parseFloat(String(val)) || 0,
              };
            });
        }
      }
    }

    // Find array in nested structure
    const findArray = (obj: any, depth = 0): any[] | null => {
      if (depth > 5) return null;
      if (Array.isArray(obj)) return obj;
      if (typeof obj === "object" && obj !== null) {
        for (const key of Object.keys(obj)) {
          const found = findArray(obj[key], depth + 1);
          if (found) return found;
        }
      }
      return null;
    };

    const arr = findArray(data);
    if (arr) {
      return arr.slice(0, 30).map((item, idx) => ({
        label:
          item.date || item.time || item.name || item.symbol || `#${idx + 1}`,
        value: parseFloat(
          item.price || item.value || item.close || item.current_price || 0
        ),
        open: parseFloat(item.open || 0),
        high: parseFloat(item.high || 0),
        low: parseFloat(item.low || 0),
        close: parseFloat(item.close || item.price || item.current_price || 0),
      }));
    }

    return [];
  };

  // Initial fetch and refresh
  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(() => fetchData(), refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  // Countdown timer
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : refreshInterval));
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, [refreshInterval]);

  const handleManualRefresh = () => {
    fetchData(true);
    setCountdown(refreshInterval);
  };

  // Calculate chart dimensions and scales
  const chartMetrics = useMemo(() => {
    if (chartData.length === 0) return null;

    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = values[values.length - 1] > values[0] ? "up" : "down";
    const changePercent =
      ((values[values.length - 1] - values[0]) / values[0]) * 100;

    return { min, max, range, avg, trend, changePercent };
  }, [chartData]);

  // Draw chart on canvas
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0 || !chartMetrics) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get DPI for high-res display
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    // More bottom padding for bar charts (rotated labels)
    const bottomPadding = chartType === "bar" ? 70 : 45;
    // Left padding includes space for Y-axis labels (drawn outside chart area)
    const padding = {
      top: 20,
      right: 15,
      bottom: bottomPadding,
      left: 55,
    };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Helper to format Y-axis values (compact for large numbers)
    const formatYValue = (val: number): string => {
      if (Math.abs(val) >= 1000000) {
        return (val / 1000000).toFixed(1) + "M";
      } else if (Math.abs(val) >= 1000) {
        return (val / 1000).toFixed(1) + "K";
      } else if (Math.abs(val) >= 100) {
        return val.toFixed(0);
      } else {
        return val.toFixed(2);
      }
    };

    // Draw grid lines
    ctx.strokeStyle = "rgba(107, 114, 128, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels - positioned to the left of chart area
      const labelValue = chartMetrics.max - (chartMetrics.range / 5) * i;
      ctx.fillStyle = "rgba(107, 114, 128, 0.7)";
      ctx.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(formatYValue(labelValue), padding.left - 6, y + 3);
    }

    const barWidth = chartWidth / chartData.length;

    if (chartType === "candle") {
      // Draw candlestick chart - use clipping to prevent overflow
      ctx.save();
      ctx.beginPath();
      ctx.rect(padding.left, padding.top, chartWidth, chartHeight);
      ctx.clip();

      const candleWidth = Math.min(Math.max(barWidth * 0.6, 3), 14);
      // Space candles evenly within chart area with small margins
      const margin = candleWidth; // margin on each side
      const availableWidth = chartWidth - margin * 2;
      const spacing =
        chartData.length > 1 ? availableWidth / (chartData.length - 1) : 0;

      chartData.forEach((point, idx) => {
        // Position candles with even spacing, first at left margin, last at right margin
        const x =
          chartData.length === 1
            ? padding.left + chartWidth / 2
            : padding.left + margin + idx * spacing;

        const openY =
          padding.top +
          chartHeight -
          ((point.open! - chartMetrics.min) / chartMetrics.range) * chartHeight;
        const closeY =
          padding.top +
          chartHeight -
          ((point.close! - chartMetrics.min) / chartMetrics.range) *
            chartHeight;
        const highY =
          padding.top +
          chartHeight -
          ((point.high! - chartMetrics.min) / chartMetrics.range) * chartHeight;
        const lowY =
          padding.top +
          chartHeight -
          ((point.low! - chartMetrics.min) / chartMetrics.range) * chartHeight;

        const isUp = point.close! >= point.open!;
        const color = isUp ? "#10b981" : "#ef4444";

        // Draw wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Draw body
        ctx.fillStyle = isUp ? color : color;
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY) || 1;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
      ctx.restore(); // Restore after clipping
    } else if (chartType === "bar") {
      // Draw bar chart
      chartData.forEach((point, idx) => {
        const x = padding.left + barWidth * idx;
        const barH =
          ((point.value - chartMetrics.min) / chartMetrics.range) * chartHeight;
        const y = padding.top + chartHeight - barH;

        const gradient = ctx.createLinearGradient(
          x,
          y,
          x,
          padding.top + chartHeight
        );
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.8)");
        gradient.addColorStop(1, "rgba(16, 185, 129, 0.3)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x + barWidth * 0.1, y, barWidth * 0.8, barH);
      });
    } else {
      // Draw line chart (default)
      // Draw fill under line
      const gradient = ctx.createLinearGradient(
        0,
        padding.top,
        0,
        padding.top + chartHeight
      );
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.3)");
      gradient.addColorStop(1, "rgba(16, 185, 129, 0.02)");

      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + chartHeight);

      chartData.forEach((point, idx) => {
        const x =
          padding.left + (chartWidth / (chartData.length - 1 || 1)) * idx;
        const y =
          padding.top +
          chartHeight -
          ((point.value - chartMetrics.min) / chartMetrics.range) * chartHeight;
        ctx.lineTo(x, y);
      });

      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw line
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();

      chartData.forEach((point, idx) => {
        const x =
          padding.left + (chartWidth / (chartData.length - 1 || 1)) * idx;
        const y =
          padding.top +
          chartHeight -
          ((point.value - chartMetrics.min) / chartMetrics.range) * chartHeight;

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw points
      chartData.forEach((point, idx) => {
        const x =
          padding.left + (chartWidth / (chartData.length - 1 || 1)) * idx;
        const y =
          padding.top +
          chartHeight -
          ((point.value - chartMetrics.min) / chartMetrics.range) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#10b981";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // X-axis labels (show subset)
    ctx.fillStyle = "rgba(107, 114, 128, 0.7)";
    ctx.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";

    // For bar charts, show all labels rotated
    if (chartType === "bar") {
      chartData.forEach((point, idx) => {
        const barW = chartWidth / chartData.length;
        const x = padding.left + barW * idx + barW / 2;
        ctx.save();
        ctx.translate(x, padding.top + chartHeight + 12);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText(point.label.substring(0, 10), 0, 0);
        ctx.restore();
      });
    } else {
      // For line/candle charts, show subset of labels
      const labelStep = Math.ceil(chartData.length / 6);
      chartData.forEach((point, idx) => {
        if (idx % labelStep === 0 || idx === chartData.length - 1) {
          const x =
            padding.left + (chartWidth / (chartData.length - 1 || 1)) * idx;
          ctx.fillText(point.label.substring(0, 8), x, height - 10);
        }
      });
    }
  }, [chartData, chartMetrics, chartType]);

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h3 className={styles.title}>{widget.title}</h3>
        <div className={styles.headerActions}>
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              {lastUpdated} {countdown > 0 && `${countdown}s`}
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
          {onEdit && (
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
          )}
          {onDelete && (
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
          )}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Stats bar - compact design */}
      {chartMetrics && (
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            Min:{" "}
            <span className={styles.statValue}>
              {chartMetrics.min.toFixed(2)}
            </span>
          </div>
          <div className={styles.stat}>
            Max:{" "}
            <span className={styles.statValue}>
              {chartMetrics.max.toFixed(2)}
            </span>
          </div>
          <div className={styles.stat}>
            Avg:{" "}
            <span className={styles.statValue}>
              {chartMetrics.avg.toFixed(2)}
            </span>
          </div>
          <div
            className={`${styles.stat} ${
              chartMetrics.trend === "up" ? styles.statUp : styles.statDown
            }`}
          >
            {chartMetrics.trend === "up" ? "↑" : "↓"}{" "}
            {chartMetrics.changePercent.toFixed(2)}%
          </div>
        </div>
      )}

      <div className={styles.chartArea}>
        {loading && chartData.length === 0 && (
          <div className={styles.loading}>Loading chart data...</div>
        )}
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </div>
  );
};
