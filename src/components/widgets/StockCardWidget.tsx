"use client";

import React, { useEffect, useState } from "react";
import { Widget, StockData } from "@/types";
import { financialDataClient } from "@/services/api/financialDataClient";
import { DataFormatService } from "@/services/microservices";
import styles from "./StockCardWidget.module.css";

interface StockCardWidgetProps {
  widget: Widget;
  onUpdate: (widget: Widget) => void;
}

export const StockCardWidget: React.FC<StockCardWidgetProps> = ({
  widget,
  onUpdate,
}) => {
  const [stocks, setStocks] = useState<StockData[]>([]);
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

        const response = await financialDataClient.getStockQuote(symbol);

        if (response.success && response.data) {
          const data = [response.data];
          setStocks(data);
          onUpdate({
            ...widget,
            data: { stocks: data },
            lastUpdated: Date.now(),
          });
        } else {
          setError(response.error || "Failed to fetch stock data");
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
  }, [widget.config.filters?.symbol]);

  if (loading && stocks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
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

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{widget.title}</h3>
      {stocks.map((stock) => (
        <div key={stock.symbol} className={styles.card}>
          <div className={styles.header}>
            <h4 className={styles.symbol}>{stock.symbol}</h4>
            <span className={`${styles.price}`}>${stock.price.toFixed(2)}</span>
          </div>
          <div className={styles.info}>
            <div className={styles.row}>
              <span className={styles.label}>Change:</span>
              <span
                className={`${styles.value} ${
                  stock.change >= 0 ? styles.positive : styles.negative
                }`}
              >
                {stock.change >= 0 ? "+" : ""} ${stock.change.toFixed(2)} (
                {stock.changePercent}%)
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Volume:</span>
              <span className={styles.value}>
                {DataFormatService.formatLargeNumber(stock.volume)}
              </span>
            </div>
            {stock.marketCap && (
              <div className={styles.row}>
                <span className={styles.label}>Market Cap:</span>
                <span className={styles.value}>
                  {DataFormatService.formatCurrency(stock.marketCap)}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
