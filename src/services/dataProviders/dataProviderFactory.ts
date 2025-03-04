
import { DataProviderConfig, DataProviderInterface, DataProviderType } from '@/lib/types/spy/dataProvider';
import { InteractiveBrokersDataProvider } from './interactiveBrokersDataProvider';

// Mock implementation that implements the DataProviderInterface
class MockDataProvider implements DataProviderInterface {
  private connected: boolean = false;
  
  constructor(config?: DataProviderConfig) {
    // Store config if needed
    console.log('[Mock Provider] Initialized with config:', config);
  }

  async getMarketData() {
    console.log('[Mock Provider] Getting market data');
    return { 
      status: 'success', 
      data: [
        {
          symbol: 'SPY',
          price: 432.89,
          change: 2.15,
          percentChange: 0.5,
          volume: 28500000,
          timestamp: new Date().toISOString()
        },
        {
          symbol: 'QQQ',
          price: 387.45,
          change: 1.76,
          percentChange: 0.46,
          volume: 19800000,
          timestamp: new Date().toISOString()
        }
      ] 
    };
  }

  async getOptions() {
    console.log('[Mock Provider] Getting options data');
    return { 
      status: 'success', 
      data: [
        {
          symbol: 'SPY',
          expirationDate: '2023-12-15',
          strikePrice: 430,
          optionType: 'call',
          lastPrice: 6.25,
          volume: 13800
        },
        {
          symbol: 'SPY',
          expirationDate: '2023-12-15',
          strikePrice: 430,
          optionType: 'put',
          lastPrice: 5.10,
          volume: 11500
        }
      ] 
    };
  }

  async getOptionChain(symbol: string) {
    console.log(`[Mock Provider] Getting option chain for ${symbol}`);
    return { 
      status: 'success', 
      data: {
        symbol,
        expirations: ['2023-12-15', '2023-12-22', '2023-12-29'],
        calls: [
          {
            strike: 430,
            lastPrice: 6.25,
            bid: 6.20,
            ask: 6.30,
            volume: 13800,
            openInterest: 48000,
            delta: 0.58
          }
        ],
        puts: [
          {
            strike: 430,
            lastPrice: 5.10,
            bid: 5.05,
            ask: 5.15,
            volume: 11500,
            openInterest: 42000,
            delta: -0.42
          }
        ]
      } 
    };
  }

  async getTrades() {
    console.log('[Mock Provider] Getting trade history');
    return { 
      status: 'success', 
      data: [
        {
          id: 'trade-001',
          symbol: 'SPY',
          quantity: 10,
          price: 432.89,
          action: 'BUY',
          orderType: 'MARKET',
          status: 'FILLED',
          timestamp: new Date().toISOString()
        },
        {
          id: 'trade-002',
          symbol: 'QQQ',
          quantity: 5,
          price: 387.45,
          action: 'BUY',
          orderType: 'LIMIT',
          status: 'FILLED',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ] 
    };
  }

  async getAccountData() {
    console.log('[Mock Provider] Getting account data');
    return { 
      status: 'success',
      data: {
        accountId: 'mock-account-123',
        balance: 100000,
        availableFunds: 95000,
        buyingPower: 190000,
        currency: 'USD'
      } 
    };
  }

  async placeTrade(order: any) {
    console.log('[Mock Provider] Placing trade:', order);
    return { 
      status: 'success', 
      data: {
        orderId: 'mock-order-' + Date.now(),
        status: 'submitted'
      } 
    };
  }

  isConnected() {
    console.log('[Mock Provider] Checking connection status:', this.connected);
    return this.connected;
  }

  async connect() {
    console.log('[Mock Provider] Connecting...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.connected = true;
    console.log('[Mock Provider] Connected');
    return true;
  }

  async disconnect() {
    console.log('[Mock Provider] Disconnecting...');
    this.connected = false;
    console.log('[Mock Provider] Disconnected');
    return true;
  }
}

// Keep track of the current provider instance
let currentProvider: DataProviderInterface | null = null;

// Factory function to get a data provider instance
export const getDataProvider = (config?: DataProviderConfig): DataProviderInterface => {
  // If no config is provided, return the current provider or create a mock one
  if (!config) {
    console.log('[Data Provider Factory] No config provided, returning current or mock provider');
    return currentProvider || new MockDataProvider();
  }

  console.log('[Data Provider Factory] Creating provider with type:', config.type);

  // Create a new provider based on the type
  switch(config.type) {
    case 'interactive-brokers':
    case 'interactive-brokers-tws':
      console.log('[Data Provider Factory] Creating Interactive Brokers provider');
      currentProvider = new InteractiveBrokersDataProvider(config);
      break;
    case 'td-ameritrade':
      console.log('[Data Provider Factory] Creating TD Ameritrade provider (mock)');
      currentProvider = new MockDataProvider(config);
      break;
    case 'schwab':
      console.log('[Data Provider Factory] Creating Schwab provider (mock)');
      currentProvider = new MockDataProvider(config);
      break;
    case 'mock':
    default:
      console.log('[Data Provider Factory] Creating Mock provider');
      currentProvider = new MockDataProvider(config);
  }

  return currentProvider;
};

// Clears the current data provider instance
export const clearDataProvider = () => {
  currentProvider = null;
  console.log('[Data Provider Factory] Data provider cleared');
};
