import { DataProviderConfig, DataProviderInterface, DataProviderType } from '@/lib/types/spy/dataProvider';
import { InteractiveBrokersDataProvider } from './interactiveBrokersDataProvider';

// Mock implementation that implements the DataProviderInterface
class MockDataProvider implements DataProviderInterface {
  constructor(config?: DataProviderConfig) {
    // Store config if needed
  }

  async getMarketData() {
    return { status: 'success', data: [] };
  }

  async getOptions() {
    return { status: 'success', data: [] };
  }

  async getOptionChain(symbol: string) {
    return { 
      status: 'success', 
      data: {
        symbol,
        expirations: [],
        calls: [],
        puts: []
      } 
    };
  }

  async getTrades() {
    return { status: 'success', data: [] };
  }

  async getAccountData() {
    return { 
      status: 'success',
      data: {
        accountId: 'mock-account',
        balance: 10000,
        availableFunds: 10000,
        buyingPower: 10000,
        currency: 'USD'
      } 
    };
  }

  async placeTrade(order: any) {
    return { 
      status: 'success', 
      data: {
        orderId: 'mock-order-' + Date.now(),
        status: 'submitted'
      } 
    };
  }

  isConnected() {
    return false;
  }

  async connect() {
    return true;
  }

  async disconnect() {
    return true;
  }
}

// Keep track of the current provider instance
let currentProvider: DataProviderInterface | null = null;

// Factory function to get a data provider instance
export const getDataProvider = (config?: DataProviderConfig): DataProviderInterface => {
  // If no config is provided, return the current provider or create a mock one
  if (!config) {
    return currentProvider || new MockDataProvider();
  }

  // Create a new provider based on the type
  switch(config.type) {
    case 'interactive-brokers':
    case 'interactive-brokers-tws':
      currentProvider = new InteractiveBrokersDataProvider(config);
      break;
    case 'td-ameritrade':
      // For now, return a mock provider for TD Ameritrade
      currentProvider = new MockDataProvider(config);
      break;
    case 'schwab':
      // For now, return a mock provider for Schwab
      currentProvider = new MockDataProvider(config);
      break;
    case 'mock':
    default:
      currentProvider = new MockDataProvider(config);
  }

  return currentProvider;
};

// Added to match imported function in test files
export const clearDataProvider = () => {
  currentProvider = null;
  console.log('Data provider cleared');
};
