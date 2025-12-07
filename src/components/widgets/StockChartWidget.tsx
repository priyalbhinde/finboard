"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Widget, ChartDataPoint } from "@/types";
import { financialDataClient } from "@/services/api/financialDataClient";
import styles from "./StockChartWidget.module.css";

interface StockChartWidgetProps {
  widget: Widget;
  onUpdate: (widget: Widget) => void;
}

export const StockChartWidget: React.FC<StockChartWidgetProps> = ({
  widget,
  onUpdate,
}) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const symbol = widget.config.filters?.symbol as string;
        if (!symbol) {
          setError("No symbol specified");
          setLoading(false);
          return;
        }

        let response;
        if (widget.config.chartInterval?.startsWith("1min")) {
          response = await financialDataClient.getIntradayData(
            symbol,
            widget.config.chartInterval as
              | "1min"
              | "5min"
              | "15min"
              | "30min"
              | "60min"
          );
        } else if (
          widget.config.chartInterval === "weekly" ||
          widget.config.chartInterval === "monthly"
        ) {
          // For demo, we'll use daily data
          response = await financialDataClient.getDailyData(symbol);
        } else {
          response = await financialDataClient.getDailyData(symbol);
        }

        if (response.success && response.data) {
          setData(response.data);
          onUpdate({
            ...widget,
            data: { chartData: response.data },
            lastUpdated: Date.now(),
          });
        } else {
          setError(response.error || "Failed to fetch data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(
      fetchData,
      widget.config.refreshInterval || 60000
    );
    return () => clearInterval(interval);
  }, [widget.config.filters?.symbol, widget.config.chartInterval]);

  if (loading && data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading chart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  const chartType = widget.type === "candle-chart" ? "composed" : "line";

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{widget.title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === "composed" ? (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar dataKey="open" fill="#8884d8" />
            <Line type="monotone" dataKey="close" stroke="#82ca9d" />
          </ComposedChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#8884d8"
              name="Close Price"
            />
            <Line
              type="monotone"
              dataKey="open"
              stroke="#82ca9d"
              name="Open Price"
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
