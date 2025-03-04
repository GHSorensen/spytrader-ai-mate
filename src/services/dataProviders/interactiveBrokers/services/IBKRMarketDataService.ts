
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
    console.log("[IBKRMarketDataService] Initialized with method:", this.connectionMethod);
  }
  
  /**
   * Get market data
   */
  async getMarketData(): Promise<SpyMarketData> {
    try {
      console.log(`[IBKRMarketDataService] Getting market data from IBKR via ${this.connectionMethod}`);
      console.log(`[IBKRMarketDataService] Paper trading mode: ${this.config.paperTrading ? 'Yes' : 'No'}`);
      
      let marketData: SpyMarketData;
      const startTime = Date.now();
      
      if (this.connectionMethod === 'tws') {
        console.log(`[IBKRMarketDataService] Calling TWS getMarketData()`);
        marketData = await this.twsDataService.getMarketData();
      } else {
        console.log(`[IBKRMarketDataService] Calling WebAPI getMarketData()`);
        marketData = await this.webApiDataService.getMarketData();
      }
      
      const endTime = Date.now();
      console.log(`[IBKRMarketDataService] Market data fetch took ${endTime - startTime}ms`);
      console.log(`[IBKRMarketDataService] Received market data:`, JSON.stringify(marketData, null, 2));
      
      return marketData;
    } catch (error) {
      console.error("[IBKRMarketDataService] Error fetching market data from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get account data
   */
  async getAccountData(): Promise<{balance: number, dailyPnL: number, allTimePnL: number}> {
    try {
      console.log(`[IBKRMarketDataService] Getting account data from Interactive Brokers via ${this.connectionMethod}`);
      
      let accountData;
      const startTime = Date.now();
      
      if (this.connectionMethod === 'tws') {
        console.log(`[IBKRMarketDataService] Calling TWS getAccountData()`);
        accountData = await this.twsDataService.getAccountData();
      } else {
        console.log(`[IBKRMarketDataService] Calling WebAPI getAccountData()`);
        accountData = await this.webApiDataService.getAccountData();
      }
      
      const endTime = Date.now();
      console.log(`[IBKRMarketDataService] Account data fetch took ${endTime - startTime}ms`);
      console.log(`[IBKRMarketDataService] Received account data:`, JSON.stringify(accountData, null, 2));
      
      return accountData;
    } catch (error) {
      console.error("[IBKRMarketDataService] Error fetching account data from Interactive Brokers:", error);
      throw error;
    }
  }
}
