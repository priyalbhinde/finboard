"use client";

import React, { useState, useMemo } from "react";
import { Widget } from "@/types";
import {
  analyzeAPIResponse,
  normalizeAPIData,
  getRecommendedFields,
} from "@/utils/apiDataAdapter";
import styles from "./IntelligentWidgetConfig.module.css";

// 🇮🇳 Indian Market API Presets - Including NSE Data via Backend Proxy!
const API_PRESETS = {
  indianStocks: [
    {
      name: "📈 NIFTY 50 Stocks",
      path: "/api/indian-stocks?type=nifty50",
      description: "Live NIFTY 50 index stocks from NSE India",
      fields: ["data.stocks"],
      chartType: "table",
    },
    {
      name: "🏦 NIFTY Bank Stocks",
      path: "/api/indian-stocks?type=niftybank",
      description: "NIFTY Bank index stocks",
      fields: ["data.stocks"],
      chartType: "table",
    },
    {
      name: "💻 NIFTY IT Stocks",
      path: "/api/indian-stocks?type=niftyit",
      description: "NIFTY IT index stocks",
      fields: ["data.stocks"],
      chartType: "table",
    },
    {
      name: "🚀 Top Gainers India",
      path: "/api/indian-stocks?type=gainers",
      description: "Today's top gaining stocks on NSE",
      fields: ["data.stocks"],
      chartType: "table",
    },
    {
      name: "📉 Top Losers India",
      path: "/api/indian-stocks?type=losers",
      description: "Today's top losing stocks on NSE",
      fields: ["data.stocks"],
      chartType: "table",
    },
    {
      name: "📊 All Indices",
      path: "/api/indian-stocks?type=indices",
      description: "All major NSE indices (NIFTY, SENSEX, etc.)",
      fields: ["data.indices"],
      chartType: "table",
    },
    {
      name: "🔥 Most Active Stocks",
      path: "/api/indian-stocks?type=mostactive",
      description: "Most actively traded stocks by volume",
      fields: ["data.stocks"],
      chartType: "table",
    },
    {
      name: "🆕 Upcoming IPOs",
      path: "/api/indian-stocks?type=ipo",
      description: "Latest upcoming IPOs in Indian market",
      fields: ["data.ipos"],
      chartType: "table",
    },
    {
      name: "📅 Upcoming Results",
      path: "/api/indian-stocks?type=upcoming-results",
      description: "Upcoming quarterly/annual results calendar",
      fields: ["data.events"],
      chartType: "table",
    },
    {
      name: "💹 FII/DII Activity",
      path: "/api/indian-stocks?type=fii-dii",
      description: "Foreign & Domestic institutional investor activity",
      fields: ["data"],
      chartType: "card",
    },
    {
      name: "🕐 Market Status",
      path: "/api/indian-stocks?type=marketstatus",
      description: "Current market status (open/closed)",
      fields: ["data.status"],
      chartType: "table",
    },
  ],
  // Individual Stock Quotes - Add your favorite stocks!
  stockQuotes: [
    {
      name: "💰 SHRIRAMFIN",
      path: "/api/indian-stocks?type=quote&symbol=SHRIRAMFIN",
      description: "Shriram Finance Ltd - Live Quote",
      fields: ["data"],
      chartType: "card",
    },
    {
      name: "🛢️ RELIANCE",
      path: "/api/indian-stocks?type=quote&symbol=RELIANCE",
      description: "Reliance Industries Ltd - Live Quote",
      fields: ["data"],
      chartType: "card",
    },
    {
      name: "💻 TCS",
      path: "/api/indian-stocks?type=quote&symbol=TCS",
      description: "Tata Consultancy Services - Live Quote",
      fields: ["data"],
      chartType: "card",
    },
    {
      name: "🏦 HDFCBANK",
      path: "/api/indian-stocks?type=quote&symbol=HDFCBANK",
      description: "HDFC Bank Ltd - Live Quote",
      fields: ["data"],
      chartType: "card",
    },
    {
      name: "💡 INFY",
      path: "/api/indian-stocks?type=quote&symbol=INFY",
      description: "Infosys Ltd - Live Quote",
      fields: ["data"],
      chartType: "card",
    },
    {
      name: "🏦 ICICIBANK",
      path: "/api/indian-stocks?type=quote&symbol=ICICIBANK",
      description: "ICICI Bank Ltd - Live Quote",
      fields: ["data"],
      chartType: "card",
    },
    {
      name: "📱 BHARTIARTL",
      path: "/api/indian-stocks?type=quote&symbol=BHARTIARTL",
      description: "Bharti Airtel Ltd - Live Quote",
      fields: ["data"],
      chartType: "card",
    },
    {
      name: "🚗 TATAMOTORS",
      path: "/api/indian-stocks?type=quote&symbol=TATAMOTORS",
      description: "Tata Motors Ltd - Live Quote",
      fields: ["data"],
      chartType: "card",
    },
    {
      name: "🏗️ LT",
      path: "/api/indian-stocks?type=quote&symbol=LT",
      description: "Larsen & Toubro Ltd - Live Quote",
      fields: ["data"],
      chartType: "card",
    },
    {
      name: "🏥 APOLLOHOSP",
      path: "/api/indian-stocks?type=quote&symbol=APOLLOHOSP",
      description: "Apollo Hospitals Enterprise - Live Quote",
      fields: ["data"],
      chartType: "card",
    },
  ],
  // Company Financials - Quarterly/Yearly Data
  companyFinancials: [
    {
      name: "📊 RELIANCE Financials",
      path: "/api/indian-stocks?type=financials&symbol=RELIANCE",
      description: "Reliance Industries - Quarterly & Yearly Results",
      fields: ["data.quarterlyResults"],
      chartType: "table",
    },
    {
      name: "📊 TCS Financials",
      path: "/api/indian-stocks?type=financials&symbol=TCS",
      description: "TCS - Quarterly & Yearly Results",
      fields: ["data.quarterlyResults"],
      chartType: "table",
    },
    {
      name: "📊 HDFCBANK Financials",
      path: "/api/indian-stocks?type=financials&symbol=HDFCBANK",
      description: "HDFC Bank - Quarterly & Yearly Results",
      fields: ["data.quarterlyResults"],
      chartType: "table",
    },
    {
      name: "📊 INFY Financials",
      path: "/api/indian-stocks?type=financials&symbol=INFY",
      description: "Infosys - Quarterly & Yearly Results",
      fields: ["data.quarterlyResults"],
      chartType: "table",
    },
    {
      name: "📊 SHRIRAMFIN Financials",
      path: "/api/indian-stocks?type=financials&symbol=SHRIRAMFIN",
      description: "Shriram Finance - Quarterly & Yearly Results",
      fields: ["data.quarterlyResults"],
      chartType: "table",
    },
    {
      name: "📈 Sector Comparison",
      path: "/api/indian-stocks?type=sector-financials",
      description: "Sector-wise financial metrics comparison",
      fields: ["data.sectors"],
      chartType: "table",
    },
  ],
  // Government Budget & Investment Data
  govtBudget: [
    {
      name: "🏛️ Budget 2024-25 Allocation",
      path: "/api/indian-stocks?type=budget-allocation",
      description: "Union Budget sector-wise allocation",
      fields: ["data.allocations"],
      chartType: "table",
    },
    {
      name: "🏭 PLI & Govt Schemes",
      path: "/api/indian-stocks?type=govt-schemes",
      description: "Production Linked Incentive schemes",
      fields: ["data.schemes"],
      chartType: "table",
    },
    {
      name: "🎯 Sector Outlook",
      path: "/api/indian-stocks?type=sector-outlook",
      description: "Sector outlook based on budget impact",
      fields: ["data.analysis"],
      chartType: "table",
    },
  ],
  indianMarket: [
    {
      name: "🇮🇳 Crypto in INR",
      url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=20",
      description: "Top cryptocurrencies priced in Indian Rupees",
      fields: [
        "name",
        "symbol",
        "current_price",
        "price_change_percentage_24h",
        "market_cap",
      ],
      chartType: "table",
    },
    {
      name: "🇮🇳 INR Exchange Rates",
      url: "https://api.coinbase.com/v2/exchange-rates?currency=INR",
      description: "INR to global currency exchange rates",
      fields: ["data.rates"],
      chartType: "table",
    },
    {
      name: "🇮🇳 Top Cryptos INR (Cards)",
      url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=6",
      description: "Top 6 cryptos as cards in INR",
      fields: ["name", "current_price", "price_change_percentage_24h"],
      chartType: "card",
    },
  ],
  crypto: [
    {
      name: "🪙 Top Cryptos (USD)",
      url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20",
      description: "Top 20 cryptocurrencies by market cap",
      fields: [
        "name",
        "symbol",
        "current_price",
        "price_change_percentage_24h",
      ],
      chartType: "table",
    },
    {
      name: "₿ Bitcoin Price",
      url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,inr&include_24hr_change=true",
      description: "Bitcoin & Ethereum prices in USD and INR",
      fields: ["bitcoin", "ethereum"],
      chartType: "card",
    },
  ],
  usMarket: [
    {
      name: "📊 Top Gainers US",
      url: "https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo",
      description: "Top gaining stocks in US market",
      fields: ["top_gainers"],
      chartType: "table",
    },
    {
      name: "📉 Top Losers US",
      url: "https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo",
      description: "Top losing stocks in US market",
      fields: ["top_losers"],
      chartType: "table",
    },
    {
      name: "📰 Market News",
      url: "https://finnhub.io/api/v1/news?category=general&token=demo",
      description: "Latest financial market news",
      fields: ["headline", "source", "datetime"],
      chartType: "table",
    },
  ],
  // Real-Time WebSocket Data
  realTime: [
    {
      name: "⚡ Live US Stocks (WebSocket)",
      path: "websocket:realtime",
      description:
        "Real-time stock prices via WebSocket - AAPL, GOOGL, MSFT, etc.",
      fields: ["symbol", "price", "volume"],
      chartType: "realtime",
      symbols: ["AAPL", "GOOGL", "MSFT", "AMZN", "META", "NVDA", "TSLA"],
    },
    {
      name: "⚡ Tech Giants Live",
      path: "websocket:realtime",
      description: "Live prices for major tech stocks",
      fields: ["symbol", "price", "volume"],
      chartType: "realtime",
      symbols: ["AAPL", "GOOGL", "MSFT", "META", "NVDA"],
    },
    {
      name: "⚡ EV & Auto Live",
      path: "websocket:realtime",
      description: "Real-time EV and auto stock prices",
      fields: ["symbol", "price", "volume"],
      chartType: "realtime",
      symbols: ["TSLA", "F", "GM", "RIVN", "LCID"],
    },
  ],
  // Charts - Line, Bar, Candlestick
  charts: [
    {
      name: "📈 Crypto Price Chart (Line)",
      url: "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30",
      description: "Bitcoin 30-day price trend as line chart",
      fields: ["prices"],
      chartType: "line",
    },
    {
      name: "📊 Top Cryptos (Bar Chart)",
      url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10",
      description: "Top 10 cryptos market cap comparison",
      fields: ["market_cap"],
      chartType: "bar",
    },
    {
      name: "🕯️ Stock Candles (Candlestick)",
      url: "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=demo",
      description: "IBM daily OHLC candlestick chart",
      fields: ["Time Series (Daily)"],
      chartType: "candle",
    },
    {
      name: "📈 ETH Price Trend (Line)",
      url: "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=14",
      description: "Ethereum 14-day price line chart",
      fields: ["prices"],
      chartType: "line",
    },
    {
      name: "📊 Crypto Volume (Bar)",
      url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=8",
      description: "Top 8 cryptos by 24h volume",
      fields: ["total_volume"],
      chartType: "bar",
    },
  ],
};

interface IntelligentWidgetConfigProps {
  onCreateWidget: (widget: Widget) => void;
  onClose?: () => void;
}

interface APITestResult {
  success: boolean;
  message: string;
  analysis?: any;
  autoSelectedChartType?: string;
  autoSelectedFields?: string[];
}

interface FieldInfo {
  path: string;
  value: any;
  type: string;
  isArray: boolean;
  arrayLength?: number;
}

export const IntelligentWidgetConfig: React.FC<
  IntelligentWidgetConfigProps
> = ({ onCreateWidget, onClose }) => {
  const [step, setStep] = useState<"url" | "review" | "configure">("url");
  const [apiUrl, setApiUrl] = useState("");
  const [widgetTitle, setWidgetTitle] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<APITestResult | null>(null);
  const [autoChart, setAutoChart] = useState("line");
  const [autoFields, setAutoFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [allFields, setAllFields] = useState<FieldInfo[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [rawApiData, setRawApiData] = useState<any>(null);
  const [allData, setAllData] = useState<any[]>([]);
  const [rowsToDisplay, setRowsToDisplay] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  /**
   * Extract ALL fields from raw API data with full nested paths
   * This handles ANY API structure - Coinbase, Alpha Vantage, Finnhub, etc.
   */
  const extractAllFieldsDeep = (
    obj: any,
    prefix = "",
    maxDepth = 6
  ): FieldInfo[] => {
    const fields: FieldInfo[] = [];

    const traverse = (current: any, path: string, depth: number) => {
      if (depth > maxDepth) return;
      if (current === null || current === undefined) return;

      if (Array.isArray(current)) {
        // Add the array itself as a selectable field
        fields.push({
          path: path,
          value: current,
          type: "array",
          isArray: true,
          arrayLength: current.length,
        });

        // Also traverse first item to get nested structure
        if (current.length > 0 && typeof current[0] === "object") {
          traverse(current[0], path + "[0]", depth + 1);
        }
      } else if (typeof current === "object") {
        // For objects, traverse each key
        for (const key of Object.keys(current)) {
          const newPath = path ? `${path}.${key}` : key;
          const value = current[key];

          if (value === null || value === undefined) {
            fields.push({
              path: newPath,
              value: null,
              type: "null",
              isArray: false,
            });
          } else if (Array.isArray(value)) {
            fields.push({
              path: newPath,
              value: value,
              type: "array",
              isArray: true,
              arrayLength: value.length,
            });
            // Traverse array items
            if (value.length > 0 && typeof value[0] === "object") {
              traverse(value[0], newPath + "[0]", depth + 1);
            }
          } else if (typeof value === "object") {
            // Add the object itself
            fields.push({
              path: newPath,
              value: value,
              type: "object",
              isArray: false,
            });
            // Traverse nested object
            traverse(value, newPath, depth + 1);
          } else {
            // Primitive value - string, number, boolean
            fields.push({
              path: newPath,
              value: value,
              type: typeof value,
              isArray: false,
            });
          }
        }
      } else {
        // Primitive at root (rare)
        fields.push({
          path: path || "value",
          value: current,
          type: typeof current,
          isArray: false,
        });
      }
    };

    traverse(obj, prefix, 0);
    return fields;
  };

  // Filter fields based on search and array filter
  const filteredFields = useMemo(() => {
    let result = allFields;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.path.toLowerCase().includes(query) ||
          String(f.value).toLowerCase().includes(query)
      );
    }

    if (showArraysOnly) {
      result = result.filter((f) => f.isArray);
    }

    return result;
  }, [allFields, searchQuery, showArraysOnly]);

  // Smart API detection based on URL for better chart suggestions
  const detectAPITypeFromURL = (
    url: string
  ): { suggestedChart: string; reason: string } => {
    const urlLower = url.toLowerCase();

    // Finnhub APIs
    if (urlLower.includes("finnhub.io")) {
      if (urlLower.includes("/news") || urlLower.includes("company-news")) {
        return {
          suggestedChart: "table",
          reason: "News data - Table view for readability",
        };
      }
      if (urlLower.includes("/quote")) {
        return {
          suggestedChart: "card",
          reason: "Stock quote - Card view for key metrics",
        };
      }
      if (urlLower.includes("/candle")) {
        return {
          suggestedChart: "candle",
          reason: "Candlestick data detected",
        };
      }
    }

    // Alpha Vantage APIs
    if (urlLower.includes("alphavantage.co")) {
      if (urlLower.includes("top_gainers_losers")) {
        return {
          suggestedChart: "bar",
          reason: "Gainers/Losers - Bar chart for comparison",
        };
      }
      if (urlLower.includes("time_series")) {
        return {
          suggestedChart: "line",
          reason: "Time series data - Line chart ideal",
        };
      }
      if (urlLower.includes("fx") || urlLower.includes("currency")) {
        return {
          suggestedChart: "card",
          reason: "Currency data - Card view for rates",
        };
      }
    }

    // CoinGecko APIs
    if (urlLower.includes("coingecko.com")) {
      if (urlLower.includes("/markets")) {
        return {
          suggestedChart: "table",
          reason: "Crypto market data - Table for comparison",
        };
      }
      if (urlLower.includes("/trending")) {
        return { suggestedChart: "card", reason: "Trending coins - Card view" };
      }
      if (urlLower.includes("/simple/price")) {
        return {
          suggestedChart: "card",
          reason: "Price data - Card view for quick glance",
        };
      }
    }

    // Coinbase APIs
    if (urlLower.includes("coinbase.com")) {
      if (urlLower.includes("exchange-rates")) {
        return {
          suggestedChart: "table",
          reason: "Exchange rates - Table for all currencies",
        };
      }
    }

    // NSE/BSE APIs
    if (
      urlLower.includes("nseindia.com") ||
      urlLower.includes("bseindia.com")
    ) {
      if (urlLower.includes("gainers") || urlLower.includes("losers")) {
        return {
          suggestedChart: "bar",
          reason: "Stock movers - Bar chart for comparison",
        };
      }
      return {
        suggestedChart: "table",
        reason: "Indian stock data - Table view",
      };
    }

    return { suggestedChart: "", reason: "" };
  };

  const handleTestAPI = async () => {
    if (!apiUrl.trim()) {
      setTestResult({
        success: false,
        message: "❌ Please enter an API URL",
      });
      return;
    }

    setTestLoading(true);
    try {
      const response = await fetch(apiUrl, {
        mode: "cors",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        setTestResult({
          success: false,
          message: `❌ API Error: ${response.status} ${response.statusText}`,
        });
        setTestLoading(false);
        return;
      }

      const data = await response.json();

      // Store raw API data for field extraction
      setRawApiData(data);

      // Analyze with intelligent adapter
      const analysisResult = analyzeAPIResponse(data);

      // URL-based detection (overrides if more specific)
      const urlDetection = detectAPITypeFromURL(apiUrl);

      // Extract ALL fields from the raw API response (not normalized)
      const allFieldsExtracted = extractAllFieldsDeep(data);

      // Normalize data for display
      const normalizedData = normalizeAPIData(data, analysisResult);

      // Use URL detection if available, otherwise use data analysis
      const finalChart =
        urlDetection.suggestedChart || analysisResult.suggestedChart;
      const finalReason = urlDetection.reason || analysisResult.reasoning;

      setAnalysis({
        ...analysisResult,
        suggestedChart: finalChart,
        reasoning: finalReason,
      });
      setAutoChart(finalChart);
      setAutoFields([]);
      setSelectedFields([]);
      setAllFields(allFieldsExtracted);
      setAllData(normalizedData);
      setRowsToDisplay(Math.min(10, normalizedData.length));

      setTestResult({
        success: true,
        message: `✓ API connection successful! ${allFieldsExtracted.length} top-level fields found.`,
        analysis: {
          ...analysisResult,
          suggestedChart: finalChart,
          reasoning: finalReason,
        },
        autoSelectedChartType: finalChart,
        autoSelectedFields: [],
      });

      // Move to next step after brief delay
      setTimeout(() => setStep("review"), 500);
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Get value from raw API data for a field path
  const getFieldValue = (fieldPath: string): any => {
    if (!rawApiData) return null;
    const parts = fieldPath.split(".");
    let value = rawApiData;
    for (const part of parts) {
      // Handle array index notation like [0]
      const match = part.match(/^(.+)\[(\d+)\]$/);
      if (match) {
        value = value?.[match[1]]?.[parseInt(match[2])];
      } else if (value && typeof value === "object") {
        value = value[part];
      } else {
        return null;
      }
    }
    return value;
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") {
      // Format large numbers with commas
      if (Math.abs(value) >= 1000) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
      }
      return value.toString();
    }
    if (typeof value === "string") {
      return value.length > 40 ? value.substring(0, 40) + "..." : value;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return "[empty array]";
      if (typeof value[0] === "object") {
        return `[${value.length} items]`;
      }
      return `[${value.slice(0, 3).join(", ")}${
        value.length > 3 ? "..." : ""
      }]`;
    }
    if (typeof value === "object") {
      const keys = Object.keys(value);
      return `{${keys.slice(0, 3).join(", ")}${keys.length > 3 ? "..." : ""}}`;
    }
    return "-";
  };

  const handleCreateWidget = () => {
    if (!widgetTitle.trim()) {
      alert("Please enter a widget title");
      return;
    }

    // Determine widget type based on chart selection
    let widgetType: any = "stock-card";
    if (autoChart === "table") widgetType = "stock-table";
    else if (autoChart === "card") widgetType = "finance-cards";
    else if (autoChart === "line" || autoChart === "bar")
      widgetType = "stock-chart";
    else if (autoChart === "candle") widgetType = "stock-chart";

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType as any,
      title: widgetTitle,
      position: { x: 0, y: 0 },
      size:
        autoChart === "table"
          ? { width: 1200, height: 600 }
          : autoChart === "card"
          ? { width: 600, height: 400 }
          : { width: 500, height: 300 },
      config: {
        apiEndpoint: "",
        apiUrl: apiUrl,
        displayMode:
          autoChart === "table"
            ? "table"
            : autoChart === "card"
            ? "card"
            : "chart",
        selectedFields: selectedFields,
        widgetType: "custom-api",
        chartType:
          (autoChart as "line" | "candle" | "bar" | "table" | "card") || "line",
        allAvailableFields: allFields.map((f) => f.path),
        pageSize: rowsToDisplay,
        normalizedData: allData,
        dataAnalysis: analysis,
        rawApiData: rawApiData,
        refreshInterval: refreshInterval * 1000,
      },
    };

    onCreateWidget(newWidget);
    onClose?.();
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Create Custom Widget</h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Step 1: URL Entry */}
        {step === "url" && (
          <div className={styles.step}>
            <div className={styles.stepNumber}>Step 1 of 3</div>

            {/* 🇮🇳 Quick Presets Section */}
            <div className={styles.presetsSection}>
              <label className={styles.presetsLabel}>
                ⚡ Quick Add - Popular APIs
              </label>

              {/* NEW: Indian Stocks (NSE Data) */}
              <div className={styles.presetCategory}>
                <span className={styles.categoryLabel}>
                  📈 Indian Stocks (NSE Live)
                </span>
                <div className={styles.presetButtons}>
                  {API_PRESETS.indianStocks.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        // Build full URL from path at click time (when window is available)
                        const baseUrl = window.location.origin;
                        setApiUrl(`${baseUrl}${preset.path}`);
                        setWidgetTitle(
                          preset.name.replace(
                            /^[📈🏦💻🚀📉📊🔥🆕📅💹🕐]\s*/,
                            ""
                          )
                        );
                      }}
                      className={`${styles.presetBtn} ${styles.presetBtnPrimary}`}
                      title={preset.description}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Stock Quotes */}
              <div className={styles.presetCategory}>
                <span className={styles.categoryLabel}>
                  🎯 Individual Stocks (Quick Quote)
                </span>
                <div className={styles.presetButtons}>
                  {API_PRESETS.stockQuotes.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        const baseUrl = window.location.origin;
                        setApiUrl(`${baseUrl}${preset.path}`);
                        setWidgetTitle(
                          preset.name.replace(/^[💰🛢️💻🏦💡📱🚗🏗️🏥]\s*/, "")
                        );
                      }}
                      className={`${styles.presetBtn} ${styles.presetBtnSecondary}`}
                      title={preset.description}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Financials - Quarterly/Yearly */}
              <div className={styles.presetCategory}>
                <span className={styles.categoryLabel}>
                  📊 Company Financials (Quarterly/Yearly)
                </span>
                <div className={styles.presetButtons}>
                  {API_PRESETS.companyFinancials.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        const baseUrl = window.location.origin;
                        setApiUrl(`${baseUrl}${preset.path}`);
                        setWidgetTitle(preset.name.replace(/^[📊📈]\s*/, ""));
                      }}
                      className={`${styles.presetBtn} ${styles.presetBtnFinancials}`}
                      title={preset.description}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Government Budget & Investment */}
              <div className={styles.presetCategory}>
                <span className={styles.categoryLabel}>
                  🏛️ Budget & Govt Investment
                </span>
                <div className={styles.presetButtons}>
                  {API_PRESETS.govtBudget.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        const baseUrl = window.location.origin;
                        setApiUrl(`${baseUrl}${preset.path}`);
                        setWidgetTitle(preset.name.replace(/^[🏛️🏭🎯]\s*/, ""));
                      }}
                      className={`${styles.presetBtn} ${styles.presetBtnBudget}`}
                      title={preset.description}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.presetCategory}>
                <span className={styles.categoryLabel}>🇮🇳 Indian Crypto</span>
                <div className={styles.presetButtons}>
                  {API_PRESETS.indianMarket.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setApiUrl(preset.url);
                        setWidgetTitle(
                          preset.name.replace(/^[🇮🇳📊📈🪙📰⚡]\s*/, "")
                        );
                      }}
                      className={styles.presetBtn}
                      title={preset.description}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.presetCategory}>
                <span className={styles.categoryLabel}>🪙 Crypto</span>
                <div className={styles.presetButtons}>
                  {API_PRESETS.crypto.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setApiUrl(preset.url);
                        setWidgetTitle(
                          preset.name.replace(/^[🇮🇳📊📈🪙📰⚡]\s*/, "")
                        );
                      }}
                      className={styles.presetBtn}
                      title={preset.description}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.presetCategory}>
                <span className={styles.categoryLabel}>🇺🇸 US Market</span>
                <div className={styles.presetButtons}>
                  {API_PRESETS.usMarket.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setApiUrl(preset.url);
                        setWidgetTitle(
                          preset.name.replace(/^[🇮🇳📊📈🪙📰⚡]\s*/, "")
                        );
                      }}
                      className={styles.presetBtn}
                      title={preset.description}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.presetCategory}>
                <span className={styles.categoryLabel}>
                  ⚡ Real-Time WebSocket
                </span>
                <div className={styles.presetButtons}>
                  {API_PRESETS.realTime.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        // Create real-time widget directly
                        const widget: Widget = {
                          id: `widget_${Date.now()}_${Math.random()
                            .toString(36)
                            .substr(2, 9)}`,
                          type: "stock-table",
                          title: preset.name.replace(/^[⚡]\s*/, ""),
                          position: { x: 0, y: 0 },
                          size: { width: 400, height: 400 },
                          config: {
                            apiEndpoint: preset.path,
                            apiUrl: preset.path,
                            displayMode: "realtime",
                            refreshInterval: 1000,
                            selectedFields: preset.fields,
                            filters: { symbols: (preset as any).symbols },
                            format: {},
                            pageSize: 10,
                            currentPage: 1,
                            sortBy: "symbol",
                            sortOrder: "asc",
                            chartInterval: "daily",
                            timeRange: 30,
                          },
                          data: undefined,
                          isLoading: false,
                          error: null,
                          lastUpdated: undefined,
                        };
                        onCreateWidget(widget);
                      }}
                      className={`${styles.presetBtn} ${styles.realtimeBtn}`}
                      title={preset.description}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.presetCategory}>
                <span className={styles.categoryLabel}>
                  📊 Charts (Line, Bar, Candle)
                </span>
                <div className={styles.presetButtons}>
                  {API_PRESETS.charts.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        // Create chart widget directly
                        const widget: Widget = {
                          id: `widget_${Date.now()}_${Math.random()
                            .toString(36)
                            .substr(2, 9)}`,
                          type: "line-chart",
                          title: preset.name.replace(/^[📈📊🕯️]\s*/, ""),
                          position: { x: 0, y: 0 },
                          size: { width: 400, height: 400 },
                          config: {
                            apiEndpoint: preset.url,
                            apiUrl: preset.url,
                            displayMode: "chart",
                            chartType: preset.chartType as
                              | "line"
                              | "candle"
                              | "bar",
                            widgetType: "chart",
                            refreshInterval: 300000,
                            selectedFields: preset.fields,
                            filters: {},
                            format: {},
                            pageSize: 30,
                            currentPage: 1,
                            sortBy: "date",
                            sortOrder: "asc",
                            chartInterval: "daily",
                            timeRange: 30,
                          },
                          data: undefined,
                          isLoading: false,
                          error: null,
                          lastUpdated: undefined,
                        };
                        onCreateWidget(widget);
                      }}
                      className={`${styles.presetBtn} ${styles.chartBtn}`}
                      title={preset.description}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.dividerOr}>
              <span>or enter custom API URL</span>
            </div>

            <div className={styles.formGroup}>
              <label>API URL</label>
              <p className={styles.hint}>
                📌 Paste your API endpoint. We'll automatically detect the best
                chart type for your data.
              </p>
              <input
                type="text"
                placeholder="https://api.example.com/data"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className={styles.input}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleTestAPI();
                }}
              />
            </div>

            {testResult && (
              <div
                className={`${styles.testResult} ${
                  testResult.success ? styles.success : styles.error
                }`}
              >
                {testResult.message}
                {testResult.analysis && (
                  <div className={styles.analysisDetails}>
                    <div>📊 Detected: {testResult.analysis.dataType}</div>
                    <div>
                      💡 Suggested: {testResult.analysis.suggestedChart}
                    </div>
                    <div>
                      🎯 Confidence:{" "}
                      {Math.round(testResult.analysis.confidence * 100)}%
                    </div>
                    <div className={styles.reasoning}>
                      {testResult.analysis.reasoning}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.actions}>
              <button onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={handleTestAPI}
                disabled={testLoading || !apiUrl.trim()}
                className={styles.primaryBtn}
              >
                {testLoading ? "Testing..." : "✓ Test & Analyze"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review AI Suggestions */}
        {step === "review" && testResult?.success && (
          <div className={styles.step}>
            <div className={styles.stepNumber}>Step 2 of 3</div>

            <div className={styles.suggestions}>
              <h3>🤖 AI Analysis Results</h3>

              <div className={styles.suggestionCard}>
                <div className={styles.suggestionLabel}>📊 Data Type</div>
                <div className={styles.suggestionValue}>
                  {analysis.dataType}
                </div>
              </div>

              <div className={styles.suggestionCard}>
                <div className={styles.suggestionLabel}>
                  📈 Recommended Chart
                </div>
                <div className={styles.suggestionValue}>
                  {autoChart === "line" && "📈 Line Chart"}
                  {autoChart === "candle" && "🕯️ Candlestick Chart"}
                  {autoChart === "bar" && "📊 Bar Chart"}
                  {autoChart === "table" && "📋 Table View"}
                  {autoChart === "card" && "💳 Card View"}
                </div>
                <div className={styles.confidence}>
                  Confidence: {Math.round(analysis.confidence * 100)}%
                </div>
              </div>

              <div className={styles.suggestionCard}>
                <div className={styles.suggestionLabel}>✨ Why This Chart?</div>
                <div className={styles.reasoning}>{analysis.reasoning}</div>
              </div>

              <div className={styles.suggestionCard}>
                <div className={styles.suggestionLabel}>🔍 Data Structure</div>
                <ul className={styles.structureList}>
                  <li>
                    Type: {analysis.structureAnalysis.complexity} complexity
                  </li>
                  <li>
                    Has time data: {analysis.hasTimeData ? "✓ Yes" : "✗ No"}
                  </li>
                  <li>
                    Has OHLC data: {analysis.hasOHLCData ? "✓ Yes" : "✗ No"}
                  </li>
                  <li>Numeric fields: {analysis.numericFields.length}</li>
                  <li>Total fields: {allFields.length}</li>
                </ul>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                onClick={() => setStep("url")}
                className={styles.secondaryBtn}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep("configure")}
                className={styles.primaryBtn}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Configure Widget */}
        {step === "configure" && (
          <div className={styles.step}>
            <div className={styles.stepNumber}>Step 3 of 3</div>

            <div className={styles.formGroup}>
              <label>Widget Title</label>
              <input
                type="text"
                placeholder="e.g., Bitcoin Prices"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Chart Type</label>
              <p className={styles.hint}>
                🤖 AI suggested: <strong>{autoChart}</strong> • You can override
              </p>
              <div className={styles.chartTypeOptions}>
                {["line", "candle", "bar", "table", "card"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setAutoChart(type)}
                    className={`${styles.chartOption} ${
                      autoChart === type ? styles.selected : ""
                    }`}
                  >
                    {type === "line" && "📈 Line"}
                    {type === "candle" && "🕯️ Candle"}
                    {type === "bar" && "📊 Bar"}
                    {type === "table" && "📋 Table"}
                    {type === "card" && "💳 Card"}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Select Fields to Display</label>
              <p className={styles.hint}>
                Search for fields like <code>data.rates.INR</code> to display
                specific data
              </p>

              {/* Search and Filter Controls */}
              <div className={styles.fieldControls}>
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showArraysOnly}
                    onChange={(e) => setShowArraysOnly(e.target.checked)}
                  />
                  Show arrays only (for table view)
                </label>
              </div>

              {/* Selected Fields */}
              {selectedFields.length > 0 && (
                <div className={styles.selectedFieldsSection}>
                  <div className={styles.sectionLabel}>
                    Selected Fields ({selectedFields.length})
                  </div>
                  <div className={styles.selectedFieldsList}>
                    {selectedFields.map((fieldPath, idx) => (
                      <div key={idx} className={styles.selectedFieldTag}>
                        <span>{fieldPath}</span>
                        <button
                          onClick={() =>
                            setSelectedFields(
                              selectedFields.filter((f) => f !== fieldPath)
                            )
                          }
                          className={styles.removeFieldBtn}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Fields */}
              <div className={styles.sectionLabel}>Available Fields</div>
              <div className={styles.fieldSelection}>
                {filteredFields.map((fieldInfo, idx) => {
                  const isSelected = selectedFields.includes(fieldInfo.path);
                  const displayValue = formatValue(fieldInfo.value);
                  const typeIcon = fieldInfo.isArray
                    ? "📋"
                    : fieldInfo.type === "object"
                    ? "📦"
                    : fieldInfo.type === "number"
                    ? "🔢"
                    : "📝";

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedFields(
                            selectedFields.filter((f) => f !== fieldInfo.path)
                          );
                        } else {
                          setSelectedFields([
                            ...selectedFields,
                            fieldInfo.path,
                          ]);
                        }
                      }}
                      className={`${styles.fieldToggle} ${
                        isSelected ? styles.selected : ""
                      }`}
                      title={`${fieldInfo.path}: ${displayValue}`}
                    >
                      <div className={styles.fieldName}>
                        <span className={styles.fieldIcon}>{typeIcon}</span>
                        <span>{isSelected ? "✓" : "+"}</span>
                        <span className={styles.fieldPath}>
                          {fieldInfo.path}
                        </span>
                      </div>
                      <div className={styles.fieldMeta}>
                        <span className={styles.fieldType}>
                          {fieldInfo.type}
                        </span>
                        <span className={styles.fieldValue}>
                          {displayValue}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {filteredFields.length === 0 && (
                  <div className={styles.noFields}>
                    No fields match your search. Try a different query.
                  </div>
                )}
              </div>
            </div>

            <div className={styles.apiInfo}>
              <div>🔗 API: {apiUrl}</div>
              <div>📊 Total fields available: {allFields.length}</div>
              <div>📋 Total rows available: {allData.length}</div>
            </div>

            {allData.length > 1 && (
              <div className={styles.formGroup}>
                <label>Rows to Display</label>
                <p className={styles.hint}>
                  Choose how many items to show in your widget
                </p>
                <div className={styles.rowSelector}>
                  <input
                    type="number"
                    min="1"
                    max={allData.length}
                    value={rowsToDisplay}
                    onChange={(e) =>
                      setRowsToDisplay(
                        Math.min(parseInt(e.target.value) || 1, allData.length)
                      )
                    }
                    className={styles.input}
                  />
                  <span className={styles.rowInfo}>
                    / {allData.length} available
                  </span>
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Auto Refresh Interval</label>
              <p className={styles.hint}>
                How often should the widget fetch new data?
              </p>
              <div className={styles.refreshSelector}>
                {[10, 30, 60, 120, 300].map((seconds) => (
                  <button
                    key={seconds}
                    onClick={() => setRefreshInterval(seconds)}
                    className={`${styles.refreshOption} ${
                      refreshInterval === seconds ? styles.selected : ""
                    }`}
                  >
                    {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <button
                onClick={() => setStep("review")}
                className={styles.secondaryBtn}
              >
                ← Back
              </button>
              <button
                onClick={handleCreateWidget}
                className={styles.primaryBtn}
              >
                ✓ Create Widget
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
