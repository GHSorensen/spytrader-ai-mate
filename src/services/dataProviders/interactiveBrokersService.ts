
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
    try {
      console.log("Attempting to place trade with Interactive Brokers:", order);
      
      // Check if we're connected first
      if (!this.isConnected()) {
        console.log("Not connected to IBKR, attempting to connect...");
        const connected = await this.connect();
        if (!connected) {
          console.log("Failed to connect to IBKR, falling back to paper trade");
          return this.createPaperTrade(order);
        }
      }
      
      // Check market hours (simplified check)
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const day = now.getDay();
      const isWeekend = day === 0 || day === 6;
      const isMarketHours = !isWeekend && ((hour > 9 || (hour === 9 && minute >= 30)) && hour < 16);
      
      if (!isMarketHours && !this.config.paperTrading) {
        console.log("Outside market hours, creating paper trade instead");
        toast.info("Outside Market Hours", {
          description: "Creating paper trade for demonstration purposes.",
        });
        return this.createPaperTrade(order);
      }
      
      // Attempt to place the real trade
      const result = await this.dataService.placeTrade(order);
      console.log("Trade placed successfully:", result);
      
      return result;
    } catch (error) {
      console.error("Error in placeTrade:", error);
      toast.error("Trade Error", {
        description: error instanceof Error ? error.message : "Error placing trade. Creating paper trade instead.",
      });
      
      // Always fall back to paper trade on error
      return this.createPaperTrade(order);
    }
  }
  
  /**
   * Create a paper trade for testing or when real trading fails
   */
  private createPaperTrade(order: TradeOrder): any {
    console.log("Creating paper trade for:", order);
    
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
    
    const mockTrade: SpyTrade = {
      id: `paper-${Date.now()}`,
      type: order.action === 'BUY' ? "CALL" : "PUT",
      strikePrice: 500,
      expirationDate: expiryDate,
      entryPrice: 3.45,
      currentPrice: 3.45,
      targetPrice: 5.0,
      stopLoss: 2.0,
      quantity: order.quantity,
      status: "active",
      openedAt: now,
      profit: 0,
      profitPercentage: 0,
      confidenceScore: 0.75,
      paperTrading: true
    };
    
    return { 
      trade: mockTrade, 
      orderId: `PAPER-${Date.now()}`,
      isPaperTrade: true,
      message: "Created paper trade for testing purposes."
    };
  }
}
