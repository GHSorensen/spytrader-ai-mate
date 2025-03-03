
import { SpyMarketData } from "@/lib/types/spy";
import { SchwabService } from "../schwabService";
import { generateMockMarketData } from "../tdAmeritrade/utils";

export class SchwabMarketDataManager {
  private service: SchwabService;
  
  constructor(service: SchwabService) {
    this.service = service;
  }
  
  /**
   * Get SPY market data from Schwab
   */
  async getMarketData(): Promise<SpyMarketData> {
    try {
      if (!this.service.isConnected()) {
        await this.service.connect();
      }

      // In a real implementation, we would call the Schwab API
      console.log("Fetching SPY market data from Schwab");
      
      // Return mock data for development using the shared utility function
      return generateMockMarketData();
    } catch (error) {
      console.error("Schwab market data error:", error);
      throw error;
    }
  }
}
