
import { DataProviderConfig, DataProviderInterface, DataProviderType } from '@/lib/types/spy/dataProvider';

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

// Factory function to get a data provider instance
// Simplified to always return a mock provider for now
export const getDataProvider = (config?: DataProviderConfig): DataProviderInterface => {
  return new MockDataProvider(config);
};

// Added to match imported function in test files
export const clearDataProvider = () => {
  // This would normally clear a cached provider instance
  console.log('Data provider cleared');
};
