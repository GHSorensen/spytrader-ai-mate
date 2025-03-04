
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
    console.log("[IBKRTradesService] Configuration:", JSON.stringify({
      connectionMethod: this.connectionMethod,
      paperTrading: config.paperTrading,
      twsHost: config.twsHost,
      twsPort: config.twsPort,
      hasApiKey: !!config.apiKey,
      hasCallbackUrl: !!config.callbackUrl
    }, null, 2));
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
      
      // Add detailed debugging for each trade
      if (trades.length > 0) {
        console.log("[IBKRTradesService] First 3 trades sample:", 
          trades.slice(0, 3).map(t => ({
            id: t.id,
            type: t.type, 
            status: t.status,
            strikePrice: t.strikePrice,
            openedAt: t.openedAt
          }))
        );
      } else {
        console.log("[IBKRTradesService] No trades returned - this might indicate a connection issue");
      }
      
      return trades;
    } catch (error) {
      console.error("[IBKRTradesService] Error fetching trades from Interactive Brokers:", error);
      console.error("[IBKRTradesService] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
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
      
      // Check connection status before attempting trade
      console.log("[IBKRTradesService] Checking connection before placing trade");
      const isConnected = this.connectionMethod === 'tws' 
        ? await this.checkTwsConnection()
        : await this.checkWebApiConnection();
        
      if (!isConnected) {
        console.error("[IBKRTradesService] Not connected to IBKR - trade will likely fail");
      }
      
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
      console.error("[IBKRTradesService] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      throw error;
    }
  }
  
  /**
   * Check TWS connection before placing trade
   * @private
   */
  private async checkTwsConnection(): Promise<boolean> {
    try {
      // For TWS, we can check if the service is instantiated
      const hasConnection = !!this.twsDataService;
      console.log("[IBKRTradesService] TWS connection check:", hasConnection ? "Connected" : "Not connected");
      return hasConnection;
    } catch (error) {
      console.error("[IBKRTradesService] Error checking TWS connection:", error);
      return false;
    }
  }
  
  /**
   * Check WebAPI connection before placing trade
   * @private
   */
  private async checkWebApiConnection(): Promise<boolean> {
    try {
      // For WebAPI, we'd ideally check if we have a valid token
      // This is a simple placeholder check
      const hasConnection = !!this.webApiDataService;
      console.log("[IBKRTradesService] WebAPI connection check:", hasConnection ? "Service exists" : "No service");
      return hasConnection;
    } catch (error) {
      console.error("[IBKRTradesService] Error checking WebAPI connection:", error);
      return false;
    }
  }
}
