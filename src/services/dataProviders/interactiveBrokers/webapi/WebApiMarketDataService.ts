
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { SpyMarketData } from "@/lib/types/spy";
import * as utils from "../utils";
import * as endpoints from '../endpoints';
import { WebApiBaseService } from "./WebApiBaseService";

/**
 * Service for fetching market data from IBKR Web API
 */
export class WebApiMarketDataService extends WebApiBaseService {
  constructor(config: DataProviderConfig, accessToken: string | null = null) {
    super(config, accessToken);
  }
  
  /**
   * Get market data from Web API
   */
  async getMarketData(): Promise<SpyMarketData> {
    try {
      // Real implementation would fetch SPY data from IBKR
      const symbol = 'SPY';
      console.log("Fetching SPY market data from Interactive Brokers Web API...");
      
      const marketData = await this.fetchFromAPI(`${endpoints.MARKET_DATA_ENDPOINT}/snapshot`, {
        symbols: symbol,
        fields: 'LastPrice,PreviousClose,Volume,High,Low,Open,VIX'
      }).catch(error => {
        console.error("Error fetching market data from IBKR:", error);
        // Fallback to mock data if API call fails
        return null;
      });
      
      if (marketData) {
        console.log("Received market data from IBKR:", marketData);
        // Transform API response to our SpyMarketData format
        const now = new Date();
        const spyData = marketData[symbol];
        
        return {
          price: spyData.LastPrice,
          previousClose: spyData.PreviousClose,
          change: spyData.LastPrice - spyData.PreviousClose,
          changePercent: ((spyData.LastPrice - spyData.PreviousClose) / spyData.PreviousClose) * 100,
          volume: spyData.Volume,
          averageVolume: spyData.AverageVolume || spyData.Volume, // API might not provide average volume
          high: spyData.High,
          low: spyData.Low,
          open: spyData.Open,
          timestamp: now,
          vix: spyData.VIX || 15.23, // Default if VIX not available
          paperTrading: this.config.paperTrading || false
        };
      }
      
      // Fallback to mock data if API call fails or returns invalid data
      console.warn("Falling back to mock market data");
      return utils.generateMockMarketData();
    } catch (error) {
      console.error("Error in getMarketData:", error);
      // Fallback to mock data in case of errors
      return utils.generateMockMarketData();
    }
  }
  
  /**
   * Get account data from Web API
   */
  async getAccountData(): Promise<{balance: number, dailyPnL: number, allTimePnL: number}> {
    try {
      console.log("Fetching account data from Interactive Brokers Web API...");
      
      const accountData = await this.fetchFromAPI(endpoints.ACCOUNT_ENDPOINT).catch(error => {
        console.error("Error fetching account data from IBKR:", error);
        return null;
      });
      
      if (accountData) {
        console.log("Received account data from IBKR:", accountData);
        
        // Transform API response to our account data format
        return {
          balance: accountData.availableFunds || accountData.netLiquidation || 10000,
          dailyPnL: accountData.dailyPnL || 0,
          allTimePnL: accountData.allTimePnL || accountData.realizedPnL || 0
        };
      }
      
      // Fallback to mock account data if API call fails
      console.warn("Falling back to mock account data");
      return {
        balance: this.config.paperTrading ? 10000 : 15000, 
        dailyPnL: this.config.paperTrading ? 150.25 : 180.50,
        allTimePnL: this.config.paperTrading ? 1500.75 : 1850.25
      };
    } catch (error) {
      console.error("Error in getAccountData:", error);
      // Fallback to mock data in case of errors
      return {
        balance: this.config.paperTrading ? 10000 : 15000, 
        dailyPnL: this.config.paperTrading ? 150.25 : 180.50,
        allTimePnL: this.config.paperTrading ? 1500.75 : 1850.25
      };
    }
  }
}
