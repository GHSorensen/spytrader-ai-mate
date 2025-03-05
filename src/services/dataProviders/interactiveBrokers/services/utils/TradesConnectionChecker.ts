
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";

/**
 * Utilities for checking connection status in the trades service
 */
export class TradesConnectionChecker {
  /**
   * Check TWS connection before placing trade
   */
  static async checkTwsConnection(twsDataService: any): Promise<boolean> {
    try {
      // For TWS, we can check if the service is instantiated
      const hasConnection = !!twsDataService;
      console.log("[TradesConnectionChecker] TWS connection check:", hasConnection ? "Connected" : "Not connected");
      
      if (!hasConnection) {
        console.error("[TradesConnectionChecker] TWS data service not available - please check TWS configuration");
        return false;
      }
      
      // Add additional TWS connection validation if possible
      return hasConnection;
    } catch (error) {
      console.error("[TradesConnectionChecker] Error checking TWS connection:", error);
      return false;
    }
  }

  /**
   * Check WebAPI connection before placing trade
   */
  static async checkWebApiConnection(webApiDataService: any, config: DataProviderConfig): Promise<boolean> {
    try {
      // For WebAPI, check if we have a service and access token
      const hasService = !!webApiDataService;
      const hasToken = !!config.accessToken;
      
      console.log("[TradesConnectionChecker] WebAPI connection check:", {
        serviceExists: hasService ? "Yes" : "No",
        hasAccessToken: hasToken ? "Yes" : "No",
        tokenPrefix: hasToken ? config.accessToken?.substring(0, 5) + "..." : "N/A"
      });
      
      if (!hasService) {
        console.error("[TradesConnectionChecker] WebAPI service not available - please check your configuration");
        return false;
      }
      
      if (!hasToken) {
        console.error("[TradesConnectionChecker] No access token available - authentication required");
        return false;
      }
      
      return hasService && hasToken;
    } catch (error) {
      console.error("[TradesConnectionChecker] Error checking WebAPI connection:", error);
      return false;
    }
  }
}
