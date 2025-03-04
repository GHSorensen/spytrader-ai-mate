
import { DataProviderConfig, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyTrade } from "@/lib/types/spy";
import { TwsDataService } from "../tws/TwsDataService";
import { WebApiDataService } from "../webapi/WebApiDataService";

/**
 * Service for handling trades data from Interactive Brokers
 */
export class IBKRTradesService {
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
    console.log("[IBKRTradesService] Initialized with method:", this.connectionMethod);
  }
  
  /**
   * Get trades
   */
  async getTrades(): Promise<SpyTrade[]> {
    try {
      console.log(`[IBKRTradesService] Getting trades from IBKR via ${this.connectionMethod}`);
      
      let trades: SpyTrade[];
      const startTime = Date.now();
      
      if (this.connectionMethod === 'tws') {
        console.log(`[IBKRTradesService] Calling TWS getTrades()`);
        trades = await this.twsDataService.getTrades();
      } else {
        console.log(`[IBKRTradesService] Calling WebAPI getTrades()`);
        trades = await this.webApiDataService.getTrades();
      }
      
      const endTime = Date.now();
      console.log(`[IBKRTradesService] Trades fetch took ${endTime - startTime}ms`);
      console.log(`[IBKRTradesService] Received ${trades.length} trades`);
      
      return trades;
    } catch (error) {
      console.error("[IBKRTradesService] Error fetching trades from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Place a trade
   */
  async placeTrade(order: TradeOrder): Promise<any> {
    try {
      console.log(`[IBKRTradesService] Placing trade with Interactive Brokers via ${this.connectionMethod}`);
      console.log(`[IBKRTradesService] Order details:`, JSON.stringify(order, null, 2));
      console.log(`[IBKRTradesService] Paper trading mode: ${this.config.paperTrading ? 'Yes' : 'No'}`);
      
      let result;
      const startTime = Date.now();
      
      if (this.connectionMethod === 'tws') {
        console.log(`[IBKRTradesService] Calling TWS placeTrade()`);
        result = await this.twsDataService.placeTrade(order);
      } else {
        console.log(`[IBKRTradesService] Calling WebAPI placeTrade()`);
        result = await this.webApiDataService.placeTrade(order);
      }
      
      const endTime = Date.now();
      console.log(`[IBKRTradesService] Trade execution took ${endTime - startTime}ms`);
      console.log(`[IBKRTradesService] Trade result:`, JSON.stringify(result, null, 2));
      
      return result;
    } catch (error) {
      console.error("[IBKRTradesService] Error placing trade with Interactive Brokers:", error);
      throw error;
    }
  }
}
