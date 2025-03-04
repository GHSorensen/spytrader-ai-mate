
import { DataProviderConfig, DataProviderStatus, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { BaseDataProvider } from "./base/BaseDataProvider";
import { IBKRConnectionManager } from "./interactiveBrokers/IBKRConnectionManager";
import { IBKRDataService } from "./interactiveBrokers/IBKRDataService";
import { IBKRAuthService } from "./interactiveBrokers/IBKRAuthService";
import { IBKRPaperTradeService } from "./interactiveBrokers/IBKRPaperTradeService";
import { toast } from "sonner";

/**
 * Interactive Brokers API service
 */
export class InteractiveBrokersService extends BaseDataProvider {
  private authService: IBKRAuthService;
  private connectionManager: IBKRConnectionManager;
  private dataService: IBKRDataService;
  private paperTradeService: IBKRPaperTradeService;
  
  constructor(config: DataProviderConfig) {
    super(config);
    this.authService = new IBKRAuthService(config);
    this.connectionManager = new IBKRConnectionManager(config);
    this.dataService = new IBKRDataService(config);
    this.paperTradeService = new IBKRPaperTradeService();
    console.log("InteractiveBrokersService initialized with config:", config);
  }
  
  /**
   * Connect to the Interactive Brokers API
   */
  async connect(): Promise<boolean> {
    try {
      console.log(`Connecting to Interactive Brokers API via ${this.config.connectionMethod || 'webapi'}...`);
      
      const connected = await this.connectionManager.connect(this.authService);
      console.log("Connection result:", connected);
      
      if (connected) {
        if (this.authService.getAccessToken()) {
          this.accessToken = this.authService.getAccessToken();
          this.dataService.setAccessToken(this.accessToken);
          console.log("Access token set successfully");
        } else {
          console.warn("No access token received from connection manager");
        }
        
        if (this.authService.getTokenExpiry()) {
          this.tokenExpiry = this.authService.getTokenExpiry();
          console.log("Token expiry set:", this.tokenExpiry);
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
    try {
      console.log("Attempting to place trade with Interactive Brokers:", order);
      
      // Check if we're connected first
      if (!this.isConnected()) {
        console.log("Not connected to IBKR, attempting to connect...");
        const connected = await this.connect();
        if (!connected) {
          console.log("Failed to connect to IBKR, falling back to paper trade");
          return this.paperTradeService.createPaperTrade(order);
        } else {
          console.log("Successfully connected to IBKR");
        }
      }
      
      // Always create a paper trade for immediate testing purposes
      // This guarantees we'll at least have a fallback when troubleshooting
      const mockResult = this.paperTradeService.createPaperTrade(order);
      
      // Check if paper trading is forced via config
      if (this.config.paperTrading) {
        console.log("Paper trading is enabled in config, using paper trade");
        toast.info("Paper Trading Mode", {
          description: "Using paper trading as configured in settings.",
        });
        return mockResult;
      }
      
      // Check market hours
      const isMarketHours = this.paperTradeService.isMarketHours();
      
      if (!isMarketHours) {
        console.log("Outside market hours, creating paper trade instead");
        toast.info("Outside Market Hours", {
          description: "Creating paper trade for demonstration purposes.",
        });
        return mockResult;
      }
      
      // Attempt to place the real trade with the data service
      try {
        const result = await this.dataService.placeTrade(order);
        console.log("Trade placed successfully with data service:", result);
        return result;
      } catch (dataError) {
        console.error("Error placing trade with data service:", dataError);
        toast.error("Trade Error", {
          description: dataError instanceof Error ? dataError.message : "Error placing trade with broker. Using paper trade instead.",
        });
        
        // Fall back to paper trade on error
        return mockResult;
      }
    } catch (error) {
      console.error("Error in placeTrade:", error);
      toast.error("Trade Error", {
        description: error instanceof Error ? error.message : "Error placing trade. Creating paper trade instead.",
      });
      
      // Always fall back to paper trade on error
      return this.paperTradeService.createPaperTrade(order);
    }
  }
}
