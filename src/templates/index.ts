import { Dashboard, Widget, WidgetType } from '@/types';
import { generateId, createDefaultWidget } from '@/utils';

/**
 * Pre-built dashboard templates for quick setup
 */
export const dashboardTemplates = {
  indianMarket: (): Dashboard => ({
    id: generateId('template'),
    name: 'Indian Market Dashboard',
    description: 'Track NIFTY 50, Bank NIFTY, and top gainers/losers',
    widgets: [
      createAPIWidget('NIFTY 50 Stocks', '/api/indian-stocks?type=nifty50', 'table'),
      createAPIWidget('Top Gainers', '/api/indian-stocks?type=gainers', 'card'),
      createAPIWidget('Top Losers', '/api/indian-stocks?type=losers', 'card'),
      createAPIWidget('Bank NIFTY', '/api/indian-stocks?type=niftybank', 'table'),
    ],
    theme: 'dark',
    layout: 'grid',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  }),

  techStocks: (): Dashboard => ({
    id: generateId('template'),
    name: 'Tech Stocks Monitor',
    description: 'Monitor major technology companies in real-time',
    widgets: [
      createAPIWidget('TCS Quote', '/api/indian-stocks?type=quote&symbol=TCS', 'card'),
      createAPIWidget('Infosys Quote', '/api/indian-stocks?type=quote&symbol=INFOSYS', 'card'),
      createAPIWidget('Wipro Quote', '/api/indian-stocks?type=quote&symbol=WIPRO', 'card'),
      createAPIWidget('Tech Stocks Table', '/api/indian-stocks?type=nifty50', 'table'),
    ],
    theme: 'dark',
    layout: 'grid',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  }),

  marketOverview: (): Dashboard => ({
    id: generateId('template'),
    name: 'Market Overview',
    description: 'Get a quick overview of market gainers and losers',
    widgets: [
      createAPIWidget('Top Gainers', '/api/indian-stocks?type=gainers', 'card'),
      createAPIWidget('Top Losers', '/api/indian-stocks?type=losers', 'card'),
      createAPIWidget('Market Data', '/api/indian-stocks?type=nifty50', 'table'),
    ],
    theme: 'dark',
    layout: 'grid',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  }),

  portfolioTracker: (): Dashboard => ({
    id: generateId('template'),
    name: 'Portfolio Tracker',
    description: 'Monitor your portfolio with key stocks',
    widgets: [
      createAPIWidget('Reliance', '/api/indian-stocks?type=quote&symbol=RELIANCE', 'card'),
      createAPIWidget('HDFC Bank', '/api/indian-stocks?type=quote&symbol=HDFCBANK', 'card'),
      createAPIWidget('ICICI Bank', '/api/indian-stocks?type=quote&symbol=ICICIBANK', 'card'),
      createAPIWidget('All Stocks', '/api/indian-stocks?type=nifty50', 'table'),
    ],
    theme: 'dark',
    layout: 'grid',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  }),
};

/**
 * Helper function to create API widget with proper configuration
 */
function createAPIWidget(
  title: string,
  apiUrl: string,
  displayMode: 'table' | 'card' | 'chart',
  selectedFields?: string[]
): Widget {
  // Determine the right fields based on API endpoint
  let fields = selectedFields;
  if (!fields || fields.length === 0) {
    // Indian stocks API wraps response in { data: { stocks: [...] } }
    if (apiUrl.includes('type=nifty50') || apiUrl.includes('type=niftybank') || 
        apiUrl.includes('type=niftyit') || apiUrl.includes('type=gainers') || 
        apiUrl.includes('type=losers') || apiUrl.includes('type=mostactive')) {
      fields = ['data.stocks'];
    } else if (apiUrl.includes('type=quote')) {
      fields = ['data'];
    } else if (apiUrl.includes('type=indices')) {
      fields = ['data.indices'];
    } else if (apiUrl.includes('type=financials')) {
      fields = ['data.quarterlyResults'];
    } else if (apiUrl.includes('type=budget')) {
      fields = ['data.allocations'];
    }
  }

  return {
    id: generateId('widget'),
    type: 'stock-table' as WidgetType,
    title,
    position: { x: 0, y: 0 },
    size: { width: 400, height: 400 },
    config: {
      apiEndpoint: apiUrl,
      apiUrl: apiUrl,
      displayMode: displayMode,
      refreshInterval: 60000,
      selectedFields: fields || [],
      filters: {},
      format: {},
      pageSize: 10,
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
}

/**
 * Get all available templates
 */
export const getTemplates = (): Dashboard[] => {
  return [
    dashboardTemplates.indianMarket(),
    dashboardTemplates.techStocks(),
    dashboardTemplates.marketOverview(),
    dashboardTemplates.portfolioTracker(),
  ];
};

/**
 * Get template by ID
 */
export const getTemplateById = (templateId: string): Dashboard | undefined => {
  const templates = getTemplates();
  return templates.find((t) => t.name.toLowerCase().includes(templateId.toLowerCase()));
};

/**
 * Load template and create new dashboard from it
 */
export const loadTemplate = (templateId: string): Dashboard | undefined => {
  const template = getTemplateById(templateId);
  if (!template) return undefined;

  return {
    ...template,
    id: generateId('dashboard'),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: false,
  };
};
