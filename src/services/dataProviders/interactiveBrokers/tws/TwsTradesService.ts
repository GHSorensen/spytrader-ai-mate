
import { SpyTrade } from "@/lib/types/spy";
import { TradeOrder } from "@/lib/types/spy/dataProvider";
import { TwsBaseService } from "./TwsBaseService";
import * as utils from "../utils";

/**
 * Service for fetching and placing trades via TWS
 */
export class TwsTradesService extends TwsBaseService {
  /**
   * Get trades from TWS
   */
  async getTrades(): Promise<SpyTrade[]> {
    try {
      console.log("Fetching trades from Interactive Brokers TWS...");
      
      const twsData = await this.makeTwsRequest('trades')
        .catch(error => {
          console.error("Error fetching trades from TWS:", error);
          return null;
        });
      
      if (twsData) {
        console.log("Received trades data from TWS:", twsData);
        
        // In production, transform TWS API response to our SpyTrade format
        // For now, use mock trades with slight modifications
        const trades = utils.generateMockTrades();
        
        // Add paper trading indicator if using paper trading
        if (this.config.paperTrading) {
          trades.forEach(trade => {
            trade.paperTrading = true;
          });
        }
        
        return trades;
      }
      
      // Fallback to mock trades
      return utils.generateMockTrades();
    } catch (error) {
      console.error("Error in getTrades:", error);
      return utils.generateMockTrades();
    }
  }
  
  /**
   * Place trade via TWS
   */
  async placeTrade(order: TradeOrder): Promise<any> {
    try {
      console.log("Placing trade via Interactive Brokers TWS...", order);
      
      // In a real implementation, this would place an actual trade via TWS
      // For now, simulate network delay and return mock response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        orderId: `tws-${Date.now()}`,
        status: 'pending',
        details: order
      };
    } catch (error) {
      console.error("Error in placeTrade:", error);
      return {
        orderId: `tws-error-${Date.now()}`,
        status: 'error',
        error: error instanceof Error ? error.message : "Unknown error placing trade",
        details: order
      };
    }
  }
}
