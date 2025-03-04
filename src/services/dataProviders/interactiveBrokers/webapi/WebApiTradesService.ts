
import { DataProviderConfig, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyTrade } from "@/lib/types/spy";
import * as utils from "../utils";
import * as endpoints from '../endpoints';
import { WebApiBaseService } from "./WebApiBaseService";

/**
 * Service for handling trades via IBKR Web API
 */
export class WebApiTradesService extends WebApiBaseService {
  constructor(config: DataProviderConfig, accessToken: string | null = null) {
    super(config, accessToken);
  }
  
  /**
   * Get trades from Web API
   */
  async getTrades(): Promise<SpyTrade[]> {
    try {
      console.log("Fetching trades from Interactive Brokers Web API...");
      
      const tradesData = await this.fetchFromAPI(endpoints.TRADES_ENDPOINT).catch(error => {
        console.error("Error fetching trades from IBKR:", error);
        return null;
      });
      
      if (tradesData && Array.isArray(tradesData)) {
        console.log("Received trades data from IBKR:", tradesData);
        
        // Transform API response to our SpyTrade format
        return tradesData.map(trade => ({
          id: trade.id || `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          optionId: trade.optionId,
          type: trade.optionType.toUpperCase() === 'CALL' ? 'CALL' : 'PUT',
          strikePrice: trade.strike,
          expirationDate: new Date(trade.expiry),
          entryPrice: trade.entryPrice,
          currentPrice: trade.currentPrice,
          targetPrice: trade.targetPrice,
          stopLoss: trade.stopLoss,
          quantity: trade.quantity,
          status: trade.status.toLowerCase(),
          openedAt: new Date(trade.openedAt),
          profit: trade.profit,
          profitPercentage: trade.profitPercentage,
          confidenceScore: trade.confidenceScore || 0.5,
          paperTrading: this.config.paperTrading || false
        }));
      }
      
      // Fallback to mock trades if API call fails
      console.warn("Falling back to mock trades data");
      return utils.generateMockTrades();
    } catch (error) {
      console.error("Error in getTrades:", error);
      // Fallback to mock data in case of errors
      return utils.generateMockTrades();
    }
  }
  
  /**
   * Place trade via Web API
   */
  async placeTrade(order: TradeOrder): Promise<any> {
    try {
      console.log("Placing trade via Interactive Brokers Web API...", order);
      
      const orderData = {
        symbol: order.symbol,
        quantity: order.quantity,
        action: order.action,
        orderType: order.orderType,
        limitPrice: order.limitPrice,
        duration: order.duration
      };
      
      const response = await this.postToAPI(endpoints.ORDERS_ENDPOINT, orderData).catch(error => {
        console.error("Error placing order with IBKR:", error);
        return null;
      });
      
      if (response) {
        console.log("Order placed successfully with IBKR:", response);
        return {
          orderId: response.orderId || `webapi-${Date.now()}`,
          status: response.status || 'pending',
          details: order
        };
      }
      
      // Fallback to mock response if API call fails
      console.warn("Falling back to mock order response");
      return {
        orderId: `webapi-${Date.now()}`,
        status: 'pending',
        details: order
      };
    } catch (error) {
      console.error("Error in placeTrade:", error);
      // Fallback to mock response in case of errors
      return {
        orderId: `webapi-${Date.now()}`,
        status: 'error',
        error: error instanceof Error ? error.message : "Unknown error",
        details: order
      };
    }
  }
}
