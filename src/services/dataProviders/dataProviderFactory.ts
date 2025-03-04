
import { DataProviderInterface, DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { TDAmeritradeService } from "./tdAmeritradeService";
import { SchwabService } from "./schwabService";
import { InteractiveBrokersService } from "./interactiveBrokersService";
import { toast } from "@/hooks/use-toast";

// Mock service for development
class MockDataProvider implements DataProviderInterface {
  // Return mock implementations of all required methods
  // ... implementation would be similar to our existing mock data services
  async getMarketData() { return import('@/services/spyOptionsService').then(m => m.getSpyMarketData()); }
  async getOptions() { return import('@/services/spyOptionsService').then(m => m.getSpyOptions()); }
  async getOptionsByType(type) { return import('@/services/spyOptionsService').then(m => m.getSpyOptionsByType(type)); }
  async getOptionChain() { return import('@/services/spyOptionsService').then(m => m.getSpyOptions()); }
  async getTrades() { return import('@/services/spyOptionsService').then(m => m.getSpyTrades()); }
  async getTradesByStatus(status) { return import('@/services/spyOptionsService').then(m => m.getSpyTradesByStatus(status)); }
  isConnected() { return true; }
  async connect() { return true; }
  async disconnect() { return true; }
}

// Singleton instance of data provider
let dataProviderInstance: DataProviderInterface | null = null;

/**
 * Get or create a data provider based on configuration
 */
export const getDataProvider = (config?: DataProviderConfig): DataProviderInterface => {
  // If no config provided and instance exists, return existing instance
  if (!config && dataProviderInstance) {
    return dataProviderInstance;
  }

  // If no config provided, use mock provider
  if (!config) {
    console.log("No data provider config provided, using mock provider");
    dataProviderInstance = new MockDataProvider();
    return dataProviderInstance;
  }

  // Create provider based on type
  switch (config.type) {
    case 'td-ameritrade':
      console.log("Creating TD Ameritrade data provider");
      dataProviderInstance = new TDAmeritradeService(config);
      break;
    case 'schwab':
      console.log("Creating Schwab data provider");
      dataProviderInstance = new SchwabService(config);
      break;
    case 'interactive-brokers':
      console.log("Creating Interactive Brokers data provider");
      dataProviderInstance = new InteractiveBrokersService(config);
      break;
    default:
      console.log("Unknown provider type, using mock provider");
      dataProviderInstance = new MockDataProvider();
  }

  return dataProviderInstance;
};

/**
 * Clear the current data provider instance
 */
export const clearDataProvider = (): void => {
  dataProviderInstance = null;
};

const notifyUser = (message: string, isError: boolean = false) => {
  if (typeof window !== 'undefined') {
    toast({
      title: isError ? 'Connection Error' : 'Connection Status',
      description: message,
      variant: isError ? 'destructive' : 'default',
    });
  }
};
