import { DataProviderConfig, DataProviderStatus, TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { IBKRConnectionManager } from "../IBKRConnectionManager";
import { IBKRDataService } from "../IBKRDataService";
import { IBKRAuthService } from "../IBKRAuthService";
import { BaseDataProvider } from "../../base/BaseDataProvider";
import { IBKRTradeService } from "./IBKRTradeService";

/**
 * Core service for Interactive Brokers API
 * Handles connection, authentication, and delegation to specialized services
 */
export class IBKRCoreService extends BaseDataProvider {
  private authService: IBKRAuthService;
  private connectionManager: IBKRConnectionManager;
  private dataService: IBKRDataService;
  private tradeService: IBKRTradeService;
  
  constructor(config: DataProviderConfig) {
    super(config);
    this.authService = new IBKRAuthService(config);
    this.connectionManager = new IBKRConnectionManager(config);
    this.dataService = new IBKRDataService(config);
    this.tradeService = new IBKRTradeService(config);
    console.log("IBKRCoreService initialized with config:", config);
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
      
      this.updateDisconnectedStatus();
      return false;
    } catch (error) {
      console.error("Error connecting to Interactive Brokers:", error);
      this.updateErrorStatus(error);
      return false;
    }
  }
  
  /**
   * Update status when disconnected
   */
  private updateDisconnectedStatus(): void {
    this.status.connected = false;
    this.status.lastUpdated = new Date();
  }
  
  /**
   * Update status when error occurs
   */
  private updateErrorStatus(error: unknown): void {
    this.status.connected = false;
    this.status.lastUpdated = new Date();
    this.status.errorMessage = error instanceof Error ? error.message : "Unknown error";
  }
  
  /**
   * Get current status
   */
  getStatus(): DataProviderStatus {
    return this.status;
  }
  
  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }
  
  /**
   * Get token expiry
   */
  getTokenExpiry(): Date | null {
    return this.tokenExpiry;
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
          return this.tradeService.createPaperTrade(order);
        } else {
          console.log("Successfully connected to IBKR");
        }
      }
      
      return this.tradeService.placeTrade(order, this.dataService);
    } catch (error) {
      console.error("Error in placeTrade:", error);
      return this.tradeService.handleTradeError(error, order);
    }
  }
}
