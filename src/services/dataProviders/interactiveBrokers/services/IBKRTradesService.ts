
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
      hasCallbackUrl: !!config.callbackUrl,
      hasAccessToken: !!config.accessToken,
      hasRefreshToken: !!config.refreshToken
    }, null, 2));
    
    // Validate configuration immediately
    this.validateConfiguration();
  }
  
  /**
   * Validate the service configuration
   * @private
   */
  private validateConfiguration(): void {
    try {
      console.log("[IBKRTradesService] Validating configuration...");
      
      if (this.connectionMethod === 'webapi') {
        // Check WebAPI required credentials
        if (!this.config.apiKey) {
          console.error("[IBKRTradesService] Configuration error: No API key provided for WebAPI");
        }
        
        if (!this.config.callbackUrl) {
          console.error("[IBKRTradesService] Configuration error: No callback URL provided for WebAPI");
        }
        
        // Check token status
        if (!this.config.accessToken && !this.config.refreshToken) {
          console.error("[IBKRTradesService] Authentication error: No access token or refresh token available. Authentication required.");
        } else if (!this.config.accessToken) {
          console.warn("[IBKRTradesService] Authentication warning: No access token, but refresh token is available. Token refresh might be needed.");
        }
        
        // Validate WebAPI service
        if (!this.webApiDataService) {
          console.error("[IBKRTradesService] Service error: WebAPI data service not initialized");
        }
      } else {
        // Check TWS required settings
        if (!this.config.twsHost) {
          console.error("[IBKRTradesService] Configuration error: No TWS host provided");
        }
        
        if (!this.config.twsPort) {
          console.error("[IBKRTradesService] Configuration error: No TWS port provided");
        }
        
        // Verify expected port based on paper trading status
        const expectedPort = this.config.paperTrading ? '7497' : '7496';
        if (this.config.twsPort !== expectedPort) {
          console.warn(`[IBKRTradesService] TWS port warning: Using port ${this.config.twsPort}, but ${expectedPort} is expected for ${this.config.paperTrading ? 'paper' : 'live'} trading`);
        }
        
        // Validate TWS service
        if (!this.twsDataService) {
          console.error("[IBKRTradesService] Service error: TWS data service not initialized");
        }
      }
      
      console.log("[IBKRTradesService] Configuration validation complete");
    } catch (error) {
      console.error("[IBKRTradesService] Error validating configuration:", error);
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
      
      // Enhanced error logging
      if (error instanceof Error) {
        if (error.message.includes("Authentication") || error.message.includes("token")) {
          console.error("[IBKRTradesService] This appears to be an authentication error. Please check your IBKR credentials and connection status.");
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          console.error("[IBKRTradesService] This appears to be a network error. Please check your internet connection and IBKR service status.");
        }
      }
      
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
      
      // Enhanced error logging
      if (error instanceof Error) {
        if (error.message.includes("Authentication") || error.message.includes("token")) {
          console.error("[IBKRTradesService] This appears to be an authentication error. Please check your IBKR credentials and connection status.");
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          console.error("[IBKRTradesService] This appears to be a network error. Please check your internet connection and IBKR service status.");
        }
      }
      
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
      
      if (!hasConnection) {
        console.error("[IBKRTradesService] TWS data service not available - please check TWS configuration");
        return false;
      }
      
      // Add additional TWS connection validation if possible
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
      // For WebAPI, check if we have a service and access token
      const hasService = !!this.webApiDataService;
      const hasToken = !!this.config.accessToken;
      
      console.log("[IBKRTradesService] WebAPI connection check:", {
        serviceExists: hasService ? "Yes" : "No",
        hasAccessToken: hasToken ? "Yes" : "No",
        tokenPrefix: hasToken ? this.config.accessToken?.substring(0, 5) + "..." : "N/A"
      });
      
      if (!hasService) {
        console.error("[IBKRTradesService] WebAPI service not available - please check your configuration");
        return false;
      }
      
      if (!hasToken) {
        console.error("[IBKRTradesService] No access token available - authentication required");
        return false;
      }
      
      return hasService && hasToken;
    } catch (error) {
      console.error("[IBKRTradesService] Error checking WebAPI connection:", error);
      return false;
    }
  }
}
