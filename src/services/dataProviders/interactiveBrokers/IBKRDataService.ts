
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
      console.log(`Getting market data from IBKR via ${this.connectionMethod}`);
      
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
      
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.getAccountData();
      }
      
      return this.webApiDataService.getAccountData();
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
      console.log(`Placing trade with Interactive Brokers via ${this.connectionMethod}`);
      
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.placeTrade(order);
      }
      
      return this.webApiDataService.placeTrade(order);
    } catch (error) {
      console.error("Error placing trade with Interactive Brokers:", error);
      throw error;
    }
  }
}
