"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Widget } from "@/types";
import styles from "./EnhancedTableWidget.module.css";

interface EnhancedTableWidgetProps {
  widget: Widget;
  onUpdate?: (widget: Widget) => void;
  onDelete?: (widgetId: string) => void;
  onEdit?: (widget: Widget) => void;
}

export const EnhancedTableWidget: React.FC<EnhancedTableWidgetProps> = ({
  widget,
  onDelete,
  onEdit,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [apiData, setApiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = widget.config;
  const rowsPerPage = (config.rowsPerPage as number) || 10;
  const enableSort = (config.enableSort as boolean) ?? true;
  const enableFilter = (config.enableFilter as boolean) ?? true;
  const apiUrl = config.apiUrl as string;
  const selectedFields = (config.selectedFields as string[]) || [];
  const refreshInterval = (config.refreshInterval as number) || 0;
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get nested value from path like "data.rates.INR" or "top_gainers"
  const getNestedValue = (obj: any, path: string): any => {
    if (!path) return obj;
    const parts = path.split(".");
    let value = obj;
    for (const part of parts) {
      if (value === null || value === undefined) return undefined;
      // Handle array index like "top_gainers[0]"
      const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        value = value[arrayMatch[1]]?.[parseInt(arrayMatch[2])];
      } else {
        value = value[part];
      }
    }
    return value;
  };

  // Flatten a single object
  const flattenObject = (obj: any, prefix = ""): any => {
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
  };

  // Flatten array items for table display
  const flattenArrayItems = (data: any[]): any[] => {
    return data.map((item) => {
      if (typeof item !== "object" || item === null) {
        return { value: item };
      }
      return flattenObject(item);
    });
  };

  // Find first array in nested object
  const findFirstArray = (obj: any, depth = 0): any[] | null => {
    if (depth > 5) return null;
    if (Array.isArray(obj) && obj.length > 0) return obj;

    if (typeof obj === "object" && obj !== null) {
      for (const key of Object.keys(obj)) {
        const found = findFirstArray(obj[key], depth + 1);
        if (found) return found;
      }
    }
    return null;
  };

  // Process API data based on selected fields
  const processApiData = (data: any): any[] => {
    console.log("Processing API data:", data);
    console.log("Selected fields:", selectedFields);

    // If no fields selected, try to find an array in the data
    if (selectedFields.length === 0) {
      if (Array.isArray(data)) {
        return flattenArrayItems(data);
      }
      // Find first array in response
      const arr = findFirstArray(data);
      if (arr) return flattenArrayItems(arr);
      return typeof data === "object" ? [flattenObject(data)] : [];
    }

    // Check if any selected field is an array (like top_gainers, top_losers)
    for (const field of selectedFields) {
      const value = getNestedValue(data, field);
      console.log(
        `Field "${field}" value:`,
        value,
        "isArray:",
        Array.isArray(value)
      );

      if (Array.isArray(value) && value.length > 0) {
        // This field is an array - use it as table rows
        console.log("Using array field as rows:", field);
        return flattenArrayItems(value);
      }
    }

    // Check if any selected field points to an object with many keys (like data.rates)
    for (const field of selectedFields) {
      const value = getNestedValue(data, field);
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const keys = Object.keys(value);
        if (keys.length > 1) {
          // Convert object entries to rows
          console.log("Converting object to rows:", field);
          return keys.map((key) => ({
            name: key,
            value: value[key],
          }));
        }
      }
    }

    // Otherwise, create a single row with all selected field values
    const row: any = {};
    for (const field of selectedFields) {
      const value = getNestedValue(data, field);
      // Use last part of path as column name
      const columnName = field.split(".").pop() || field;
      row[columnName] = value;
    }

    // If row has values, return it
    if (Object.values(row).some((v) => v !== undefined)) {
      return [row];
    }

    return [];
  };

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!apiUrl) return;

    setLoading(true);
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
      console.log("Processed data:", processedData);
      setApiData(processedData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, selectedFields]);

  // Initial fetch and refresh interval
  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  // Get columns from data - auto-detect from actual data
  const columns = useMemo(() => {
    if (apiData.length === 0) return [];

    // Get all unique keys from data items
    const allKeys = new Set<string>();
    apiData.slice(0, 10).forEach((item) => {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((key) => allKeys.add(key));
      }
    });

    // Return columns (max 10 for readability)
    return Array.from(allKeys).slice(0, 10);
  }, [apiData]);

  const filteredData = useMemo(() => {
    let result = [...apiData];

    if (enableFilter && searchQuery) {
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (enableSort && sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        // Handle numeric strings
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
        }

        const aStr = String(aVal || "").toLowerCase();
        const bStr = String(bVal || "").toLowerCase();
        return sortOrder === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [apiData, searchQuery, sortColumn, sortOrder, enableFilter, enableSort]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

  const handleSort = (column: string) => {
    if (!enableSort) return;
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Format cell value for display
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") {
      if (Math.abs(value) >= 1000000) {
        return (value / 1000000).toFixed(2) + "M";
      }
      if (Math.abs(value) >= 1000) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
      }
      return value.toFixed(value % 1 === 0 ? 0 : 4);
    }
    return String(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{widget.title}</h3>
        <div className={styles.actions}>
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {loading && <span className={styles.loading}>⟳</span>}
          <button
            onClick={fetchData}
            className={styles.refreshBtn}
            title="Refresh data"
          >
            🔄
          </button>
          {onEdit && (
            <button onClick={() => onEdit(widget)} className={styles.editBtn}>
              ⚙️
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(widget.id)}
              className={styles.deleteBtn}
              title="Delete widget"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {enableFilter && (
        <input
          type="text"
          placeholder="Search in table..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.searchInput}
        />
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className={`${styles.th} ${
                    enableSort ? styles.sortable : ""
                  }`}
                >
                  {col.toUpperCase().replace(/_/g, " ")}
                  {enableSort && sortColumn === col && (
                    <span className={styles.sortIcon}>
                      {sortOrder === "asc" ? " ↑" : " ↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyRow}>
                  {loading ? "Loading..." : "No data available"}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className={styles.tr}>
                  {columns.map((col) => {
                    const value = row[col];
                    const isNumeric =
                      typeof value === "number" ||
                      (!isNaN(parseFloat(value)) && isFinite(value));
                    const isPositive = isNumeric && parseFloat(value) > 0;
                    const isNegative = isNumeric && parseFloat(value) < 0;

                    return (
                      <td
                        key={col}
                        className={`${styles.td} ${
                          isPositive ? styles.positive : ""
                        } ${isNegative ? styles.negative : ""}`}
                      >
                        {formatCellValue(value)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          Showing{" "}
          {paginatedData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}–
          {Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
          {filteredData.length}
        </span>
        <div className={styles.pageButtons}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className={styles.pageBtn}
          >
            ««
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className={styles.pageBtn}
          >
            ‹ Prev
          </button>
          <span className={styles.pageNum}>
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className={styles.pageBtn}
          >
            Next ›
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className={styles.pageBtn}
          >
            »»
          </button>
        </div>
      </div>
    </div>
  );
};
