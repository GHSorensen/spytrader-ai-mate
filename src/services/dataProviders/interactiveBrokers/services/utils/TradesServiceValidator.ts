
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";

/**
 * Validates configurations for the IBKRTradesService
 */
export class TradesServiceValidator {
  /**
   * Validate the service configuration
   */
  static validateConfiguration(config: DataProviderConfig, connectionMethod: 'webapi' | 'tws'): void {
    try {
      console.log("[TradesServiceValidator] Validating configuration...");
      
      if (connectionMethod === 'webapi') {
        // Check WebAPI required credentials
        if (!config.apiKey) {
          console.error("[TradesServiceValidator] Configuration error: No API key provided for WebAPI");
        }
        
        if (!config.callbackUrl) {
          console.error("[TradesServiceValidator] Configuration error: No callback URL provided for WebAPI");
        }
        
        // Check token status
        if (!config.accessToken && !config.refreshToken) {
          console.error("[TradesServiceValidator] Authentication error: No access token or refresh token available. Authentication required.");
        } else if (!config.accessToken) {
          console.warn("[TradesServiceValidator] Authentication warning: No access token, but refresh token is available. Token refresh might be needed.");
        }
      } else {
        // Check TWS required settings
        if (!config.twsHost) {
          console.error("[TradesServiceValidator] Configuration error: No TWS host provided");
        }
        
        if (!config.twsPort) {
          console.error("[TradesServiceValidator] Configuration error: No TWS port provided");
        }
        
        // Verify expected port based on paper trading status
        const expectedPort = config.paperTrading ? '7497' : '7496';
        if (config.twsPort !== expectedPort) {
          console.warn(`[TradesServiceValidator] TWS port warning: Using port ${config.twsPort}, but ${expectedPort} is expected for ${config.paperTrading ? 'paper' : 'live'} trading`);
        }
      }
      
      console.log("[TradesServiceValidator] Configuration validation complete");
    } catch (error) {
      console.error("[TradesServiceValidator] Error validating configuration:", error);
    }
  }

  /**
   * Validate WebAPI data service
   */
  static validateWebApiService(webApiDataService: any): boolean {
    if (!webApiDataService) {
      console.error("[TradesServiceValidator] Service error: WebAPI data service not initialized");
      return false;
    }
    return true;
  }

  /**
   * Validate TWS data service
   */
  static validateTwsService(twsDataService: any): boolean {
    if (!twsDataService) {
      console.error("[TradesServiceValidator] Service error: TWS data service not initialized");
      return false;
    }
    return true;
  }
}
