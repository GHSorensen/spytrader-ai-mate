
import { DataProviderConfig, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { WebApiMarketDataService } from "./WebApiMarketDataService";
import { WebApiOptionsService } from "./WebApiOptionsService";
import { WebApiTradesService } from "./WebApiTradesService";

/**
 * Unified facade for all Web API services
 */
export class WebApiDataService {
  private config: DataProviderConfig;
  private accessToken: string | null = null;
  private marketDataService: WebApiMarketDataService;
  private optionsService: WebApiOptionsService;
  private tradesService: WebApiTradesService;
  
  constructor(config: DataProviderConfig, accessToken: string | null = null) {
    this.config = config;
    this.accessToken = accessToken;
    
    // Initialize all services with the same config and token
    this.marketDataService = new WebApiMarketDataService(config, accessToken);
    this.optionsService = new WebApiOptionsService(config, accessToken);
    this.tradesService = new WebApiTradesService(config, accessToken);
  }
  
  /**
   * Set access token for all services
   */
  setAccessToken(token: string) {
    this.accessToken = token;
    this.marketDataService.setAccessToken(token);
    this.optionsService.setAccessToken(token);
    this.tradesService.setAccessToken(token);
  }
  
  /**
   * Get market data from Web API
   */
  async getMarketData(): Promise<SpyMarketData> {
    return this.marketDataService.getMarketData();
  }
  
  /**
   * Get options from Web API
   */
  async getOptions(): Promise<SpyOption[]> {
    return this.optionsService.getOptions();
  }
  
  /**
   * Get option chain from Web API
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    return this.optionsService.getOptionChain(symbol);
  }
  
  /**
   * Get trades from Web API
   */
  async getTrades(): Promise<SpyTrade[]> {
    return this.tradesService.getTrades();
  }
  
  /**
   * Get account data from Web API
   */
  async getAccountData(): Promise<{balance: number, dailyPnL: number, allTimePnL: number}> {
    return this.marketDataService.getAccountData();
  }
  
  /**
   * Place trade via Web API
   */
  async placeTrade(order: TradeOrder): Promise<any> {
    return this.tradesService.placeTrade(order);
  }
}
