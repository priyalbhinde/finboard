// Widget Types
export type WidgetType = 'stock-table' | 'stock-card' | 'line-chart' | 'candle-chart' | 'watchlist' | 'market-gainers' | 'performance-data' | 'stock-chart' | 'finance-cards';

// New unified widget types
export type UnifiedWidgetType = 'table' | 'finance-cards' | 'chart' | 'custom-api';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number; colSpan?: 1 | 2 | 3 };
  config: WidgetConfig;
  data?: Record<string, unknown>;
  isLoading?: boolean;
  error?: string | null;
  lastUpdated?: number;
}

export interface WidgetConfig {
  apiEndpoint: string;
  apiUrl?: string; // Custom API URL for user
  displayMode?: "card" | "table" | "chart" | "realtime"; // Display format
  apiKey?: string;
  refreshInterval?: number;
  selectedFields?: string[];
  showArraysOnly?: boolean;
  filters?: Record<string, unknown>;
  format?: Record<string, string>;
  searchQuery?: string;
  pageSize?: number;
  currentPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  chartInterval?: 'daily' | 'weekly' | 'monthly' | '1min' | '5min' | '15min' | 'hourly';
  timeRange?: number;
  // New widget type properties
  widgetType?: UnifiedWidgetType;
  // Table widget properties
  rowsPerPage?: number;
  enableSort?: boolean;
  enableFilter?: boolean;
  // Finance cards properties
  cardType?: 'watchlist' | 'gainers' | 'losers' | 'performance';
  cardsPerRow?: number;
  // Chart widget properties
  chartType?: 'line' | 'candle' | 'bar' | 'table' | 'card';
  enableAnalytics?: boolean;
  // API analysis properties
  allAvailableFields?: string[];
  // Multi-row support
  normalizedData?: any[];
  dataAnalysis?: any;
  rawApiData?: any;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  theme: 'light' | 'dark';
  layout: 'grid' | 'flex';
  createdAt: number;
  updatedAt: number;
  isTemplate?: boolean;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: number;
    source: string;
    requestsRemaining?: number;
    requestsUsed?: number;
  };
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  dividend?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  timestamp?: number;
}

export interface ChartDataPoint {
  time: string | number;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  autoRefresh: boolean;
  refreshInterval: number;
  defaultApiKey?: string;
  currency: string;
  notifications: boolean;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  layout: Widget[];
  category: string;
  createdAt: number;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface APIKeyConfig {
  provider: 'alphavantage' | 'finnhub' | 'indianapi' | 'twelvedata';
  key: string;
  active: boolean;
  addedAt: number;
}
