# FinBoard - Customizable Finance Dashboard

A feature-rich, responsive finance dashboard built with Next.js 15, React 19, and TypeScript. This application allows users to create, customize, and manage multiple widgets displaying financial data from various APIs.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.11-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8)

---

## 🎯 Assignment Requirements vs Implementation

### Core Features (Required)

| Requirement                | Status  | Implementation Details                                |
| -------------------------- | ------- | ----------------------------------------------------- |
| Widget Management          | ✅ Done | Add, remove, configure widgets with real-time updates |
| Drag-and-Drop              | ✅ Done | Implemented using @dnd-kit for smooth rearrangement   |
| Financial Data Integration | ✅ Done | Finnhub API + Indian Stock Market proxy               |
| State Management           | ✅ Done | Redux Toolkit with persistence                        |
| Responsive Design          | ✅ Done | 3→2→1 column grid based on screen size                |

### Advanced Features (Brownie Points)

| Feature                  | Status  | Implementation Details                                           |
| ------------------------ | ------- | ---------------------------------------------------------------- |
| Customizable Dashboards  | ✅ Done | Full widget configuration, multiple layout options               |
| Theme Switching          | ✅ Done | Light/Dark mode with next-themes                                 |
| LocalStorage Persistence | ✅ Done | Dashboard configs saved automatically                            |
| Export/Import Dashboard  | ✅ Done | JSON-based dashboard sharing                                     |
| Real-time Updates        | ✅ Done | Configurable refresh intervals with countdown timer              |
| Loading & Error States   | ✅ Done | Proper UI feedback for all API states                            |
| Multiple API Sources     | ✅ Done | Finnhub, Indian Markets, CoinGecko, Custom API URLs              |
| Resizable Widgets        | ✅ Done | Height adjustment via drag handle                                |
| WebSocket Real-time Data | ✅ Done | Live stock prices via Finnhub WebSocket with price flash effects |
| Dashboard Templates      | ✅ Done | Pre-built templates: Indian Market, Tech Stocks, Portfolio       |
| Chart Widgets            | ✅ Done | Line, Bar, and Candlestick charts with canvas rendering          |

---

## 🛠️ Tech Stack

| Category         | Technology                       |
| ---------------- | -------------------------------- |
| Framework        | Next.js 15.3.3 (App Router)      |
| Language         | TypeScript 5                     |
| UI Library       | React 19                         |
| State Management | Redux Toolkit 2.11               |
| Drag & Drop      | @dnd-kit/core, @dnd-kit/sortable |
| Charts           | Canvas-based custom charts       |
| HTTP Client      | Axios 1.13                       |
| Styling          | Tailwind CSS 4, CSS Modules      |
| Theming          | next-themes 0.4                  |
| Real-time        | WebSocket (Finnhub)              |

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── indian-stocks/       # Backend proxy for Indian market data
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Main dashboard page
│   └── globals.css              # Global styles & theme variables
│
├── components/
│   ├── common/
│   │   └── Providers.tsx        # Redux & Theme providers
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx  # Header with theme toggle, export/import
│   │   ├── DashboardLayout.tsx  # Main layout container
│   │   ├── IntelligentWidgetConfig.tsx  # Widget creation modal
│   │   ├── TemplateSelector.tsx # Dashboard templates UI
│   │   ├── WidgetConfigPanel.tsx # Widget settings panel
│   │   └── WidgetGrid.tsx       # Grid layout with drag-drop & resize
│   └── widgets/
│       ├── APIDataWidget.tsx    # Universal widget for API data display
│       ├── EnhancedChartWidget.tsx  # Line/Bar/Candlestick charts
│       ├── RealTimeStockWidget.tsx  # WebSocket-powered live prices
│       ├── StockCardWidget.tsx
│       ├── StockChartWidget.tsx
│       └── StockTableWidget.tsx
│
├── config/
│   └── index.ts                 # API providers, grid settings, theme colors
│
├── hooks/
│   └── index.ts                 # Custom hooks (useDashboard, useLocalStorage, etc.)
│
├── services/
│   ├── api/
│   │   └── financialDataClient.ts  # API client with caching & rate limiting
│   ├── microservices/
│   │   └── index.ts
│   └── websocket/
│       └── finnhubSocket.ts     # WebSocket service for real-time data
│
├── store/
│   ├── index.ts                 # Redux store configuration
│   └── slices/
│       ├── dashboardSlice.ts    # Dashboard state management
│       └── preferencesSlice.ts  # User preferences state
│
├── templates/
│   └── index.ts                 # Pre-defined dashboard templates
│
├── types/
│   └── index.ts                 # TypeScript type definitions
│
└── utils/
    ├── index.ts                 # Utility functions
    └── apiDataAdapter.ts        # API response normalization
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd finboard

# Install dependencies
npm install
```

### Environment Variables (Optional)

Create a `.env.local` file:

```env
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

> The app works without API keys using pre-configured presets and the Indian stocks proxy.

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 Features in Detail

### 1. Widget Management

- **Add Widgets**: Click "Create Widget" button → Configure API, display format, and fields
- **Remove Widgets**: Click the close (×) button on any widget
- **Rearrange Widgets**: Drag and drop widgets to reorder them
- **Resize Widgets**: Use the bottom handle to adjust widget height
- **Edit Widgets**: Click the edit icon to modify widget configuration

### 2. Dashboard Templates

Pre-built templates for quick setup:

| Template          | Description                                  |
| ----------------- | -------------------------------------------- |
| Indian Market     | NIFTY 50, Bank NIFTY, Top Gainers/Losers     |
| Tech Stocks       | US tech stocks with real-time WebSocket data |
| Market Overview   | Crypto markets, global indices               |
| Portfolio Tracker | Watchlist with live price updates            |

### 3. API Integration

**Pre-configured API Presets:**

| Category           | Endpoints                                     |
| ------------------ | --------------------------------------------- |
| Indian Stocks      | NIFTY 50, Bank NIFTY, Top Gainers, Top Losers |
| Stock Quotes       | RELIANCE, TCS, INFOSYS, HDFC Bank, and more   |
| Company Financials | Balance Sheet, P&L Statement                  |
| Government Data    | Budget Allocation, Ministry Spending          |
| Crypto Markets     | CoinGecko integration for crypto data         |
| US Market          | Finnhub integration for US stocks             |

**Chart Presets:**

| Chart Type  | Data Source                   |
| ----------- | ----------------------------- |
| Line Chart  | Crypto price trends (30 days) |
| Bar Chart   | Top cryptos by market cap     |
| Candlestick | Stock OHLC data               |

**Custom API Support:**

- Enter any REST API URL
- Automatic JSON parsing and field extraction
- Works with nested data structures
- Select specific fields to display

### 4. Display Modes

| Mode               | Best For                                      |
| ------------------ | --------------------------------------------- |
| **Table View**     | Large datasets with pagination & sorting      |
| **Card View**      | Quick overview with color-coded price changes |
| **Chart View**     | Time-series data visualization                |
| **Real-time View** | Live WebSocket price updates                  |

### 5. Real-time Data

- **WebSocket Integration**: Live stock prices via Finnhub WebSocket
- **Price Flash Effects**: Visual feedback on price changes (green/red flash)
- **Auto-refresh**: Configurable intervals with countdown timer
- **Connection Status**: Visual indicator for WebSocket connection state

### 6. Data Persistence

- ✅ Auto-save dashboard configuration to localStorage
- ✅ Export entire dashboard as JSON file
- ✅ Import previously saved dashboards
- ✅ Preferences (theme) persist across sessions

### 7. Theming

- Light and Dark mode support
- Smooth transitions between themes
- Professional financial UI aesthetic
- Custom CSS variables for easy customization

---

## 📊 Indian Stocks API Proxy

The application includes a backend proxy (`/api/indian-stocks`) that provides Indian market data:

| Endpoint                      | Description            |
| ----------------------------- | ---------------------- |
| `?type=nifty50`               | NIFTY 50 index data    |
| `?type=niftybank`             | Bank NIFTY data        |
| `?type=gainers`               | Top market gainers     |
| `?type=losers`                | Top market losers      |
| `?type=quote&symbol=RELIANCE` | Individual stock quote |
| `?type=financials&symbol=TCS` | Company financials     |
| `?type=budget-allocation`     | Government budget data |

> **Note**: Uses simulated realistic data as NSE/BSE APIs have CORS restrictions and rate limiting for direct browser requests.

---

## 🎨 Responsive Design

| Screen Size         | Columns   | Behavior         |
| ------------------- | --------- | ---------------- |
| Desktop (>1024px)   | 3 columns | Full feature set |
| Tablet (768-1024px) | 2 columns | Adapted layout   |
| Mobile (<768px)     | 1 column  | Stacked widgets  |

---

## 📝 Code Quality

- **TypeScript**: Full type coverage with strict mode enabled
- **Component Architecture**: Modular, single-responsibility components
- **State Management**: Centralized Redux store with typed actions & reducers
- **CSS Modules**: Scoped styling prevents class name conflicts
- **Custom Hooks**: Reusable logic (useLocalStorage, useDebounce, useDashboard)
- **API Client**: Centralized with caching and rate limit handling

---

## 🔧 Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Create production build  |
| `npm start`     | Start production server  |
| `npm run lint`  | Run ESLint               |

---

## 🔍 Key Implementation Highlights

### Drag & Drop

```typescript
// Using @dnd-kit for accessible drag-and-drop
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
```

### State Management

```typescript
// Redux Toolkit slice for dashboard state
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    addWidget,
    updateWidget,
    deleteWidget,
    rearrangeWidgets,
  },
});
```

### WebSocket Real-time Data

```typescript
// Finnhub WebSocket service
class FinnhubSocketService {
  connect(apiKey: string): void;
  subscribe(symbol: string): void;
  onMessage(callback: (data: TradeData) => void): void;
}
```

### Canvas-based Charts

```typescript
// Custom chart rendering with canvas
useEffect(() => {
  const ctx = canvasRef.current.getContext("2d");
  // Draw grid, axes, data points
  // Supports line, bar, and candlestick charts
}, [chartData, chartType]);
```

---

## 📄 License

This project was created as part of Groww's Front-End Engineering Assignment.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com):

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/finboard.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:

   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "New Project"
   - Import your `finboard` repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Environment Variables** (Optional):
   In Vercel dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_FINNHUB_API_KEY=your_key_here
   ```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker (Alternative)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

**Built with ❤️ using Next.js, React, and TypeScript**
