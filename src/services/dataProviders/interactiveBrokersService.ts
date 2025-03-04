
import { DataProviderConfig, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { BaseDataProvider } from "./base/BaseDataProvider";
import { IBKRCoreService } from "./interactiveBrokers/core/IBKRCoreService";
import { toast } from "sonner";

/**
 * Interactive Brokers API service
 * This is a facade that delegates to the core service
 */
export class InteractiveBrokersService extends BaseDataProvider {
  private coreService: IBKRCoreService;
  
  constructor(config: DataProviderConfig) {
    super(config);
    this.coreService = new IBKRCoreService(config);
  }
  
  /**
   * Connect to the Interactive Brokers API
   */
  async connect(): Promise<boolean> {
    try {
      const connected = await this.coreService.connect();
      
      if (!connected && !this.status.errorMessage) {
        toast.error("Connection Required", {
          description: "Please complete the Interactive Brokers authorization process.",
        });
      }
      
      // Copy status from core service
      this.status = { ...this.coreService.getStatus() };
      this.accessToken = this.coreService.getAccessToken();
      this.tokenExpiry = this.coreService.getTokenExpiry();
      
      return connected;
    } catch (error) {
      console.error("Error in InteractiveBrokersService.connect:", error);
      this.status.connected = false;
      this.status.lastUpdated = new Date();
      this.status.errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast.error("Connection Error", {
        description: this.status.errorMessage,
      });
      
      return false;
    }
  }
  
  /**
   * Get market data from Interactive Brokers
   */
  async getMarketData(): Promise<SpyMarketData> {
    return this.coreService.getMarketData();
  }
  
  /**
   * Get options from Interactive Brokers
   */
  async getOptions(): Promise<SpyOption[]> {
    return this.coreService.getOptions();
  }
  
  /**
   * Get option chain from Interactive Brokers
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    return this.coreService.getOptionChain(symbol);
  }
  
  /**
   * Get trades from Interactive Brokers
   */
  async getTrades(): Promise<SpyTrade[]> {
    return this.coreService.getTrades();
  }
  
  /**
   * Get account data from Interactive Brokers
   */
  async getAccountData(): Promise<{balance: number, dailyPnL: number, allTimePnL: number}> {
    return this.coreService.getAccountData();
  }
  
  /**
   * Place a trade with Interactive Brokers
   */
  async placeTrade(order: TradeOrder): Promise<any> {
    return this.coreService.placeTrade(order);
  }
}
