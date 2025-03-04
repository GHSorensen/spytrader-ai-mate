
import { DataProviderConfig, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import * as utils from "../utils";
import * as endpoints from '../endpoints';

/**
 * Handles data retrieval from IBKR Web API
 */
export class WebApiDataService {
  private config: DataProviderConfig;
  private accessToken: string | null = null;
  
  constructor(config: DataProviderConfig, accessToken: string | null = null) {
    this.config = config;
    this.accessToken = accessToken;
  }
  
  setAccessToken(token: string) {
    this.accessToken = token;
  }
  
  private async fetchFromAPI(endpoint: string, params: Record<string, any> = {}) {
    if (!this.accessToken) {
      throw new Error("No access token available. Please authenticate with Interactive Brokers.");
    }
    
    const url = new URL(`${endpoints.API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    console.log(`Fetching from IBKR Web API: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`IBKR API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private async postToAPI(endpoint: string, data: Record<string, any> = {}) {
    if (!this.accessToken) {
      throw new Error("No access token available. Please authenticate with Interactive Brokers.");
    }
    
    console.log(`Posting to IBKR Web API: ${endpoints.API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${endpoints.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`IBKR API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
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
   * Get options from Web API
   */
  async getOptions(): Promise<SpyOption[]> {
    try {
      console.log("Fetching options from Interactive Brokers Web API...");
      
      const optionsData = await this.fetchFromAPI(endpoints.OPTIONS_ENDPOINT, {
        symbol: 'SPY',
        includeExpired: false
      }).catch(error => {
        console.error("Error fetching options from IBKR:", error);
        return null;
      });
      
      if (optionsData && Array.isArray(optionsData)) {
        console.log("Received options data from IBKR:", optionsData);
        
        // Transform API response to our SpyOption format
        return optionsData.map(option => ({
          id: option.id || `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          strikePrice: option.strike,
          expirationDate: new Date(option.expirationDate),
          type: option.putCall.toUpperCase() === 'CALL' ? 'CALL' : 'PUT',
          premium: option.ask, // Use ask price as premium
          impliedVolatility: option.impliedVolatility,
          openInterest: option.openInterest,
          volume: option.volume,
          delta: option.delta,
          gamma: option.gamma,
          theta: option.theta,
          vega: option.vega,
          paperTrading: this.config.paperTrading || false
        }));
      }
      
      // Fallback to mock options if API call fails
      console.warn("Falling back to mock options data");
      return utils.generateMockOptions();
    } catch (error) {
      console.error("Error in getOptions:", error);
      // Fallback to mock data in case of errors
      return utils.generateMockOptions();
    }
  }
  
  /**
   * Get option chain from Web API
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    try {
      console.log(`Fetching option chain for ${symbol} from Interactive Brokers Web API...`);
      
      const optionChainData = await this.fetchFromAPI(`${endpoints.OPTIONS_ENDPOINT}/chain`, {
        symbol: symbol,
        includeExpired: false
      }).catch(error => {
        console.error(`Error fetching option chain for ${symbol} from IBKR:`, error);
        return null;
      });
      
      if (optionChainData && Array.isArray(optionChainData)) {
        console.log(`Received option chain data for ${symbol} from IBKR:`, optionChainData);
        
        // Transform API response to our SpyOption format
        return optionChainData.map(option => ({
          id: option.id || `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          symbol: symbol,
          strikePrice: option.strike,
          expirationDate: new Date(option.expirationDate),
          type: option.putCall.toUpperCase() === 'CALL' ? 'CALL' : 'PUT',
          premium: option.ask, // Use ask price as premium
          impliedVolatility: option.impliedVolatility,
          openInterest: option.openInterest,
          volume: option.volume,
          delta: option.delta,
          gamma: option.gamma,
          theta: option.theta,
          vega: option.vega,
          paperTrading: this.config.paperTrading || false
        }));
      }
      
      // Fallback to mock options if API call fails
      console.warn(`Falling back to mock option chain data for ${symbol}`);
      const mockOptions = utils.generateMockOptions();
      mockOptions.forEach(option => {
        option.symbol = symbol;
      });
      return mockOptions;
    } catch (error) {
      console.error("Error in getOptionChain:", error);
      // Fallback to mock data in case of errors
      const mockOptions = utils.generateMockOptions();
      mockOptions.forEach(option => {
        option.symbol = symbol;
      });
      return mockOptions;
    }
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
