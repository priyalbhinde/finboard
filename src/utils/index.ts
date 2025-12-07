import { Widget, WidgetType } from '@/types';

export const generateId = (prefix: string = ''): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createDefaultWidget = (type: WidgetType, title: string): Widget => {
  return {
    id: generateId('widget'),
    type,
    title,
    position: { x: 0, y: 0 },
    size: { width: 400, height: 400 },
    config: {
      apiEndpoint: '',
      refreshInterval: 60000,
      selectedFields: [],
      filters: {},
      format: {},
      pageSize: 20,
      currentPage: 1,
      sortBy: 'symbol',
      sortOrder: 'asc',
      chartInterval: 'daily',
      timeRange: 30,
    },
    data: undefined,
    isLoading: false,
    error: null,
    lastUpdated: undefined,
  };
};

export const cloneWidget = (widget: Widget): Widget => {
  return {
    ...widget,
    id: generateId('widget'),
  };
};

export const isDateInRange = (date: Date, days: number): boolean => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
};

export const cn = (...classes: (string | undefined | false | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getColorByChange = (change: number): string => {
  if (change > 0) return '#4caf50'; // green
  if (change < 0) return '#f44336'; // red
  return '#9e9e9e'; // gray
};

export const getGainersLosers = (
  stocks: any[],
  limit: number = 5
): { gainers: any[]; losers: any[] } => {
  const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  return {
    gainers: sorted.slice(0, limit),
    losers: sorted.slice(-limit).reverse(),
  };
};

export const calculatePerformance = (
  data: any[],
  field: string = 'close'
): { highestValue: number; lowestValue: number; change: number; changePercent: number } => {
  const values = data.map((d) => parseFloat(d[field])).filter((v) => !isNaN(v));

  if (values.length === 0) {
    return { highestValue: 0, lowestValue: 0, change: 0, changePercent: 0 };
  }

  const highestValue = Math.max(...values);
  const lowestValue = Math.min(...values);
  const change = values[values.length - 1] - values[0];
  const changePercent = ((change / values[0]) * 100).toFixed(2);

  return {
    highestValue,
    lowestValue,
    change,
    changePercent: parseFloat(changePercent),
  };
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(delayMs * (i + 1));
    }
  }
  throw new Error('Max retries exceeded');
};

export const extractAPIFields = (data: Record<string, any>, maxDepth: number = 3): string[] => {
  const fields: Set<string> = new Set();

  const traverse = (obj: any, prefix: string = '', depth: number = 0) => {
    if (depth > maxDepth) return;

    if (Array.isArray(obj) && obj.length > 0) {
      traverse(obj[0], prefix, depth + 1);
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach((key) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        fields.add(newPrefix);
        if (typeof obj[key] === 'object') {
          traverse(obj[key], newPrefix, depth + 1);
        }
      });
    }
  };

  traverse(data);
  return Array.from(fields);
};

export const downloadJSON = (data: any, filename: string): void => {
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const uploadJSON = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
