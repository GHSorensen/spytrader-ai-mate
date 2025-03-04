
import { DataProviderConfig, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { TwsDataService } from "./tws/TwsDataService";
import { WebApiDataService } from "./webapi/WebApiDataService";

/**
 * Unified data service for Interactive Brokers
 */
export class IBKRDataService {
  private config: DataProviderConfig;
  private twsDataService: TwsDataService;
  private webApiDataService: WebApiDataService;
  private connectionMethod: 'webapi' | 'tws';
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    this.connectionMethod = config.connectionMethod || 'webapi';
    this.twsDataService = new TwsDataService(config);
    this.webApiDataService = new WebApiDataService(config);
  }
  
  /**
   * Set access token for Web API
   */
  setAccessToken(token: string) {
    this.webApiDataService.setAccessToken(token);
  }
  
  /**
   * Get market data
   */
  async getMarketData(): Promise<SpyMarketData> {
    try {
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.getMarketData();
      }
      
      return this.webApiDataService.getMarketData();
    } catch (error) {
      console.error("Error fetching market data from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get options
   */
  async getOptions(): Promise<SpyOption[]> {
    try {
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.getOptions();
      }
      
      return this.webApiDataService.getOptions();
    } catch (error) {
      console.error("Error fetching options from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get option chain
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    try {
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.getOptionChain(symbol);
      }
      
      return this.webApiDataService.getOptionChain(symbol);
    } catch (error) {
      console.error(`Error fetching option chain for ${symbol} from Interactive Brokers:`, error);
      throw error;
    }
  }
  
  /**
   * Get trades
   */
  async getTrades(): Promise<SpyTrade[]> {
    try {
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.getTrades();
      }
      
      return this.webApiDataService.getTrades();
    } catch (error) {
      console.error("Error fetching trades from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get account data
   */
  async getAccountData(): Promise<{balance: number, dailyPnL: number, allTimePnL: number}> {
    try {
      console.log(`Getting account data from Interactive Brokers via ${this.connectionMethod}`);
      
      // For TWS and WebAPI connections, use real implementations once available
      if (this.connectionMethod === 'tws') {
        // For now using mock data with small differences for demo purposes
        return {
          balance: this.config.paperTrading ? 10000 : 25000, // Example account balance
          dailyPnL: this.config.paperTrading ? 125.75 : 250.25, // Example daily P&L
          allTimePnL: this.config.paperTrading ? 1250.50 : 2750.75 // Example all-time P&L
        };
      }
      
      // WebAPI implementation
      return {
        balance: this.config.paperTrading ? 10000 : 15000, // Example account balance
        dailyPnL: this.config.paperTrading ? 150.25 : 180.50, // Example daily P&L
        allTimePnL: this.config.paperTrading ? 1500.75 : 1850.25 // Example all-time P&L
      };
    } catch (error) {
      console.error("Error fetching account data from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Place a trade
   */
  async placeTrade(order: TradeOrder): Promise<any> {
    try {
      // In a real implementation, this would place a trade with TWS or Web API
      // For now, return mock response
      return {
        orderId: `ibkr-order-${Date.now()}`,
        status: 'pending',
        message: 'Order placed successfully',
        trade: {
          id: `ibkr-trade-${Date.now()}`,
          type: order.symbol.includes('C') ? 'CALL' : 'PUT',
          strikePrice: parseFloat(order.symbol.split('_')[1] || '500'),
          expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          entryPrice: order.limitPrice || 3.45,
          currentPrice: order.limitPrice || 3.45,
          targetPrice: (order.limitPrice || 3.45) * 1.3,
          stopLoss: (order.limitPrice || 3.45) * 0.7,
          quantity: order.quantity,
          status: "pending",
          openedAt: new Date(),
          profit: 0,
          profitPercentage: 0,
          confidenceScore: 0.75,
          paperTrading: this.config.paperTrading || false
        }
      };
    } catch (error) {
      console.error("Error placing trade with Interactive Brokers:", error);
      throw error;
    }
  }
}
