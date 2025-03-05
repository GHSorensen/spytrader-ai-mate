
import { DataProviderConfig, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyTrade } from "@/lib/types/spy";
import { TwsDataService } from "../tws/TwsDataService";
import { WebApiDataService } from "../webapi/WebApiDataService";
import { TradesServiceValidator } from "./utils/TradesServiceValidator";
import { TradesConnectionChecker } from "./utils/TradesConnectionChecker";
import { TradesLogger } from "./utils/TradesLogger";

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
      hasCallbackUrl: !!config.callbackUrl,
      hasAccessToken: !!config.accessToken,
      hasRefreshToken: !!config.refreshToken
    }, null, 2));
    
    // Validate configuration immediately
    TradesServiceValidator.validateConfiguration(config, this.connectionMethod);
    
    // Validate services
    if (this.connectionMethod === 'webapi') {
      TradesServiceValidator.validateWebApiService(this.webApiDataService);
    } else {
      TradesServiceValidator.validateTwsService(this.twsDataService);
    }
  }
  
  /**
   * Get trades
   */
  async getTrades(): Promise<SpyTrade[]> {
    try {
      console.log(`[IBKRTradesService] Getting trades from IBKR via ${this.connectionMethod}`);
      
      // Check authentication status before proceeding
      if (this.connectionMethod === 'webapi' && !this.config.accessToken) {
        console.error("[IBKRTradesService] Cannot get trades: No access token available. Please authenticate with IBKR first.");
        throw new Error("Authentication required: No access token available");
      }
      
      let trades: SpyTrade[];
      const startTime = Date.now();
      
      if (this.connectionMethod === 'tws') {
        console.log(`[IBKRTradesService] Calling TWS getTrades()`);
        trades = await this.twsDataService.getTrades();
      } else {
        console.log(`[IBKRTradesService] Calling WebAPI getTrades()`);
        trades = await this.webApiDataService.getTrades();
      }
      
      TradesLogger.logTradesFetch(trades, startTime);
      return trades;
    } catch (error) {
      TradesLogger.logError("fetching trades", error);
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
      
      // Check authentication status before proceeding
      if (this.connectionMethod === 'webapi' && !this.config.accessToken) {
        console.error("[IBKRTradesService] Cannot place trade: No access token available. Please authenticate with IBKR first.");
        throw new Error("Authentication required: No access token available");
      }
      
      // Check connection status before attempting trade
      console.log("[IBKRTradesService] Checking connection before placing trade");
      const isConnected = this.connectionMethod === 'tws' 
        ? await TradesConnectionChecker.checkTwsConnection(this.twsDataService)
        : await TradesConnectionChecker.checkWebApiConnection(this.webApiDataService, this.config);
        
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
      
      TradesLogger.logTradeExecution(result, startTime);
      return result;
    } catch (error) {
      TradesLogger.logError("placing trade", error);
      throw error;
    }
  }
}
