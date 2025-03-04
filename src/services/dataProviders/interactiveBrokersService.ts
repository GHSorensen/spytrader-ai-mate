
import { DataProviderConfig, DataProviderStatus, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { BaseDataProvider } from "./base/BaseDataProvider";
import { IBKRAuth } from "./interactiveBrokers/auth";
import { IBKRConnectionManager } from "./interactiveBrokers/IBKRConnectionManager";
import { IBKRDataService } from "./interactiveBrokers/IBKRDataService";
import { toast } from "sonner";

/**
 * Interactive Brokers API service
 */
export class InteractiveBrokersService extends BaseDataProvider {
  private auth: IBKRAuth;
  private connectionManager: IBKRConnectionManager;
  private dataService: IBKRDataService;
  
  constructor(config: DataProviderConfig) {
    super(config);
    this.auth = new IBKRAuth(config);
    this.connectionManager = new IBKRConnectionManager(config);
    this.dataService = new IBKRDataService(config);
  }
  
  /**
   * Connect to the Interactive Brokers API
   */
  async connect(): Promise<boolean> {
    try {
      console.log(`Connecting to Interactive Brokers API via ${this.config.connectionMethod || 'webapi'}...`);
      
      const connected = await this.connectionManager.connect(this.auth);
      
      if (connected) {
        if (this.connectionManager.getAccessToken()) {
          this.accessToken = this.connectionManager.getAccessToken();
          this.dataService.setAccessToken(this.accessToken);
        }
        
        if (this.connectionManager.getTokenExpiry()) {
          this.tokenExpiry = this.connectionManager.getTokenExpiry();
        }
        
        this.status.connected = true;
        this.status.lastUpdated = new Date();
        this.status.quotesDelayed = this.config.quotesDelayed || false;
        return true;
      }
      
      this.status.connected = false;
      this.status.lastUpdated = new Date();
      
      if (!this.status.errorMessage) {
        toast.error("Connection Required", {
          description: "Please complete the Interactive Brokers authorization process.",
        });
      }
      
      return false;
    } catch (error) {
      console.error("Error connecting to Interactive Brokers:", error);
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
    if (!this.isConnected()) {
      await this.connect();
    }
    
    return this.dataService.getMarketData();
  }
  
  /**
   * Get options from Interactive Brokers
   */
  async getOptions(): Promise<SpyOption[]> {
    if (!this.isConnected()) {
      await this.connect();
    }
    
    return this.dataService.getOptions();
  }
  
  /**
   * Get option chain from Interactive Brokers
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    if (!this.isConnected()) {
      await this.connect();
    }
    
    return this.dataService.getOptionChain(symbol);
  }
  
  /**
   * Get trades from Interactive Brokers
   */
  async getTrades(): Promise<SpyTrade[]> {
    if (!this.isConnected()) {
      await this.connect();
    }
    
    return this.dataService.getTrades();
  }
  
  /**
   * Get account data from Interactive Brokers
   */
  async getAccountData(): Promise<{balance: number, dailyPnL: number, allTimePnL: number}> {
    if (!this.isConnected()) {
      await this.connect();
    }
    
    return this.dataService.getAccountData();
  }
  
  /**
   * Place a trade with Interactive Brokers
   */
  async placeTrade(order: TradeOrder): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
    }
    
    return this.dataService.placeTrade(order);
  }
}
