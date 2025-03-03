
import { SpyOption } from "@/lib/types/spy";
import { SchwabService } from "../schwabService";
import { generateMockOptions } from "./utils";

export class SchwabOptionsManager {
  private service: SchwabService;
  
  constructor(service: SchwabService) {
    this.service = service;
  }
  
  /**
   * Get all SPY options from Schwab
   */
  async getOptions(): Promise<SpyOption[]> {
    try {
      if (!this.service.isConnected()) {
        await this.service.connect();
      }

      // In a real implementation, we would call the Schwab API
      console.log("Fetching SPY options from Schwab");
      
      // Return mock data for development
      return generateMockOptions();
    } catch (error) {
      console.error("Schwab options error:", error);
      throw error;
    }
  }
  
  /**
   * Get option chain for a specific symbol
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    try {
      if (!this.service.isConnected()) {
        await this.service.connect();
      }

      console.log(`Fetching ${symbol} option chain from Schwab`);
      
      // For SPY, return all options; for other symbols, we'd make specific requests
      if (symbol.toUpperCase() === 'SPY') {
        return this.getOptions();
      }
      
      // For other symbols, return empty array for now
      return [];
    } catch (error) {
      console.error("Schwab option chain error:", error);
      throw error;
    }
  }
}
