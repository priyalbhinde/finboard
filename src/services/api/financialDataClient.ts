import axios, { AxiosInstance } from 'axios';
import { APIResponse, StockData, ChartDataPoint, CacheEntry } from '@/types';
import { API_PROVIDERS, DEFAULT_WIDGET_CONFIG, STORAGE_KEYS } from '@/config';

class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();

  set<T>(key: string, data: T, ttl: number = DEFAULT_WIDGET_CONFIG.cacheTimeout): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

export class FinancialDataClient {
  private cacheManager = new CacheManager();
  private alphaVantageClient: AxiosInstance;
  private finnhubClient: AxiosInstance;
  private twelvedataClient: AxiosInstance;
  private requestCounts: Record<string, number> = {};
  private requestTimestamps: Record<string, number[]> = {};

  constructor() {
    this.alphaVantageClient = axios.create({
      baseURL: API_PROVIDERS.ALPHA_VANTAGE.baseUrl,
      timeout: 30000,
    });

    this.finnhubClient = axios.create({
      baseURL: API_PROVIDERS.FINNHUB.baseUrl,
      timeout: 30000,
    });

    this.twelvedataClient = axios.create({
      baseURL: API_PROVIDERS.TWELVEDATA.baseUrl,
      timeout: 30000,
    });
  }

  /**
   * Get real-time stock quote from Alpha Vantage
   */
  async getStockQuote(
    symbol: string,
    apiKey: string = API_PROVIDERS.ALPHA_VANTAGE.freeApiKey
  ): Promise<APIResponse<StockData>> {
    try {
      const cacheKey = `quote_${symbol}`;
      const cachedData = this.cacheManager.get<StockData>(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          metadata: { timestamp: Date.now(), source: 'Alpha Vantage (cached)' },
        };
      }

      const response = await this.alphaVantageClient.get('/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: apiKey,
        },
      });

      if (response.data['Global Quote']) {
        const quote = response.data['Global Quote'];
        const stockData: StockData = {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          timestamp: Date.now(),
        };

        this.cacheManager.set(cacheKey, stockData);
        return {
          success: true,
          data: stockData,
          metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
        };
      }

      return {
        success: false,
        error: 'Failed to fetch stock quote',
        metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
      };
    }
  }

  /**
   * Get intraday time series data
   */
  async getIntradayData(
    symbol: string,
    interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min',
    apiKey: string = API_PROVIDERS.ALPHA_VANTAGE.freeApiKey
  ): Promise<APIResponse<ChartDataPoint[]>> {
    try {
      const cacheKey = `intraday_${symbol}_${interval}`;
      const cachedData = this.cacheManager.get<ChartDataPoint[]>(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          metadata: { timestamp: Date.now(), source: 'Alpha Vantage (cached)' },
        };
      }

      const response = await this.alphaVantageClient.get('/query', {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol,
          interval,
          apikey: apiKey,
        },
      });

      const timeSeriesKey = Object.keys(response.data).find((key) =>
        key.startsWith('Time Series')
      );

      if (timeSeriesKey && response.data[timeSeriesKey]) {
        const timeSeries = response.data[timeSeriesKey];
        const chartData: ChartDataPoint[] = Object.entries(timeSeries)
          .slice(0, 100)
          .map(([time, data]: [string, any]) => ({
            time,
            open: parseFloat(data['1. open']),
            high: parseFloat(data['2. high']),
            low: parseFloat(data['3. low']),
            close: parseFloat(data['4. close']),
            volume: parseInt(data['5. volume']),
          }))
          .reverse();

        this.cacheManager.set(cacheKey, chartData);
        return {
          success: true,
          data: chartData,
          metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
        };
      }

      return {
        success: false,
        error: 'Failed to fetch intraday data',
        metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
      };
    }
  }

  /**
   * Get daily time series data
   */
  async getDailyData(
    symbol: string,
    apiKey: string = API_PROVIDERS.ALPHA_VANTAGE.freeApiKey
  ): Promise<APIResponse<ChartDataPoint[]>> {
    try {
      const cacheKey = `daily_${symbol}`;
      const cachedData = this.cacheManager.get<ChartDataPoint[]>(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          metadata: { timestamp: Date.now(), source: 'Alpha Vantage (cached)' },
        };
      }

      const response = await this.alphaVantageClient.get('/query', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol,
          apikey: apiKey,
        },
      });

      const timeSeriesKey = 'Time Series (Daily)';

      if (response.data[timeSeriesKey]) {
        const timeSeries = response.data[timeSeriesKey];
        const chartData: ChartDataPoint[] = Object.entries(timeSeries)
          .slice(0, 100)
          .map(([time, data]: [string, any]) => ({
            time,
            open: parseFloat(data['1. open']),
            high: parseFloat(data['2. high']),
            low: parseFloat(data['3. low']),
            close: parseFloat(data['4. close']),
            volume: parseInt(data['5. volume']),
          }))
          .reverse();

        this.cacheManager.set(cacheKey, chartData);
        return {
          success: true,
          data: chartData,
          metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
        };
      }

      return {
        success: false,
        error: 'Failed to fetch daily data',
        metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
      };
    }
  }

  /**
   * Search for symbols
   */
  async searchSymbols(
    keywords: string,
    apiKey: string = API_PROVIDERS.ALPHA_VANTAGE.freeApiKey
  ): Promise<APIResponse<any[]>> {
    try {
      const response = await this.alphaVantageClient.get('/query', {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords,
          apikey: apiKey,
        },
      });

      if (response.data.bestMatches) {
        return {
          success: true,
          data: response.data.bestMatches,
          metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
        };
      }

      return {
        success: false,
        error: 'No symbols found',
        metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        metadata: { timestamp: Date.now(), source: 'Alpha Vantage' },
      };
    }
  }

  clearCache(): void {
    this.cacheManager.clear();
  }
}

export const financialDataClient = new FinancialDataClient();
