import { DataProviderConfig, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyTrade } from "@/lib/types/spy";
import { TwsDataService } from "../tws/TwsDataService";
import { WebApiDataService } from "../webapi/WebApiDataService";
import { toast } from "sonner";

/**
 * Service for handling trades data from Interactive Brokers
 */
export class IBKRTradesService {
  private config: DataProviderConfig;
  private twsDataService: TwsDataService;
  private webApiDataService: WebApiDataService;
  private connectionMethod: 'webapi' | 'tws';
  private connectionState: {
    authInitiated: boolean;
    authComplete: boolean;
    lastAuthAttempt: Date | null;
    authErrors: string[];
    connectionHistory: Array<{
      timestamp: Date;
      action: string;
      result: boolean;
      details?: string;
    }>;
  };
  
  constructor(
    config: DataProviderConfig,
    twsDataService: TwsDataService,
    webApiDataService: WebApiDataService
  ) {
    this.config = config;
    this.connectionMethod = config.connectionMethod || 'webapi';
    this.twsDataService = twsDataService;
    this.webApiDataService = webApiDataService;
    
    // Initialize connection state tracking
    this.connectionState = {
      authInitiated: false,
      authComplete: false,
      lastAuthAttempt: null,
      authErrors: [],
      connectionHistory: []
    };
    
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
    
    // Log connection details at startup for debugging
    this.logConnectionDetails();
  }
  
  /**
   * Log detailed connection information for debugging
   * @private
   */
  private logConnectionDetails(): void {
    try {
      console.log("[IBKRTradesService] Connection details:");
      
      // Log token status if available
      if (this.config.accessToken) {
        console.log("[IBKRTradesService] Access token:", 
          this.config.accessToken.substring(0, 5) + "..." + 
          (this.config.accessToken.length > 10 ? this.config.accessToken.substring(this.config.accessToken.length - 5) : ""));
        
        if (this.config.expiresAt) {
          const expiryDate = new Date(this.config.expiresAt);
          const now = new Date();
          console.log("[IBKRTradesService] Token expires at:", expiryDate.toISOString());
          console.log("[IBKRTradesService] Token expired:", expiryDate < now ? "Yes" : "No");
          console.log("[IBKRTradesService] Time until expiry:", 
            expiryDate > now ? 
            Math.floor((expiryDate.getTime() - now.getTime()) / 1000 / 60) + " minutes" : 
            "Expired " + Math.floor((now.getTime() - expiryDate.getTime()) / 1000 / 60) + " minutes ago");
        } else {
          console.log("[IBKRTradesService] Token expiry information not available");
        }
      } else {
        console.log("[IBKRTradesService] No access token available");
      }
      
      // Check token source if we have one
      this.checkTokenSource();
      
      // Log browser details for context
      console.log("[IBKRTradesService] Browser environment:", {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: new Date().toISOString()
      });
    } catch (error) {
      console.error("[IBKRTradesService] Error logging connection details:", error);
    }
  }
  
  /**
   * Check where the token came from
   */
  private checkTokenSource(): void {
    // Check if token is in localStorage
    try {
      const savedToken = localStorage.getItem('ibkr-token');
      console.log("[IBKRTradesService] Token in localStorage:", !!savedToken);
      
      if (savedToken) {
        try {
          const tokenData = JSON.parse(savedToken);
          console.log("[IBKRTradesService] Saved token info:", {
            hasAccessToken: !!tokenData.accessToken,
            hasRefreshToken: !!tokenData.refreshToken,
            tokenPrefix: tokenData.accessToken ? tokenData.accessToken.substring(0, 5) + "..." : "N/A",
            expires: tokenData.expires ? new Date(tokenData.expires).toISOString() : "unknown",
            isExpired: tokenData.expires ? new Date(tokenData.expires) < new Date() : "unknown"
          });
          
          // Compare with current token
          if (this.config.accessToken && tokenData.accessToken) {
            console.log("[IBKRTradesService] Current token matches saved token:", 
              this.config.accessToken === tokenData.accessToken ? "Yes" : "No");
          }
        } catch (e) {
          console.error("[IBKRTradesService] Error parsing saved token:", e);
        }
      }
    } catch (e) {
      console.error("[IBKRTradesService] Error checking localStorage:", e);
    }
  }
  
  /**
   * Record connection event for history tracking
   * @private
   */
  private recordConnectionEvent(action: string, result: boolean, details?: string): void {
    this.connectionState.connectionHistory.push({
      timestamp: new Date(),
      action,
      result,
      details
    });
    
    // Keep only the last 20 events to avoid memory bloat
    if (this.connectionState.connectionHistory.length > 20) {
      this.connectionState.connectionHistory.shift();
    }
    
    // Log the event
    console.log(`[IBKRTradesService] Connection event: ${action} - ${result ? 'Success' : 'Failure'}${details ? ' - ' + details : ''}`);
  }
  
  /**
   * Get connection history for debugging
   */
  getConnectionHistory(): any {
    return {
      currentState: {
        authInitiated: this.connectionState.authInitiated,
        authComplete: this.connectionState.authComplete,
        lastAuthAttempt: this.connectionState.lastAuthAttempt,
        authErrors: this.connectionState.authErrors
      },
      history: this.connectionState.connectionHistory,
      configuration: {
        connectionMethod: this.connectionMethod,
        paperTrading: this.config.paperTrading,
        hasToken: !!this.config.accessToken,
        configuredEndpoints: {
          webapi: !!this.config.apiKey && !!this.config.callbackUrl,
          tws: !!this.config.twsHost && !!this.config.twsPort
        }
      }
    };
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
          this.connectionState.authErrors.push("Missing API key");
        }
        
        if (!this.config.callbackUrl) {
          console.error("[IBKRTradesService] Configuration error: No callback URL provided for WebAPI");
          this.connectionState.authErrors.push("Missing callback URL");
        }
        
        // Check token status
        if (!this.config.accessToken && !this.config.refreshToken) {
          console.error("[IBKRTradesService] Authentication error: No access token or refresh token available. Authentication required.");
          this.connectionState.authErrors.push("No tokens available");
        } else if (!this.config.accessToken) {
          console.warn("[IBKRTradesService] Authentication warning: No access token, but refresh token is available. Token refresh might be needed.");
        }
        
        // Validate WebAPI service
        if (!this.webApiDataService) {
          console.error("[IBKRTradesService] Service error: WebAPI data service not initialized");
          this.connectionState.authErrors.push("WebAPI service not initialized");
        }
      } else {
        // Check TWS required settings
        if (!this.config.twsHost) {
          console.error("[IBKRTradesService] Configuration error: No TWS host provided");
          this.connectionState.authErrors.push("Missing TWS host");
        }
        
        if (!this.config.twsPort) {
          console.error("[IBKRTradesService] Configuration error: No TWS port provided");
          this.connectionState.authErrors.push("Missing TWS port");
        }
        
        // Verify expected port based on paper trading status
        const expectedPort = this.config.paperTrading ? '7497' : '7496';
        if (this.config.twsPort !== expectedPort) {
          console.warn(`[IBKRTradesService] TWS port warning: Using port ${this.config.twsPort}, but ${expectedPort} is expected for ${this.config.paperTrading ? 'paper' : 'live'} trading`);
        }
        
        // Validate TWS service
        if (!this.twsDataService) {
          console.error("[IBKRTradesService] Service error: TWS data service not initialized");
          this.connectionState.authErrors.push("TWS service not initialized");
        }
      }
      
      console.log("[IBKRTradesService] Configuration validation complete");
      
      // Record validation status
      this.recordConnectionEvent(
        "configuration validation", 
        this.connectionState.authErrors.length === 0,
        this.connectionState.authErrors.length > 0 ? 
          `Found ${this.connectionState.authErrors.length} issues` : 
          "No issues found"
      );
    } catch (error) {
      console.error("[IBKRTradesService] Error validating configuration:", error);
      this.recordConnectionEvent(
        "configuration validation", 
        false,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  
  /**
   * Attempt to fix token issues by refreshing
   */
  async refreshTokenIfNeeded(): Promise<boolean> {
    // Only applicable for WebAPI
    if (this.connectionMethod !== 'webapi' || !this.config.refreshToken) {
      return false;
    }
    
    try {
      console.log("[IBKRTradesService] Attempting to refresh token...");
      this.recordConnectionEvent("token refresh attempt", true);
      
      // In a real implementation, this would call the refresh token API
      // For now, we'll just simulate a refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check localStorage for any saved token
      const savedToken = localStorage.getItem('ibkr-token');
      if (savedToken) {
        try {
          const tokenData = JSON.parse(savedToken);
          if (tokenData.accessToken) {
            console.log("[IBKRTradesService] Found saved token, using it");
            this.config.accessToken = tokenData.accessToken;
            this.recordConnectionEvent("token refresh", true, "Used saved token");
            return true;
          }
        } catch (e) {
          console.error("[IBKRTradesService] Error parsing saved token:", e);
        }
      }
      
      // Show notification - token needs manual refresh
      toast.error("Authentication Required", {
        description: "Your IBKR token has expired. Please reconnect to IBKR.",
      });
      
      this.recordConnectionEvent("token refresh", false, "Manual refresh required");
      return false;
    } catch (error) {
      console.error("[IBKRTradesService] Error refreshing token:", error);
      this.recordConnectionEvent("token refresh", false, error instanceof Error ? error.message : "Unknown error");
      return false;
    }
  }
  
  /**
   * Get trades
   */
  async getTrades(): Promise<SpyTrade[]> {
    try {
      console.log(`[IBKRTradesService] Getting trades from IBKR via ${this.connectionMethod}`);
      this.recordConnectionEvent("get trades request", true);
      
      // Check authentication status before proceeding
      if (this.connectionMethod === 'webapi' && !this.config.accessToken) {
        console.error("[IBKRTradesService] Cannot get trades: No access token available. Please authenticate with IBKR first.");
        this.recordConnectionEvent("get trades auth check", false, "No access token");
        
        // Try to refresh the token
        const refreshed = await this.refreshTokenIfNeeded();
        if (!refreshed) {
          throw new Error("Authentication required: No access token available");
        }
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
      
      // Record success
      this.recordConnectionEvent("get trades", true, `Retrieved ${trades.length} trades`);
      
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
      
      // Record failure
      this.recordConnectionEvent("get trades", false, error instanceof Error ? error.message : "Unknown error");
      
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
      
      this.recordConnectionEvent("place trade request", true, `${order.action} ${order.quantity} ${order.symbol}`);
      
      // Check authentication status before proceeding
      if (this.connectionMethod === 'webapi' && !this.config.accessToken) {
        console.error("[IBKRTradesService] Cannot place trade: No access token available. Please authenticate with IBKR first.");
        this.recordConnectionEvent("place trade auth check", false, "No access token");
        
        // Try to refresh the token
        const refreshed = await this.refreshTokenIfNeeded();
        if (!refreshed) {
          throw new Error("Authentication required: No access token available");
        }
      }
      
      // Check connection status before attempting trade
      console.log("[IBKRTradesService] Checking connection before placing trade");
      const isConnected = this.connectionMethod === 'tws' 
        ? await this.checkTwsConnection()
        : await this.checkWebApiConnection();
        
      if (!isConnected) {
        console.error("[IBKRTradesService] Not connected to IBKR - trade will likely fail");
        this.recordConnectionEvent("connection check", false, "Not connected");
      } else {
        this.recordConnectionEvent("connection check", true);
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
      
      // Record success
      this.recordConnectionEvent("place trade", true, `Order ${result?.orderId || 'unknown'}`);
      
      return result;
    } catch (error) {
      console.error("[IBKRTradesService] Error placing trade with Interactive Brokers:", error);
      console.error("[IBKRTradesService] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      
      // Record failure
      this.recordConnectionEvent("place trade", false, error instanceof Error ? error.message : "Unknown error");
      
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
