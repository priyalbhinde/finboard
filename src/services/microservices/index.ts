/**
 * Data Format Service
 * Handles formatting of financial data for display
 */

export class DataFormatService {
  /**
   * Format number as currency
   */
  static formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Format number as percentage
   */
  static formatPercentage(value: number, decimals: number = 2): string {
    return `${(value).toFixed(decimals)}%`;
  }

  /**
   * Format large numbers with suffixes (K, M, B)
   */
  static formatLargeNumber(value: number): string {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(2) + 'B';
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + 'K';
    }
    return value.toFixed(2);
  }

  /**
   * Format date/time
   */
  static formatDateTime(timestamp: number, format: 'date' | 'time' | 'datetime' = 'datetime'): string {
    const date = new Date(timestamp);

    if (format === 'date') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } else if (format === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  /**
   * Extract nested object values
   */
  static getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Format value based on format type
   */
  static formatValue(value: any, format: string = 'default'): string {
    if (value === null || value === undefined) return '-';

    switch (format) {
      case 'currency':
        return this.formatCurrency(Number(value));
      case 'percentage':
        return this.formatPercentage(Number(value));
      case 'number':
        return this.formatLargeNumber(Number(value));
      case 'date':
        return this.formatDateTime(Number(value), 'date');
      case 'time':
        return this.formatDateTime(Number(value), 'time');
      case 'datetime':
        return this.formatDateTime(Number(value), 'datetime');
      default:
        return String(value);
    }
  }
}

/**
 * Data Filter Service
 * Handles filtering and searching of financial data
 */
export class DataFilterService {
  static filterBySearch(
    data: Record<string, any>[],
    searchQuery: string,
    searchFields: string[]
  ): Record<string, any>[] {
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return String(value).toLowerCase().includes(query);
      })
    );
  }

  static filterByRange(
    data: Record<string, any>[],
    field: string,
    min: number,
    max: number
  ): Record<string, any>[] {
    return data.filter((item) => {
      const value = Number(item[field]);
      return value >= min && value <= max;
    });
  }

  static sortData(
    data: Record<string, any>[],
    sortBy: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Record<string, any>[] {
    return [...data].sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static paginate(
    data: Record<string, any>[],
    page: number,
    pageSize: number
  ): Record<string, any>[] {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }
}

/**
 * Storage Service
 * Handles localStorage operations
 */
export class StorageService {
  static setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set item: ${key}`, error);
    }
  }

  static getItem<T = any>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get item: ${key}`, error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item: ${key}`, error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage', error);
    }
  }

  static exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('finboard_')) {
        data[key] = this.getItem(key);
      }
    }
    return data;
  }

  static importData(data: Record<string, any>): void {
    Object.entries(data).forEach(([key, value]) => {
      this.setItem(key, value);
    });
  }
}
