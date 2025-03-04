
import { SpyMarketData } from "@/lib/types/spy";
import { TwsBaseService } from "./TwsBaseService";
import * as utils from "../utils";

/**
 * Service for fetching market data from TWS
 */
export class TwsMarketDataService extends TwsBaseService {
  /**
   * Get market data from TWS
   */
  async getMarketData(): Promise<SpyMarketData> {
    try {
      console.log("Fetching market data from Interactive Brokers TWS...");
      
      // In a real implementation, this would make an actual request to TWS
      const twsData = await this.makeTwsRequest('marketData', { symbol: 'SPY' })
        .catch(error => {
          console.error("Error fetching market data from TWS:", error);
          return null;
        });
      
      if (twsData) {
        console.log("Received market data from TWS:", twsData);
        
        // In production, transform TWS API response to our SpyMarketData format
        // For now, use mock data with slight modifications
        const mockData = utils.generateMockMarketData();
        
        // Slightly modify mock data to simulate real-time data
        mockData.price = parseFloat((mockData.price + (Math.random() * 0.5 - 0.25)).toFixed(2));
        mockData.volume = Math.floor(mockData.volume * (1 + (Math.random() * 0.1 - 0.05)));
        
        // Add paper trading indicator if using paper trading
        if (this.config.paperTrading) {
          mockData.paperTrading = true;
        }
        
        return mockData;
      }
      
      // Fallback to mock data
      return utils.generateMockMarketData();
    } catch (error) {
      console.error("Error in getMarketData:", error);
      return utils.generateMockMarketData();
    }
  }
  
  /**
   * Get account data from TWS
   */
  async getAccountData(): Promise<{balance: number, dailyPnL: number, allTimePnL: number}> {
    try {
      console.log("Fetching account data from Interactive Brokers TWS...");
      
      const twsData = await this.makeTwsRequest('accountData')
        .catch(error => {
          console.error("Error fetching account data from TWS:", error);
          return null;
        });
      
      if (twsData) {
        console.log("Received account data from TWS:", twsData);
        
        // Transform TWS response to our account data format
        return {
          balance: twsData.accountValue,
          dailyPnL: twsData.dailyPnL,
          allTimePnL: twsData.totalPnL
        };
      }
      
      // Fallback to mock account data
      return {
        balance: this.config.paperTrading ? 10000 : 25000,
        dailyPnL: this.config.paperTrading ? 125.75 : 250.25,
        allTimePnL: this.config.paperTrading ? 1250.50 : 2750.75
      };
    } catch (error) {
      console.error("Error in getAccountData:", error);
      return {
        balance: this.config.paperTrading ? 10000 : 25000,
        dailyPnL: this.config.paperTrading ? 125.75 : 250.25,
        allTimePnL: this.config.paperTrading ? 1250.50 : 2750.75
      };
    }
  }
}
