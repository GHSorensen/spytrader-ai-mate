
import { DataProviderConfig, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { TwsDataService } from "./tws/TwsDataService";
import { WebApiDataService } from "./webapi/WebApiDataService";
import { IBKRMarketDataService } from "./services/IBKRMarketDataService";
import { IBKROptionsService } from "./services/IBKROptionsService";
import { IBKRTradesService } from "./services/IBKRTradesService";
import { IBKRConnectionService } from "./services/IBKRAuthService";

/**
 * Unified data service facade for Interactive Brokers
 */
export class IBKRDataService {
  private config: DataProviderConfig;
  private twsDataService: TwsDataService;
  private webApiDataService: WebApiDataService;
  private connectionMethod: 'webapi' | 'tws';
  
  // Specialized services
  private marketDataService: IBKRMarketDataService;
  private optionsService: IBKROptionsService;
  private tradesService: IBKRTradesService;
  private connectionService: IBKRConnectionService;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    this.connectionMethod = config.connectionMethod || 'webapi';
    
    // Initialize base services
    this.twsDataService = new TwsDataService(config);
    this.webApiDataService = new WebApiDataService(config);
    
    // Initialize specialized services
    this.marketDataService = new IBKRMarketDataService(config, this.twsDataService, this.webApiDataService);
    this.optionsService = new IBKROptionsService(config, this.twsDataService, this.webApiDataService);
    this.tradesService = new IBKRTradesService(config, this.twsDataService, this.webApiDataService);
    this.connectionService = new IBKRConnectionService(config, this.twsDataService, this.webApiDataService);
  }
  
  /**
   * Set access token for Web API
   */
  setAccessToken(token: string) {
    this.connectionService.setAccessToken(token);
  }
  
  /**
   * Connect to IBKR services
   */
  async connect(): Promise<boolean> {
    return this.connectionService.connect();
  }
  
  /**
   * Get market data
   */
  async getMarketData(): Promise<SpyMarketData> {
    return this.marketDataService.getMarketData();
  }
  
  /**
   * Get options
   */
  async getOptions(): Promise<SpyOption[]> {
    return this.optionsService.getOptions();
  }
  
  /**
   * Get option chain
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    return this.optionsService.getOptionChain(symbol);
  }
  
  /**
   * Get trades
   */
  async getTrades(): Promise<SpyTrade[]> {
    return this.tradesService.getTrades();
  }
  
  /**
   * Get account data
   */
  async getAccountData(): Promise<{balance: number, dailyPnL: number, allTimePnL: number}> {
    return this.marketDataService.getAccountData();
  }
  
  /**
   * Place a trade
   */
  async placeTrade(order: TradeOrder): Promise<any> {
    return this.tradesService.placeTrade(order);
  }
}
