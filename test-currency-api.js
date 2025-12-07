// Test script to verify Currency Exchange API data normalization
const fs = require("fs");
const path = require("path");

// Import the functions (we'll need to compile TS first)
// For now, let's just show what the fix does

const mockCurrencyExchangeResponse = {
  "Realtime Currency Exchange Rate": {
    "1. From_Currency Code": "USD",
    "2. From_Currency Name": "United States Dollar",
    "3. To_Currency Code": "EUR",
    "4. To_Currency Name": "Euro",
    "5. Exchange Rate": "0.85870000",
    "6. Last Refreshed": "2025-12-06 19:29:42",
    "7. Time Zone": "UTC",
    "8. Bid Price": "0.85869000",
    "9. Ask Price": "0.85870000",
  },
};

// Simulate the new parseAPIStructure logic
function parseAPIStructure(data) {
  if (Array.isArray(data)) {
    return {
      data: data,
      format: "array",
    };
  }

  if (typeof data === "object" && data !== null) {
    const keys = Object.keys(data);

    // Single wrapper object with single nested object
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

// Simulate the new normalizeAPIData logic
function normalizeAPIData(data) {
  const parsed = parseAPIStructure(data);

  if (parsed.format === "object") {
    const values = Object.values(parsed.data);
    const hasOnlyPrimitives = values.every(
      (v) => typeof v !== "object" || v === null
    );

    if (hasOnlyPrimitives) {
      // Clean field names by removing numeric prefixes
      const cleanedObject = {};
      for (const [key, value] of Object.entries(parsed.data)) {
        // Remove numeric prefix like "1. ", "2. ", etc.
        const cleanKey = key.replace(/^\d+\.\s+/, "").replace(/_/g, " ");
        cleanedObject[cleanKey] = value;
      }
      return [cleanedObject]; // Return as single-item array
    }
  }

  return [];
}

// Test it
console.log("Input API Response:");
console.log(JSON.stringify(mockCurrencyExchangeResponse, null, 2));

console.log("\n\n=== PARSING ===");
const parsed = parseAPIStructure(mockCurrencyExchangeResponse);
console.log("Parsed format:", parsed.format);
console.log("Parsed data keys:", Object.keys(parsed.data));

console.log("\n\n=== NORMALIZATION ===");
const normalized = normalizeAPIData(mockCurrencyExchangeResponse);
console.log("Normalized result:");
console.log(JSON.stringify(normalized, null, 2));

console.log("\n\n=== EXPECTED WIDGET DISPLAY ===");
console.log("Should show 1 row with these fields:");
normalized[0] &&
  Object.keys(normalized[0]).forEach((key) => {
    console.log(`  ${key}: ${normalized[0][key]}`);
  });
