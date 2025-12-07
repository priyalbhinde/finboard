// API Configuration for multiple financial data providers
export const API_PROVIDERS = {
  ALPHA_VANTAGE: {
    name: 'Alpha Vantage',
    baseUrl: 'https://www.alphavantage.co',
    documentationUrl: 'https://www.alphavantage.co/documentation',
    rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
    freeApiKey: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo',
  },
  FINNHUB: {
    name: 'Finnhub',
    baseUrl: 'https://finnhub.io/api/v1',
    documentationUrl: 'https://finnhub.io/docs/api',
    rateLimit: { requestsPerMinute: 30, requestsPerDay: 30000 },
    freeApiKey: process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '',
  },
  TWELVEDATA: {
    name: 'Twelve Data',
    baseUrl: 'https://api.twelvedata.com',
    documentationUrl: 'https://twelvedata.com/docs',
    rateLimit: { requestsPerMinute: 12, requestsPerDay: 800 },
    freeApiKey: process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY || '',
  },
  INDIANAPI: {
    name: 'IndianAPI',
    baseUrl: 'https://api.indianapi.com',
    documentationUrl: 'https://indianapi.com/docs',
    rateLimit: { requestsPerMinute: 60, requestsPerDay: 5000 },
    freeApiKey: process.env.NEXT_PUBLIC_INDIANAPI_API_KEY || '',
  },
};

// Default configuration for widgets
export const DEFAULT_WIDGET_CONFIG = {
  refreshInterval: 60000, // 1 minute
  cacheTimeout: 300000, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000,
  pageSize: 20,
  chartTimeRange: 30, // days
};

// Widget grid settings
export const GRID_SETTINGS = {
  columns: 12,
  rowHeight: 60,
  gutter: 16,
  minWidth: 300,
  minHeight: 300,
  maxWidth: 1200,
};

// Theme colors
export const THEME_COLORS = {
  light: {
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
  },
  dark: {
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    border: '#333333',
    success: '#66bb6a',
    error: '#ef5350',
    warning: '#ffa726',
    info: '#42a5f5',
  },
};

// Storage keys
export const STORAGE_KEYS = {
  DASHBOARD: 'finboard_dashboard',
  USER_PREFERENCES: 'finboard_preferences',
  API_KEYS: 'finboard_api_keys',
  CACHE: 'finboard_cache',
  DASHBOARD_TEMPLATES: 'finboard_templates',
};

export const DASHBOARD_TEMPLATES = [
  {
    id: 'tech-stocks',
    name: 'Tech Stocks Monitor',
    description: 'Track major tech companies and their performance',
  },
  {
    id: 'market-overview',
    name: 'Market Overview',
    description: 'Get a quick overview of market gainers and losers',
  },
  {
    id: 'portfolio-tracker',
    name: 'Portfolio Tracker',
    description: 'Monitor your portfolio performance',
  },
];
