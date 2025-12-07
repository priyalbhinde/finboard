"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Widget } from "@/types";
import {
  finnhubWebSocket,
  RealTimeQuote,
} from "@/services/websocket/finnhubSocket";
import styles from "./RealTimeStockWidget.module.css";

interface RealTimeStockWidgetProps {
  widget: Widget;
  onDelete: (id: string) => void;
  onEdit: (widget: Widget) => void;
}

const DEFAULT_SYMBOLS = [
  "AAPL",
  "GOOGL",
  "MSFT",
  "AMZN",
  "META",
  "NVDA",
  "TSLA",
];

// Sample prices to show when market is closed
const SAMPLE_PRICES: Record<string, number> = {
  AAPL: 191.24,
  GOOGL: 174.85,
  MSFT: 378.91,
  AMZN: 184.56,
  META: 567.12,
  NVDA: 467.89,
  TSLA: 234.56,
};

export const RealTimeStockWidget: React.FC<RealTimeStockWidgetProps> = ({
  widget,
  onDelete,
  onEdit,
}) => {
  const [quotes, setQuotes] = useState<Map<string, RealTimeQuote>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousPrices, setPreviousPrices] = useState<Map<string, number>>(
    new Map()
  );

  const symbols = useMemo(() => {
    const configSymbols = widget.config.filters?.symbols as
      | string[]
      | undefined;
    return configSymbols && configSymbols.length > 0
      ? configSymbols
      : DEFAULT_SYMBOLS;
  }, [widget.config.filters?.symbols]);

  useEffect(() => {
    finnhubWebSocket.connect({
      onMessage: (data) => {
        setQuotes((prev) => {
          const newMap = new Map(prev);
          data.forEach((quote) => {
            // Store previous price for animation
            const existing = prev.get(quote.symbol);
            if (existing) {
              setPreviousPrices((p) =>
                new Map(p).set(quote.symbol, existing.price)
              );
            }
            newMap.set(quote.symbol, quote);
          });
          return newMap;
        });
      },
      onConnect: () => {
        setIsConnected(true);
        setError(null);
      },
      onDisconnect: () => setIsConnected(false),
      onError: (err) => setError(err.message),
    });

    finnhubWebSocket.subscribe(symbols);

    return () => {
      finnhubWebSocket.unsubscribe(symbols);
    };
  }, [symbols]);

  const getChangeClass = (symbol: string, currentPrice: number) => {
    const prevPrice = previousPrices.get(symbol);
    if (!prevPrice) return "";
    if (currentPrice > prevPrice) return styles.priceUp;
    if (currentPrice < prevPrice) return styles.priceDown;
    return "";
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{widget.title}</h3>
          <div className={styles.connectionStatus}>
            <span
              className={`${styles.statusDot} ${
                isConnected ? styles.connected : styles.disconnected
              }`}
            />
            <span className={styles.statusText}>
              {isConnected ? "Live" : "Disconnected"}
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.iconButton}
            onClick={() => onEdit(widget)}
            title="Edit"
          >
            ⚙️
          </button>
          <button
            className={styles.iconButton}
            onClick={() => onDelete(widget.id)}
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <span>
            ⚠️{" "}
            {error.includes("API_KEY")
              ? "Add Finnhub API key for live US stock data"
              : error}
          </span>
        </div>
      )}

      <div className={styles.content}>
        {symbols.map((symbol) => {
          const quote = quotes.get(symbol);
          const samplePrice = SAMPLE_PRICES[symbol];
          const showSample = !quote && error && samplePrice;

          return (
            <div key={symbol} className={styles.stockCard}>
              <div className={styles.symbolInfo}>
                <span className={styles.symbol}>{symbol}</span>
                {quote && (
                  <span className={styles.time}>
                    {formatTime(quote.timestamp)}
                  </span>
                )}
                {showSample && <span className={styles.time}>Sample</span>}
              </div>
              <div className={styles.priceInfo}>
                {quote ? (
                  <>
                    <span
                      className={`${styles.price} ${getChangeClass(
                        symbol,
                        quote.price
                      )}`}
                    >
                      {formatPrice(quote.price)}
                    </span>
                    {quote.volume && (
                      <span className={styles.volume}>
                        Vol: {quote.volume.toLocaleString()}
                      </span>
                    )}
                  </>
                ) : showSample ? (
                  <span className={styles.price} style={{ opacity: 0.7 }}>
                    {formatPrice(samplePrice)}
                  </span>
                ) : (
                  <span className={styles.waiting}>Waiting...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.subscribedCount}>
          📡 {symbols.length} symbols subscribed
        </span>
        <span className={styles.updateCount}>{quotes.size} active quotes</span>
      </div>
    </div>
  );
};
