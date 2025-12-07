import { NextRequest, NextResponse } from "next/server";

// Realistic Indian stock data with market-hours simulation
// Prices fluctuate based on time to simulate real market movement

function getRandomVariation(base: number, maxPercent: number = 2): number {
  const variation = (Math.random() - 0.5) * 2 * maxPercent;
  return Math.round((base * (1 + variation / 100)) * 100) / 100;
}

function getTimeBasedSeed(): number {
  return Math.floor(Date.now() / 60000); // Changes every minute
}

// Generate realistic stock data with time-based variations
function generateStockData(
  symbol: string,
  basePrice: number,
  company: string,
  sector: string
) {
  const seed = getTimeBasedSeed();
  const variation = ((seed * symbol.charCodeAt(0)) % 500) / 100 - 2.5;
  const lastPrice = Math.round((basePrice * (1 + variation / 100)) * 100) / 100;
  const change = Math.round((lastPrice - basePrice) * 100) / 100;
  const pChange = Math.round((change / basePrice) * 10000) / 100;

  return {
    symbol,
    company,
    sector,
    lastPrice,
    change,
    pChange,
    open: getRandomVariation(basePrice, 1),
    dayHigh: Math.max(lastPrice, getRandomVariation(basePrice, 2.5)),
    dayLow: Math.min(lastPrice, getRandomVariation(basePrice, 2.5)),
    previousClose: basePrice,
    totalTradedVolume: Math.floor(Math.random() * 10000000) + 500000,
    totalTradedValue: Math.floor(Math.random() * 500000000),
    yearHigh: Math.round(basePrice * 1.35 * 100) / 100,
    yearLow: Math.round(basePrice * 0.75 * 100) / 100,
    perChange30d: Math.round((Math.random() - 0.3) * 15 * 100) / 100,
    perChange365d: Math.round((Math.random() - 0.2) * 50 * 100) / 100,
  };
}

// Complete NIFTY 50 stocks with realistic base prices (as of Dec 2024)
const NIFTY_50_STOCKS = [
  { symbol: "RELIANCE", company: "Reliance Industries Ltd", basePrice: 2445.50, sector: "Oil & Gas" },
  { symbol: "TCS", company: "Tata Consultancy Services Ltd", basePrice: 4125.30, sector: "IT" },
  { symbol: "HDFCBANK", company: "HDFC Bank Ltd", basePrice: 1725.80, sector: "Banking" },
  { symbol: "INFY", company: "Infosys Ltd", basePrice: 1892.45, sector: "IT" },
  { symbol: "ICICIBANK", company: "ICICI Bank Ltd", basePrice: 1298.60, sector: "Banking" },
  { symbol: "BHARTIARTL", company: "Bharti Airtel Ltd", basePrice: 1678.25, sector: "Telecom" },
  { symbol: "ITC", company: "ITC Ltd", basePrice: 478.90, sector: "FMCG" },
  { symbol: "SBIN", company: "State Bank of India", basePrice: 812.35, sector: "Banking" },
  { symbol: "KOTAKBANK", company: "Kotak Mahindra Bank Ltd", basePrice: 1756.40, sector: "Banking" },
  { symbol: "LT", company: "Larsen & Toubro Ltd", basePrice: 3678.90, sector: "Infrastructure" },
  { symbol: "HINDUNILVR", company: "Hindustan Unilever Ltd", basePrice: 2345.60, sector: "FMCG" },
  { symbol: "BAJFINANCE", company: "Bajaj Finance Ltd", basePrice: 7234.50, sector: "Financial Services" },
  { symbol: "TATAMOTORS", company: "Tata Motors Ltd", basePrice: 892.75, sector: "Automobile" },
  { symbol: "WIPRO", company: "Wipro Ltd", basePrice: 567.80, sector: "IT" },
  { symbol: "ASIANPAINT", company: "Asian Paints Ltd", basePrice: 2298.45, sector: "Consumer Durables" },
  { symbol: "MARUTI", company: "Maruti Suzuki India Ltd", basePrice: 11567.30, sector: "Automobile" },
  { symbol: "AXISBANK", company: "Axis Bank Ltd", basePrice: 1145.90, sector: "Banking" },
  { symbol: "SUNPHARMA", company: "Sun Pharmaceutical Industries", basePrice: 1923.45, sector: "Pharma" },
  { symbol: "TITAN", company: "Titan Company Ltd", basePrice: 3456.80, sector: "Consumer Durables" },
  { symbol: "HCLTECH", company: "HCL Technologies Ltd", basePrice: 1834.60, sector: "IT" },
  { symbol: "ULTRACEMCO", company: "UltraTech Cement Ltd", basePrice: 11234.50, sector: "Cement" },
  { symbol: "ONGC", company: "Oil & Natural Gas Corporation", basePrice: 267.35, sector: "Oil & Gas" },
  { symbol: "NTPC", company: "NTPC Ltd", basePrice: 398.45, sector: "Power" },
  { symbol: "POWERGRID", company: "Power Grid Corporation", basePrice: 334.25, sector: "Power" },
  { symbol: "M&M", company: "Mahindra & Mahindra Ltd", basePrice: 3123.60, sector: "Automobile" },
  { symbol: "TATASTEEL", company: "Tata Steel Ltd", basePrice: 156.80, sector: "Metal" },
  { symbol: "JSWSTEEL", company: "JSW Steel Ltd", basePrice: 945.30, sector: "Metal" },
  { symbol: "TECHM", company: "Tech Mahindra Ltd", basePrice: 1678.45, sector: "IT" },
  { symbol: "ADANIENT", company: "Adani Enterprises Ltd", basePrice: 2567.80, sector: "Diversified" },
  { symbol: "ADANIPORTS", company: "Adani Ports & SEZ Ltd", basePrice: 1234.50, sector: "Infrastructure" },
  { symbol: "COALINDIA", company: "Coal India Ltd", basePrice: 478.90, sector: "Mining" },
  { symbol: "BPCL", company: "Bharat Petroleum Corporation", basePrice: 312.45, sector: "Oil & Gas" },
  { symbol: "DRREDDY", company: "Dr. Reddy's Laboratories", basePrice: 1245.60, sector: "Pharma" },
  { symbol: "CIPLA", company: "Cipla Ltd", basePrice: 1567.30, sector: "Pharma" },
  { symbol: "GRASIM", company: "Grasim Industries Ltd", basePrice: 2678.45, sector: "Diversified" },
  { symbol: "DIVISLAB", company: "Divi's Laboratories Ltd", basePrice: 4012.30, sector: "Pharma" },
  { symbol: "HEROMOTOCO", company: "Hero MotoCorp Ltd", basePrice: 4567.80, sector: "Automobile" },
  { symbol: "INDUSINDBK", company: "IndusInd Bank Ltd", basePrice: 1023.45, sector: "Banking" },
  { symbol: "EICHERMOT", company: "Eicher Motors Ltd", basePrice: 4789.60, sector: "Automobile" },
  { symbol: "NESTLEIND", company: "Nestle India Ltd", basePrice: 2345.80, sector: "FMCG" },
  { symbol: "BRITANNIA", company: "Britannia Industries Ltd", basePrice: 5234.50, sector: "FMCG" },
  { symbol: "SHRIRAMFIN", company: "Shriram Finance Ltd", basePrice: 2890.30, sector: "Financial Services" },
  { symbol: "BAJAJ-AUTO", company: "Bajaj Auto Ltd", basePrice: 9234.50, sector: "Automobile" },
  { symbol: "BAJAJFINSV", company: "Bajaj Finserv Ltd", basePrice: 1678.90, sector: "Financial Services" },
  { symbol: "APOLLOHOSP", company: "Apollo Hospitals Enterprise", basePrice: 7123.45, sector: "Healthcare" },
  { symbol: "TATACONSUM", company: "Tata Consumer Products Ltd", basePrice: 1145.60, sector: "FMCG" },
  { symbol: "HINDALCO", company: "Hindalco Industries Ltd", basePrice: 678.90, sector: "Metal" },
  { symbol: "SBILIFE", company: "SBI Life Insurance Company", basePrice: 1567.80, sector: "Insurance" },
  { symbol: "HDFCLIFE", company: "HDFC Life Insurance Company", basePrice: 678.45, sector: "Insurance" },
  { symbol: "BEL", company: "Bharat Electronics Ltd", basePrice: 298.75, sector: "Defence" },
];

// NIFTY Bank stocks
const NIFTY_BANK_STOCKS = NIFTY_50_STOCKS.filter(s => s.sector === "Banking").concat([
  { symbol: "BANDHANBNK", company: "Bandhan Bank Ltd", basePrice: 178.50, sector: "Banking" },
  { symbol: "PNB", company: "Punjab National Bank", basePrice: 102.35, sector: "Banking" },
  { symbol: "BANKBARODA", company: "Bank of Baroda", basePrice: 245.60, sector: "Banking" },
  { symbol: "IDFCFIRSTB", company: "IDFC First Bank Ltd", basePrice: 78.45, sector: "Banking" },
  { symbol: "FEDERALBNK", company: "Federal Bank Ltd", basePrice: 198.30, sector: "Banking" },
  { symbol: "AUBANK", company: "AU Small Finance Bank", basePrice: 567.80, sector: "Banking" },
]);

// NIFTY IT stocks
const NIFTY_IT_STOCKS = NIFTY_50_STOCKS.filter(s => s.sector === "IT").concat([
  { symbol: "LTIM", company: "LTIMindtree Ltd", basePrice: 5678.90, sector: "IT" },
  { symbol: "COFORGE", company: "Coforge Ltd", basePrice: 7234.50, sector: "IT" },
  { symbol: "PERSISTENT", company: "Persistent Systems Ltd", basePrice: 5123.45, sector: "IT" },
  { symbol: "MPHASIS", company: "Mphasis Ltd", basePrice: 2789.60, sector: "IT" },
  { symbol: "LTTS", company: "L&T Technology Services", basePrice: 5234.80, sector: "IT" },
]);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "nifty50";
  const symbol = searchParams.get("symbol") || "";

  // Get current time info for market status
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const day = now.getDay();
  const isWeekday = day > 0 && day < 6;
  const isMarketHours = isWeekday && hours >= 9 && (hours < 15 || (hours === 15 && minutes <= 30));
  const marketStatus = isMarketHours ? "Market Open" : "Market Closed";

  try {
    let processedData: any;

    switch (type) {
      case "nifty50": {
        const stocks = NIFTY_50_STOCKS.map(s => 
          generateStockData(s.symbol, s.basePrice, s.company, s.sector)
        );
        const totalChange = stocks.reduce((acc, s) => acc + s.pChange, 0) / stocks.length;
        const indexBase = 24567.80;
        const indexValue = Math.round(indexBase * (1 + totalChange / 100) * 100) / 100;
        
        processedData = {
          name: "NIFTY 50",
          lastUpdated: now.toISOString(),
          indexValue,
          indexChange: Math.round((indexValue - indexBase) * 100) / 100,
          indexPercentChange: Math.round(totalChange * 100) / 100,
          marketStatus,
          advances: stocks.filter(s => s.change > 0).length,
          declines: stocks.filter(s => s.change < 0).length,
          unchanged: stocks.filter(s => s.change === 0).length,
          stocks,
        };
        break;
      }

      case "niftybank": {
        const stocks = NIFTY_BANK_STOCKS.map(s => 
          generateStockData(s.symbol, s.basePrice, s.company, s.sector)
        );
        const totalChange = stocks.reduce((acc, s) => acc + s.pChange, 0) / stocks.length;
        const indexBase = 51234.60;
        
        processedData = {
          name: "NIFTY BANK",
          lastUpdated: now.toISOString(),
          indexValue: Math.round(indexBase * (1 + totalChange / 100) * 100) / 100,
          indexChange: Math.round(indexBase * totalChange / 100 * 100) / 100,
          indexPercentChange: Math.round(totalChange * 100) / 100,
          marketStatus,
          stocks,
        };
        break;
      }

      case "niftyit": {
        const stocks = NIFTY_IT_STOCKS.map(s => 
          generateStockData(s.symbol, s.basePrice, s.company, s.sector)
        );
        const totalChange = stocks.reduce((acc, s) => acc + s.pChange, 0) / stocks.length;
        const indexBase = 38456.25;
        
        processedData = {
          name: "NIFTY IT",
          lastUpdated: now.toISOString(),
          indexValue: Math.round(indexBase * (1 + totalChange / 100) * 100) / 100,
          indexChange: Math.round(indexBase * totalChange / 100 * 100) / 100,
          indexPercentChange: Math.round(totalChange * 100) / 100,
          marketStatus,
          stocks,
        };
        break;
      }

      case "gainers": {
        const allStocks = NIFTY_50_STOCKS.map(s => 
          generateStockData(s.symbol, s.basePrice, s.company, s.sector)
        );
        const gainers = allStocks
          .filter(s => s.pChange > 0)
          .sort((a, b) => b.pChange - a.pChange)
          .slice(0, 20);
        
        processedData = {
          name: "Top Gainers",
          lastUpdated: now.toISOString(),
          marketStatus,
          stocks: gainers,
        };
        break;
      }

      case "losers": {
        const allStocks = NIFTY_50_STOCKS.map(s => 
          generateStockData(s.symbol, s.basePrice, s.company, s.sector)
        );
        const losers = allStocks
          .filter(s => s.pChange < 0)
          .sort((a, b) => a.pChange - b.pChange)
          .slice(0, 20);
        
        processedData = {
          name: "Top Losers",
          lastUpdated: now.toISOString(),
          marketStatus,
          stocks: losers,
        };
        break;
      }

      case "mostactive": {
        const allStocks = NIFTY_50_STOCKS.map(s => 
          generateStockData(s.symbol, s.basePrice, s.company, s.sector)
        );
        const active = allStocks
          .sort((a, b) => b.totalTradedVolume - a.totalTradedVolume)
          .slice(0, 20);
        
        processedData = {
          name: "Most Active Stocks",
          lastUpdated: now.toISOString(),
          marketStatus,
          stocks: active,
        };
        break;
      }

      case "quote": {
        if (!symbol) {
          return NextResponse.json(
            { error: "Symbol parameter required" },
            { status: 400 }
          );
        }
        
        const stockInfo = [...NIFTY_50_STOCKS, ...NIFTY_BANK_STOCKS, ...NIFTY_IT_STOCKS]
          .find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
        
        if (!stockInfo) {
          return NextResponse.json(
            { error: `Stock ${symbol} not found` },
            { status: 404 }
          );
        }
        
        processedData = generateStockData(
          stockInfo.symbol, 
          stockInfo.basePrice, 
          stockInfo.company, 
          stockInfo.sector
        );
        break;
      }

      case "indices": {
        const generateIndexData = (name: string, baseValue: number) => {
          const seed = getTimeBasedSeed();
          const variation = ((seed * name.charCodeAt(0)) % 300) / 100 - 1.5;
          const lastPrice = Math.round(baseValue * (1 + variation / 100) * 100) / 100;
          return {
            name,
            lastPrice,
            change: Math.round((lastPrice - baseValue) * 100) / 100,
            pChange: Math.round(variation * 100) / 100,
            open: getRandomVariation(baseValue, 0.5),
            high: Math.max(lastPrice, getRandomVariation(baseValue, 1.5)),
            low: Math.min(lastPrice, getRandomVariation(baseValue, 1.5)),
            previousClose: baseValue,
          };
        };
        
        processedData = {
          name: "All Indices",
          lastUpdated: now.toISOString(),
          marketStatus,
          indices: [
            generateIndexData("NIFTY 50", 24567.80),
            generateIndexData("NIFTY NEXT 50", 62345.10),
            generateIndexData("NIFTY MIDCAP 50", 15678.90),
            generateIndexData("NIFTY MIDCAP 100", 56234.50),
            generateIndexData("NIFTY SMALLCAP 50", 8234.60),
            generateIndexData("NIFTY BANK", 51234.60),
            generateIndexData("NIFTY IT", 38456.25),
            generateIndexData("NIFTY FINANCIAL SERVICES", 23456.80),
            generateIndexData("NIFTY AUTO", 19876.45),
            generateIndexData("NIFTY PHARMA", 18234.60),
            generateIndexData("NIFTY FMCG", 58967.30),
            generateIndexData("NIFTY METAL", 9234.50),
            generateIndexData("NIFTY REALTY", 1045.60),
            generateIndexData("NIFTY ENERGY", 40123.80),
            generateIndexData("NIFTY INFRA", 8567.90),
            generateIndexData("SENSEX", 81234.50),
            generateIndexData("SENSEX 50", 82567.30),
            generateIndexData("BSE MIDCAP", 45678.90),
            generateIndexData("BSE SMALLCAP", 56789.30),
          ],
        };
        break;
      }

      case "fii-dii": {
        const seed = getTimeBasedSeed();
        processedData = {
          name: "FII/DII Activity",
          lastUpdated: now.toISOString(),
          date: now.toISOString().split('T')[0],
          fii: {
            buyValue: Math.round((8000 + (seed % 4000)) * 100) / 100,
            sellValue: Math.round((7500 + (seed % 3500)) * 100) / 100,
            netValue: Math.round((500 + (seed % 1000) - 500) * 100) / 100,
          },
          dii: {
            buyValue: Math.round((6000 + (seed % 3000)) * 100) / 100,
            sellValue: Math.round((5500 + (seed % 2500)) * 100) / 100,
            netValue: Math.round((500 + (seed % 800) - 400) * 100) / 100,
          },
        };
        break;
      }

      case "marketstatus": {
        processedData = {
          name: "Market Status",
          lastUpdated: now.toISOString(),
          status: [
            { market: "Capital Market", status: marketStatus, tradeDate: now.toISOString().split('T')[0] },
            { market: "Equity Derivatives", status: marketStatus, tradeDate: now.toISOString().split('T')[0] },
            { market: "Currency Derivatives", status: marketStatus, tradeDate: now.toISOString().split('T')[0] },
            { market: "Commodity Derivatives", status: isMarketHours || (hours >= 9 && hours < 23) ? "Market Open" : "Market Closed", tradeDate: now.toISOString().split('T')[0] },
          ],
        };
        break;
      }

      case "upcoming-results": {
        const companies = NIFTY_50_STOCKS.slice(0, 15);
        const futureDate = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
        processedData = {
          name: "Upcoming Results",
          lastUpdated: now.toISOString(),
          events: companies.map(c => ({
            symbol: c.symbol,
            company: c.company,
            exDate: new Date(now.getTime() + Math.random() * 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            purpose: ["Q3 FY25 Results", "Q4 FY24 Results", "Half Yearly Results", "Annual Results"][Math.floor(Math.random() * 4)],
            recordDate: futureDate.toISOString().split('T')[0],
          })),
        };
        break;
      }

      case "ipo": {
        processedData = {
          name: "Upcoming IPOs",
          lastUpdated: now.toISOString(),
          ipos: [
            { company: "Hexaware Technologies Ltd", issueStartDate: "2025-02-12", issueEndDate: "2025-02-14", issuePrice: "708-745", issueSize: "8750 Cr", status: "Upcoming" },
            { company: "Waaree Energies Ltd", issueStartDate: "2025-02-20", issueEndDate: "2025-02-22", issuePrice: "1427-1503", issueSize: "4500 Cr", status: "Upcoming" },
            { company: "LG Electronics India Ltd", issueStartDate: "2025-03-05", issueEndDate: "2025-03-07", issuePrice: "TBA", issueSize: "15000 Cr", status: "Filed" },
            { company: "NSDL Ltd", issueStartDate: "TBA", issueEndDate: "TBA", issuePrice: "TBA", issueSize: "2500 Cr", status: "Filed" },
          ],
        };
        break;
      }

      case "financials": {
        // Company quarterly/yearly financials
        if (!symbol) {
          return NextResponse.json({ error: "Symbol parameter required" }, { status: 400 });
        }
        const stockInfo = NIFTY_50_STOCKS.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
        if (!stockInfo) {
          return NextResponse.json({ error: `Stock ${symbol} not found` }, { status: 404 });
        }
        
        const baseRevenue = stockInfo.basePrice * 1000; // Simulated base revenue
        processedData = {
          name: `${stockInfo.company} - Financials`,
          symbol: stockInfo.symbol,
          lastUpdated: now.toISOString(),
          quarterlyResults: [
            { quarter: "Q3 FY25", revenue: Math.round(baseRevenue * 1.08), netProfit: Math.round(baseRevenue * 0.15), ebitda: Math.round(baseRevenue * 0.22), eps: Math.round(stockInfo.basePrice * 0.025 * 100) / 100 },
            { quarter: "Q2 FY25", revenue: Math.round(baseRevenue * 1.05), netProfit: Math.round(baseRevenue * 0.14), ebitda: Math.round(baseRevenue * 0.21), eps: Math.round(stockInfo.basePrice * 0.023 * 100) / 100 },
            { quarter: "Q1 FY25", revenue: Math.round(baseRevenue * 1.02), netProfit: Math.round(baseRevenue * 0.13), ebitda: Math.round(baseRevenue * 0.20), eps: Math.round(stockInfo.basePrice * 0.022 * 100) / 100 },
            { quarter: "Q4 FY24", revenue: Math.round(baseRevenue * 1.00), netProfit: Math.round(baseRevenue * 0.12), ebitda: Math.round(baseRevenue * 0.19), eps: Math.round(stockInfo.basePrice * 0.020 * 100) / 100 },
          ],
          annualResults: [
            { year: "FY24", revenue: Math.round(baseRevenue * 4.0), netProfit: Math.round(baseRevenue * 0.52), totalAssets: Math.round(baseRevenue * 8), netWorth: Math.round(baseRevenue * 3.5), debtToEquity: 0.45 },
            { year: "FY23", revenue: Math.round(baseRevenue * 3.6), netProfit: Math.round(baseRevenue * 0.45), totalAssets: Math.round(baseRevenue * 7), netWorth: Math.round(baseRevenue * 3.0), debtToEquity: 0.52 },
            { year: "FY22", revenue: Math.round(baseRevenue * 3.2), netProfit: Math.round(baseRevenue * 0.38), totalAssets: Math.round(baseRevenue * 6), netWorth: Math.round(baseRevenue * 2.6), debtToEquity: 0.58 },
          ],
          keyMetrics: {
            marketCap: Math.round(stockInfo.basePrice * 500000),
            peRatio: Math.round((15 + Math.random() * 20) * 100) / 100,
            pbRatio: Math.round((2 + Math.random() * 4) * 100) / 100,
            dividendYield: Math.round((0.5 + Math.random() * 2.5) * 100) / 100,
            roe: Math.round((12 + Math.random() * 15) * 100) / 100,
            roce: Math.round((10 + Math.random() * 18) * 100) / 100,
          },
        };
        break;
      }

      case "sector-financials": {
        // Sector-wise financial comparison
        const sectors = ["Banking", "IT", "Pharma", "Automobile", "FMCG", "Oil & Gas", "Metal", "Power"];
        processedData = {
          name: "Sector-wise Financial Comparison",
          lastUpdated: now.toISOString(),
          sectors: sectors.map(sector => {
            const sectorStocks = NIFTY_50_STOCKS.filter(s => s.sector === sector);
            const avgPrice = sectorStocks.reduce((acc, s) => acc + s.basePrice, 0) / (sectorStocks.length || 1);
            return {
              sector,
              stockCount: sectorStocks.length,
              avgMarketCap: Math.round(avgPrice * 300000),
              avgPE: Math.round((15 + Math.random() * 15) * 100) / 100,
              avgROE: Math.round((10 + Math.random() * 20) * 100) / 100,
              ytdReturn: Math.round((Math.random() - 0.3) * 40 * 100) / 100,
              topStock: sectorStocks[0]?.symbol || "N/A",
            };
          }),
        };
        break;
      }

      case "budget-allocation": {
        // Indian Union Budget 2024-25 allocation data
        processedData = {
          name: "Union Budget 2024-25 - Sector Allocation",
          lastUpdated: now.toISOString(),
          totalBudget: "48.21 Lakh Cr",
          fiscalYear: "2024-25",
          allocations: [
            { sector: "Defence", allocation: 621940, percentOfTotal: 12.9, yoyChange: 4.72, keyFocus: "Indigenous manufacturing, modernization" },
            { sector: "Rural Development", allocation: 268574, percentOfTotal: 5.57, yoyChange: 8.5, keyFocus: "MGNREGA, rural infrastructure" },
            { sector: "Agriculture & Allied", allocation: 154302, percentOfTotal: 3.2, yoyChange: 7.8, keyFocus: "PM-KISAN, crop insurance, irrigation" },
            { sector: "Education", allocation: 120628, percentOfTotal: 2.5, yoyChange: 6.8, keyFocus: "NEP implementation, digital education" },
            { sector: "Health & Family Welfare", allocation: 90958, percentOfTotal: 1.89, yoyChange: 12.6, keyFocus: "Ayushman Bharat, healthcare infra" },
            { sector: "Railways", allocation: 265200, percentOfTotal: 5.5, yoyChange: 5.8, keyFocus: "Vande Bharat, station redevelopment" },
            { sector: "Road Transport & Highways", allocation: 278000, percentOfTotal: 5.77, yoyChange: 3.2, keyFocus: "Bharatmala, expressways" },
            { sector: "Housing & Urban Affairs", allocation: 82577, percentOfTotal: 1.71, yoyChange: 15.4, keyFocus: "PMAY, smart cities, metro" },
            { sector: "IT & Electronics", allocation: 21936, percentOfTotal: 0.45, yoyChange: 25.8, keyFocus: "Semiconductor fab, PLI schemes" },
            { sector: "Renewable Energy", allocation: 19100, percentOfTotal: 0.40, yoyChange: 32.5, keyFocus: "Solar, wind, green hydrogen" },
            { sector: "MSME", allocation: 22138, percentOfTotal: 0.46, yoyChange: 18.2, keyFocus: "Credit guarantee, digital enablement" },
            { sector: "Telecommunications", allocation: 116342, percentOfTotal: 2.41, yoyChange: 9.5, keyFocus: "5G rollout, BharatNet" },
          ],
        };
        break;
      }

      case "govt-schemes": {
        // Government investment schemes and PLI
        processedData = {
          name: "Government Investment & PLI Schemes",
          lastUpdated: now.toISOString(),
          schemes: [
            { name: "PLI - Electronics & IT Hardware", outlay: 17000, duration: "2021-2029", beneficiaries: "Large electronics manufacturers", targetProduction: "8 Lakh Cr", status: "Active" },
            { name: "PLI - Automobiles & Auto Components", outlay: 25938, duration: "2022-2027", beneficiaries: "Auto OEMs, EV makers", targetProduction: "2.3 Lakh Cr", status: "Active" },
            { name: "PLI - Pharmaceuticals", outlay: 15000, duration: "2021-2029", beneficiaries: "Pharma manufacturers", targetProduction: "2.94 Lakh Cr", status: "Active" },
            { name: "PLI - Telecom & Networking", outlay: 12195, duration: "2021-2026", beneficiaries: "Telecom equipment makers", targetProduction: "2.4 Lakh Cr", status: "Active" },
            { name: "PLI - White Goods (AC, LED)", outlay: 6238, duration: "2021-2029", beneficiaries: "AC, LED manufacturers", targetProduction: "1.68 Lakh Cr", status: "Active" },
            { name: "PLI - Solar PV Modules", outlay: 24000, duration: "2022-2030", beneficiaries: "Solar manufacturers", targetProduction: "10 GW capacity", status: "Active" },
            { name: "PLI - Semiconductor & Display", outlay: 76000, duration: "2022-2030", beneficiaries: "Chip fabs, OSAT units", targetProduction: "3 Semiconductor fabs", status: "Active" },
            { name: "PLI - Drones", outlay: 120, duration: "2021-2025", beneficiaries: "Drone manufacturers", targetProduction: "1800 Cr", status: "Active" },
            { name: "PM Gati Shakti", outlay: 100000, duration: "2021-2026", beneficiaries: "Infrastructure sector", targetProduction: "Multi-modal connectivity", status: "Active" },
            { name: "National Green Hydrogen Mission", outlay: 19744, duration: "2023-2030", beneficiaries: "Green hydrogen producers", targetProduction: "5 MMT by 2030", status: "Active" },
          ],
        };
        break;
      }

      case "sector-outlook": {
        // Sector outlook based on budget and govt focus
        processedData = {
          name: "Sector Outlook - Budget Impact",
          lastUpdated: now.toISOString(),
          analysis: [
            { sector: "Defence", outlook: "Very Bullish", budgetImpact: "High", keyBeneficiaries: "HAL, BEL, Mazagon Dock, BEML", growthPotential: "18-22%", reason: "Atmanirbhar focus, increased capex" },
            { sector: "Railways", outlook: "Bullish", budgetImpact: "High", keyBeneficiaries: "IRFC, RVNL, Titagarh, Jupiter Wagons", growthPotential: "15-20%", reason: "Massive infrastructure spending" },
            { sector: "Renewable Energy", outlook: "Very Bullish", budgetImpact: "High", keyBeneficiaries: "Adani Green, Tata Power, NTPC, JSW Energy", growthPotential: "20-30%", reason: "Green hydrogen mission, solar PLI" },
            { sector: "Semiconductors", outlook: "Very Bullish", budgetImpact: "Very High", keyBeneficiaries: "Dixon, Kaynes, Syrma, Vedanta (JV)", growthPotential: "25-35%", reason: "76,000 Cr PLI scheme" },
            { sector: "EV & Auto", outlook: "Bullish", budgetImpact: "High", keyBeneficiaries: "Tata Motors, M&M, TVS, Ola Electric", growthPotential: "18-25%", reason: "FAME III, PLI auto" },
            { sector: "Pharma", outlook: "Moderately Bullish", budgetImpact: "Medium", keyBeneficiaries: "Sun Pharma, Dr Reddy, Cipla, Biocon", growthPotential: "12-15%", reason: "PLI pharma, API focus" },
            { sector: "Infrastructure", outlook: "Bullish", budgetImpact: "High", keyBeneficiaries: "L&T, Adani Ports, UltraTech, ACC", growthPotential: "15-18%", reason: "PM Gati Shakti, road capex" },
            { sector: "Banking", outlook: "Stable", budgetImpact: "Medium", keyBeneficiaries: "SBI, HDFC Bank, ICICI Bank", growthPotential: "10-14%", reason: "Credit growth, NPA improvement" },
          ],
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      source: "Indian Stocks API (Simulated)",
      type,
      data: processedData,
      note: "Live-like data with realistic market simulation. Prices update every minute.",
    });
  } catch (error) {
    console.error("Indian Stocks API Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
