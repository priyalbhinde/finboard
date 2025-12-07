"use client";

import React, { useEffect, useState } from "react";
import { Widget } from "@/types";
import { DataFormatService, DataFilterService } from "@/services/microservices";
import styles from "./StockTableWidget.module.css";

interface StockTableWidgetProps {
  widget: Widget;
  onUpdate: (widget: Widget) => void;
}

export const StockTableWidget: React.FC<StockTableWidgetProps> = ({
  widget,
  onUpdate,
}) => {
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // This is a demo component. In production, you would fetch real data
    // For now, we'll display sample stock data
    const sampleData = [
      {
        symbol: "AAPL",
        company: "Apple Inc.",
        price: 182.5,
        change: 2.5,
        changePercent: 1.39,
        volume: 45000000,
      },
      {
        symbol: "GOOGL",
        company: "Alphabet Inc.",
        price: 140.2,
        change: -1.8,
        changePercent: -1.27,
        volume: 23000000,
      },
      {
        symbol: "MSFT",
        company: "Microsoft Corp",
        price: 417.3,
        change: 5.2,
        changePercent: 1.27,
        volume: 18000000,
      },
      {
        symbol: "TSLA",
        company: "Tesla Inc.",
        price: 242.8,
        change: -8.2,
        changePercent: -3.27,
        volume: 95000000,
      },
      {
        symbol: "META",
        company: "Meta Platforms",
        price: 501.2,
        change: 12.5,
        changePercent: 2.56,
        volume: 12000000,
      },
    ];

    const filtered = DataFilterService.filterBySearch(sampleData, searchQuery, [
      "symbol",
      "company",
    ]);

    const sorted = DataFilterService.sortData(
      filtered,
      widget.config.sortBy || "symbol",
      widget.config.sortOrder || "asc"
    );

    const paginated = DataFilterService.paginate(
      sorted,
      widget.config.currentPage || 1,
      widget.config.pageSize || 20
    );

    setDisplayData(paginated);
  }, [searchQuery, widget.config]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{widget.title}</h3>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Company</th>
              <th>Price</th>
              <th>Change</th>
              <th>Change %</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((row) => (
              <tr key={row.symbol} className={styles.row}>
                <td className={styles.bold}>{row.symbol}</td>
                <td>{row.company}</td>
                <td>${row.price.toFixed(2)}</td>
                <td
                  className={
                    row.change >= 0 ? styles.positive : styles.negative
                  }
                >
                  {row.change >= 0 ? "+" : ""} ${row.change.toFixed(2)}
                </td>
                <td
                  className={
                    row.change >= 0 ? styles.positive : styles.negative
                  }
                >
                  {row.changePercent >= 0 ? "+" : ""}{" "}
                  {row.changePercent.toFixed(2)}%
                </td>
                <td>{DataFormatService.formatLargeNumber(row.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {displayData.length === 0 && (
        <div className={styles.empty}>No stocks found</div>
      )}
    </div>
  );
};
