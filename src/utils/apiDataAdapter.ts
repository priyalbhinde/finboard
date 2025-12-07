/**
 * Data Format Adapter System
 * Analyzes JSON API responses and suggests optimal visualization types
 * Handles various API response formats intelligently
 */

export interface DataAnalysis {
  dataType: "timeseries" | "tabular" | "categorical" | "mixed" | "unknown";
  suggestedChart: "line" | "candle" | "bar" | "table" | "card";
  confidence: number; // 0-1 confidence score
  reasoning: string;
  hasTimeData: boolean;
  hasOHLCData: boolean; // Open, High, Low, Close
  numericFields: string[];
  timeFields: string[];
  structureAnalysis: {
    isArray: boolean;
    arrayLength: number;
    commonFields: string[];
    complexity: "simple" | "moderate" | "complex";
  };
}

export interface APIResponse {
  data: any;
  format: "array" | "object" | "nested" | "unknown";
}

/**
 * Intelligently analyze API response and suggest visualization
 */
export function analyzeAPIResponse(data: any): DataAnalysis {
  try {
    // Parse the response structure
    const parsed = parseAPIStructure(data);

    // Analyze data content
    const analysis = {
      dataType: detectDataType(parsed),
      hasTimeData: hasTimeSeriesData(parsed),
      hasOHLCData: hasOHLCData(parsed),
      numericFields: extractNumericFields(parsed),
      timeFields: extractTimeFields(parsed),
      structureAnalysis: analyzeStructure(parsed),
    };

    // Suggest best visualization
    const suggestion = suggestVisualization(analysis);

    return {
      ...analysis,
      ...suggestion,
    };
  } catch (error) {
    return {
      dataType: "unknown",
      suggestedChart: "table",
      confidence: 0,
      reasoning: "Could not analyze API response structure",
      hasTimeData: false,
      hasOHLCData: false,
      numericFields: [],
      timeFields: [],
      structureAnalysis: {
        isArray: false,
        arrayLength: 0,
        commonFields: [],
        complexity: "simple",
      },
    };
  }
}

/**
 * Parse API response into normalized structure
 */
function parseAPIStructure(data: any): APIResponse {
  if (Array.isArray(data)) {
    return {
      data: data,
      format: "array",
    };
  }

  if (typeof data === "object" && data !== null) {
    // Check if data has a common wrapper pattern
    const keys = Object.keys(data);

    // Pattern: { data: [...], results: [...], items: [...] }
    for (const key of ["data", "results", "items", "rows", "records"]) {
      if (Array.isArray(data[key])) {
        return {
          data: data[key],
          format: "nested",
        };
      }
    }

    // Pattern: Multiple arrays (top_gainers, top_losers, etc.)
    // Select the largest array
    const arrayFields = keys.filter((key) => Array.isArray(data[key]));
    if (arrayFields.length > 0) {
      let largestKey = arrayFields[0];
      let largestLength = (data[largestKey] || []).length;
      
      for (const key of arrayFields) {
        if ((data[key] || []).length > largestLength) {
          largestKey = key;
          largestLength = (data[key] || []).length;
        }
      }
      
      return {
        data: data[largestKey],
        format: "nested",
      };
    }

    // Pattern: Single wrapper object with single nested object
    // e.g. { "Realtime Currency Exchange Rate": { "1. From_Currency Code": "USD", ... } }
    if (
      keys.length === 1 &&
      typeof data[keys[0]] === "object" &&
      data[keys[0]] !== null &&
      !Array.isArray(data[keys[0]])
    ) {
      return {
        data: data[keys[0]],
        format: "object",
      };
    }

    // Pattern: { bpi: { USD: {...}, EUR: {...} } }
    // or { rates: { EUR: 1.1, GBP: 0.85 } }
    if (keys.length > 0 && !Array.isArray(data[keys[0]])) {
      return {
        data: data,
        format: "object",
      };
    }

    return {
      data: data,
      format: "unknown",
    };
  }

  return {
    data: data,
    format: "unknown",
  };
}

/**
 * Detect what type of data this is
 */
function detectDataType(
  parsed: APIResponse
): "timeseries" | "tabular" | "categorical" | "mixed" | "unknown" {
  const { data, format } = parsed;

  if (format === "array") {
    // Check if it's time series data
    if (hasTimeSeriesData(data)) return "timeseries";

    // Check if it's tabular (consistent fields)
    if (isTabularData(data)) return "tabular";

    // Check if it's categorical
    if (isCategoricalData(data)) return "categorical";

    return "mixed";
  }

  if (format === "object") {
    // Could be rates, prices, or other categorical data
    if (isCategoryMap(data)) return "categorical";
    return "mixed";
  }

  return "unknown";
}

/**
 * Check if data contains time series information
 */
function hasTimeSeriesData(data: any): boolean {
  const timePatterns = [
    "timestamp",
    "date",
    "time",
    "datetime",
    "ts",
    "created_at",
    "updated_at",
    "hour",
    "day",
    "month",
    "year",
  ];

  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    if (typeof firstItem === "object") {
      const keys = Object.keys(firstItem).map((k) => k.toLowerCase());
      return timePatterns.some((pattern) =>
        keys.some((key) => key.includes(pattern))
      );
    }
  }

  return false;
}

/**
 * Check if data has OHLC (Open, High, Low, Close) structure
 */
function hasOHLCData(data: any): boolean {
  const ohlcFields = ["open", "high", "low", "close"];

  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    if (typeof firstItem === "object") {
      const keys = Object.keys(firstItem).map((k) => k.toLowerCase());
      return ohlcFields.every((field) => keys.includes(field));
    }
  }

  return false;
}

/**
 * Check if data is tabular (array of objects with consistent fields)
 */
function isTabularData(data: any): boolean {
  if (!Array.isArray(data) || data.length < 2) return false;

  const firstKeys = Object.keys(data[0] || {}).sort();
  const secondKeys = Object.keys(data[1] || {}).sort();

  return (
    firstKeys.length > 0 &&
    firstKeys.join() === secondKeys.join()
  );
}

/**
 * Check if data is categorical (multiple categories with values)
 */
function isCategoricalData(data: any): boolean {
  if (Array.isArray(data)) {
    // Check if items have a category/name field and value field
    return (
      data.length > 0 &&
      typeof data[0] === "object" &&
      ("category" in data[0] ||
        "name" in data[0] ||
        "symbol" in data[0] ||
        "label" in data[0])
    );
  }
  return false;
}

/**
 * Check if object is a category map (key-value pairs)
 */
function isCategoryMap(data: any): boolean {
  if (typeof data !== "object" || Array.isArray(data)) return false;

  const keys = Object.keys(data);
  if (keys.length === 0) return false;

  // All values should be primitives or simple objects
  return keys.every((key) => {
    const val = data[key];
    return (
      typeof val === "number" ||
      typeof val === "string" ||
      typeof val === "boolean" ||
      (typeof val === "object" && val !== null && Object.keys(val).length < 5)
    );
  });
}

/**
 * Extract all numeric fields from data
 */
function extractNumericFields(data: any): string[] {
  const fields = new Set<string>();

  function scan(obj: any, path = ""): void {
    if (obj === null || obj === undefined) return;

    if (Array.isArray(obj)) {
      if (obj.length > 0 && typeof obj[0] === "object") {
        scan(obj[0], path);
      }
      return;
    }

    if (typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;

        if (typeof value === "number") {
          fields.add(fullPath);
        } else if (typeof value === "object" && value !== null) {
          scan(value, fullPath);
        }
      }
    }
  }

  scan(data);
  return Array.from(fields);
}

/**
 * Extract all time-related fields
 */
function extractTimeFields(data: any): string[] {
  const fields = new Set<string>();
  const timePatterns = [
    "time",
    "date",
    "timestamp",
    "ts",
    "created",
    "updated",
  ];

  function scan(obj: any, path = ""): void {
    if (obj === null || obj === undefined) return;

    if (Array.isArray(obj)) {
      if (obj.length > 0) scan(obj[0], path);
      return;
    }

    if (typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        const keyLower = key.toLowerCase();

        if (
          timePatterns.some((pattern) => keyLower.includes(pattern)) ||
          value instanceof Date ||
          (typeof value === "string" && isISODate(value as string))
        ) {
          fields.add(fullPath);
        } else if (typeof value === "object" && value !== null) {
          scan(value, fullPath);
        }
      }
    }
  }

  scan(data);
  return Array.from(fields);
}

/**
 * Analyze data structure complexity
 */
function analyzeStructure(data: any): {
  isArray: boolean;
  arrayLength: number;
  commonFields: string[];
  complexity: "simple" | "moderate" | "complex";
} {
  if (Array.isArray(data)) {
    const fields =
      data.length > 0 && typeof data[0] === "object"
        ? Object.keys(data[0])
        : [];

    const complexity =
      fields.length <= 5 ? "simple" : fields.length <= 15 ? "moderate" : "complex";

    return {
      isArray: true,
      arrayLength: data.length,
      commonFields: fields,
      complexity,
    };
  }

  const keys = typeof data === "object" && data !== null ? Object.keys(data) : [];
  const complexity = keys.length <= 5 ? "simple" : keys.length <= 15 ? "moderate" : "complex";

  return {
    isArray: false,
    arrayLength: 0,
    commonFields: keys,
    complexity,
  };
}

/**
 * Suggest best visualization based on analysis
 */
function suggestVisualization(analysis: Omit<DataAnalysis, "suggestedChart" | "confidence" | "reasoning">): { suggestedChart: "line" | "candle" | "bar" | "table" | "card"; confidence: number; reasoning: string } {
  const { dataType, hasTimeData, hasOHLCData, numericFields, structureAnalysis } = analysis as any;

  // Rule 1: Large array data (news, market data, stock lists) → Table
  if (structureAnalysis.isArray && structureAnalysis.arrayLength > 5) {
    // Check for news-like data
    const fields = structureAnalysis.commonFields.map((f: string) => f.toLowerCase());
    const hasNewsFields = fields.some((f: string) => 
      f.includes('headline') || f.includes('summary') || f.includes('title') || f.includes('source')
    );
    if (hasNewsFields) {
      return {
        suggestedChart: "table",
        confidence: 0.95,
        reasoning: "News/article data detected - table view optimal for readability",
      };
    }

    // Check for market data (crypto, stocks)
    const hasMarketFields = fields.some((f: string) => 
      f.includes('price') || f.includes('change') || f.includes('symbol') || f.includes('market_cap')
    );
    if (hasMarketFields) {
      return {
        suggestedChart: "table",
        confidence: 0.9,
        reasoning: "Market data with multiple entries - table view recommended",
      };
    }
  }

  // Rule 2: OHLC data → Candlestick chart (highest confidence)
  if (hasOHLCData && hasTimeData) {
    return {
      suggestedChart: "candle",
      confidence: 0.95,
      reasoning: "Detected OHLC data with timestamps - candlestick chart optimal",
    };
  }

  // Rule 3: Time series with numeric data → Line chart
  if (dataType === "timeseries" && numericFields.length > 0) {
    return {
      suggestedChart: "line",
      confidence: 0.9,
      reasoning: "Time series with numeric values - line chart recommended",
    };
  }

  // Rule 4: Small categorical data with values → Bar chart
  if (dataType === "categorical" && numericFields.length > 0 && structureAnalysis.arrayLength <= 15) {
    return {
      suggestedChart: "bar",
      confidence: 0.85,
      reasoning: "Categorical data with numeric values - bar chart suggested",
    };
  }

  // Rule 5: Tabular data → Table
  if (dataType === "tabular") {
    return {
      suggestedChart: "table",
      confidence: 0.9,
      reasoning: "Tabular structure detected - table view optimal",
    };
  }

  // Rule 6: Single object with few fields → Card view
  if (!structureAnalysis.isArray && structureAnalysis.commonFields.length <= 8) {
    return {
      suggestedChart: "card",
      confidence: 0.8,
      reasoning: "Single data point with few fields - card view ideal",
    };
  }

  // Rule 7: Many numeric fields → Card view for dashboard
  if (numericFields.length > 10) {
    return {
      suggestedChart: "card",
      confidence: 0.7,
      reasoning: "Many numeric fields - card view good for overview",
    };
  }

  // Default: Table is safest
  return {
    suggestedChart: "table",
    confidence: 0.6,
    reasoning: "Fallback recommendation - table view works for most data",
  };
}

/**
 * Check if string is ISO date format
 */
function isISODate(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(str) || !isNaN(Date.parse(str));
}

/**
 * Transform API response data based on detected format
 * Normalizes various API formats to consistent structure
 */
export function normalizeAPIData(
  data: any,
  analysis: DataAnalysis
): Record<string, any>[] {
  const parsed = parseAPIStructure(data);

  if (parsed.format === "array") {
    return parsed.data;
  }

  if (parsed.format === "nested") {
    return parsed.data;
  }

  if (parsed.format === "object") {
    // Check if this is a single object with prefixed keys (like Alpha Vantage currency rates)
    // Pattern: { "1. Key Name": value, "2. Another Key": value }
    const values = Object.values(parsed.data);
    const hasOnlyPrimitives = values.every(
      (v) => typeof v !== "object" || v === null
    );

    if (hasOnlyPrimitives) {
      // Clean field names by removing numeric prefixes
      const cleanedObject: Record<string, any> = {};
      for (const [key, value] of Object.entries(parsed.data)) {
        // Remove numeric prefix like "1. ", "2. ", etc.
        const cleanKey = key.replace(/^\d+\.\s+/, "").replace(/_/g, " ");
        cleanedObject[cleanKey] = value;
      }
      return [cleanedObject]; // Return as single-item array
    }

    // Convert key-value object to array
    return Object.entries(parsed.data).map(([key, value]) => ({
      category: key,
      value: value,
      ...(typeof value === "object" ? value : {}),
    }));
  }

  return [];
}

/**
 * Get recommended display fields based on analysis
 */
export function getRecommendedFields(analysis: DataAnalysis): string[] {
  const { numericFields, timeFields } = analysis;

  // Prefer: time field + numeric field
  if (timeFields.length > 0 && numericFields.length > 0) {
    return [timeFields[0], numericFields[0]];
  }

  // Prefer: first numeric field
  if (numericFields.length > 0) {
    return [numericFields[0]];
  }

  // Fallback: first available field
  return [analysis.structureAnalysis.commonFields[0]].filter(Boolean);
}
