
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { SpyMarketData } from "@/lib/types/spy";
import { TwsDataService } from "../tws/TwsDataService";
import { WebApiDataService } from "../webapi/WebApiDataService";

/**
 * Service for handling market data from Interactive Brokers
 */
export class IBKRMarketDataService {
  private config: DataProviderConfig;
  private twsDataService: TwsDataService;
  private webApiDataService: WebApiDataService;
  private connectionMethod: 'webapi' | 'tws';
  
  constructor(
    config: DataProviderConfig,
    twsDataService: TwsDataService,
    webApiDataService: WebApiDataService
  ) {
    this.config = config;
    this.connectionMethod = config.connectionMethod || 'webapi';
    this.twsDataService = twsDataService;
    this.webApiDataService = webApiDataService;
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
}
