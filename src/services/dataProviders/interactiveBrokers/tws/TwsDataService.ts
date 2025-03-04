
import { DataProviderConfig, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { TwsMarketDataService } from "./TwsMarketDataService";
import { TwsOptionsService } from "./TwsOptionsService";
import { TwsTradesService } from "./TwsTradesService";

/**
 * Main TWS data service that delegates to specialized services
 */
export class TwsDataService {
  private config: DataProviderConfig;
  private marketDataService: TwsMarketDataService;
  private optionsService: TwsOptionsService;
  private tradesService: TwsTradesService;
  private isConnected: boolean = false;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    this.marketDataService = new TwsMarketDataService(config);
    this.optionsService = new TwsOptionsService(config);
    this.tradesService = new TwsTradesService(config);
  }
  
  /**
   * Connect to TWS
   */
  async connect(): Promise<boolean> {
    try {
      // Connect to all services
      const marketDataConnected = await this.marketDataService.connect();
      const optionsConnected = await this.optionsService.connect();
      const tradesConnected = await this.tradesService.connect();
      
      this.isConnected = marketDataConnected && optionsConnected && tradesConnected;
      return this.isConnected;
    } catch (error) {
      console.error('Error connecting to TWS services:', error);
      this.isConnected = false;
      return false;
    }
  }
  
  /**
   * Get market data from TWS
   */
  async getMarketData(): Promise<SpyMarketData> {
    return this.marketDataService.getMarketData();
  }
  
  /**
   * Get options from TWS
   */
  async getOptions(): Promise<SpyOption[]> {
    return this.optionsService.getOptions();
  }
  
  /**
   * Get option chain from TWS
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    return this.optionsService.getOptionChain(symbol);
  }
  
  /**
   * Get trades from TWS
   */
  async getTrades(): Promise<SpyTrade[]> {
    return this.tradesService.getTrades();
  }
  
  /**
   * Get account data from TWS
   */
  async getAccountData(): Promise<{balance: number, dailyPnL: number, allTimePnL: number}> {
    return this.marketDataService.getAccountData();
  }
  
  /**
   * Place trade via TWS
   */
  async placeTrade(order: TradeOrder): Promise<any> {
    return this.tradesService.placeTrade(order);
  }
}
