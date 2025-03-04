
import { DataProviderConfig, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import * as utils from "../utils";

/**
 * Handles data retrieval from TWS
 */
export class TwsDataService {
  private config: DataProviderConfig;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
  }
  
  /**
   * Get market data from TWS
   */
  async getMarketData(): Promise<SpyMarketData> {
    // In a real implementation, this would communicate with TWS
    // For now, return mock data with a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockData = utils.generateMockMarketData();
    
    // Modify mock data to make it appear slightly different from web API data
    mockData.price = parseFloat((mockData.price + (Math.random() * 0.5 - 0.25)).toFixed(2));
    mockData.volume = Math.floor(mockData.volume * (1 + (Math.random() * 0.1 - 0.05)));
    
    // Add paper trading indicator if using paper trading
    if (this.config.paperTrading) {
      mockData.paperTrading = true;
    }
    
    return mockData;
  }
  
  /**
   * Get options from TWS
   */
  async getOptions(): Promise<SpyOption[]> {
    // In a real implementation, this would communicate with TWS
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const options = utils.generateMockOptions();
    
    // Add paper trading indicator if using paper trading
    if (this.config.paperTrading) {
      options.forEach(option => {
        option.paperTrading = true;
        
        // Slightly adjust premiums for TWS data to make it realistic
        option.premium = parseFloat((option.premium * (1 + (Math.random() * 0.05 - 0.025))).toFixed(2));
      });
    }
    
    return options;
  }
  
  /**
   * Get option chain from TWS
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    // In a real implementation, this would communicate with TWS
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const options = utils.generateMockOptions();
    
    // Add symbol and paper trading indicator if using paper trading
    options.forEach(option => {
      option.symbol = symbol;
      
      if (this.config.paperTrading) {
        option.paperTrading = true;
      }
    });
    
    return options;
  }
  
  /**
   * Get trades from TWS
   */
  async getTrades(): Promise<SpyTrade[]> {
    // In a real implementation, this would communicate with TWS
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const trades = utils.generateMockTrades();
    
    // Add paper trading indicator if using paper trading
    if (this.config.paperTrading) {
      trades.forEach(trade => {
        trade.paperTrading = true;
      });
    }
    
    return trades;
  }
  
  /**
   * Get account data from TWS
   */
  async getAccountData(): Promise<{balance: number, dailyPnL: number, allTimePnL: number}> {
    console.log("Fetching account data from Interactive Brokers TWS...");
    
    // In a real implementation, this would fetch actual account data from TWS
    // For demonstration, we're using different mock values than Web API
    return {
      balance: this.config.paperTrading ? 10000 : 25000,
      dailyPnL: this.config.paperTrading ? 125.75 : 250.25,
      allTimePnL: this.config.paperTrading ? 1250.50 : 2750.75
    };
  }
  
  /**
   * Place trade via TWS
   */
  async placeTrade(order: TradeOrder): Promise<any> {
    console.log("Placing trade via Interactive Brokers TWS...", order);
    
    // In a real implementation, this would place an actual trade via TWS
    // For now, return a mock response
    return {
      orderId: `tws-${Date.now()}`,
      status: 'pending',
      details: order
    };
  }
}
