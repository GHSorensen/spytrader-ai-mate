
import { BaseDataProvider } from "./base/BaseDataProvider";
import { DataProviderConfig, DataProviderStatus } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { IBKRAuth } from "./interactiveBrokers/auth";
import { TwsConnectionManager } from "./interactiveBrokers/tws/TwsConnectionManager";
import { TwsDataService } from "./interactiveBrokers/tws/TwsDataService";
import { WebApiDataService } from "./interactiveBrokers/webapi/WebApiDataService";
import { toast } from "@/hooks/use-toast";

/**
 * Interactive Brokers API service
 */
export class InteractiveBrokersService extends BaseDataProvider {
  private auth: IBKRAuth;
  private connectionMethod: 'webapi' | 'tws';
  private twsConnectionManager: TwsConnectionManager;
  private twsDataService: TwsDataService;
  private webApiDataService: WebApiDataService;
  
  constructor(config: DataProviderConfig) {
    super(config);
    this.auth = new IBKRAuth(config);
    this.connectionMethod = config.connectionMethod || 'webapi';
    this.twsConnectionManager = new TwsConnectionManager(config);
    this.twsDataService = new TwsDataService(config);
    this.webApiDataService = new WebApiDataService(config);
  }
  
  /**
   * Connect to the Interactive Brokers API
   */
  async connect(): Promise<boolean> {
    try {
      console.log(`Connecting to Interactive Brokers API via ${this.connectionMethod}...`);
      
      if (this.connectionMethod === 'tws') {
        // Logic for TWS connection
        const connected = await this.twsConnectionManager.connect();
        
        if (connected) {
          this.status.connected = true;
          this.status.lastUpdated = new Date();
          this.status.quotesDelayed = false;
          return true;
        }
        
        this.status.connected = false;
        this.status.lastUpdated = new Date();
        return false;
      }
      
      // Web API connection logic
      if (this.config.refreshToken) {
        const authResult = await this.auth.refreshAccessToken(this.config.refreshToken);
        this.accessToken = authResult.accessToken;
        this.webApiDataService.setAccessToken(authResult.accessToken);
        
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + authResult.expiresIn);
        this.tokenExpiry = expiryDate;
        this.status.connected = true;
        this.status.lastUpdated = new Date();
        return true;
      }
      
      if (this.config.accessToken) {
        this.accessToken = this.config.accessToken;
        this.webApiDataService.setAccessToken(this.config.accessToken);
        
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1); // Assume 1 hour expiry
        this.tokenExpiry = expiryDate;
        this.status.connected = true;
        this.status.lastUpdated = new Date();
        return true;
      }
      
      this.status.connected = false;
      this.status.lastUpdated = new Date();
      
      toast({
        title: "Connection Required",
        description: "Please complete the Interactive Brokers authorization process.",
      });
      
      return false;
    } catch (error) {
      console.error("Error connecting to Interactive Brokers:", error);
      this.status.connected = false;
      this.status.lastUpdated = new Date();
      this.status.errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Connection Error",
        description: this.status.errorMessage,
        variant: "destructive",
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
    
    try {
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.getMarketData();
      }
      
      return this.webApiDataService.getMarketData();
    } catch (error) {
      console.error("Error fetching market data from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get options from Interactive Brokers
   */
  async getOptions(): Promise<SpyOption[]> {
    if (!this.isConnected()) {
      await this.connect();
    }
    
    try {
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.getOptions();
      }
      
      return this.webApiDataService.getOptions();
    } catch (error) {
      console.error("Error fetching options from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get option chain from Interactive Brokers
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    if (!this.isConnected()) {
      await this.connect();
    }
    
    try {
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.getOptionChain(symbol);
      }
      
      return this.webApiDataService.getOptionChain(symbol);
    } catch (error) {
      console.error(`Error fetching option chain for ${symbol} from Interactive Brokers:`, error);
      throw error;
    }
  }
  
  /**
   * Get trades from Interactive Brokers
   */
  async getTrades(): Promise<SpyTrade[]> {
    if (!this.isConnected()) {
      await this.connect();
    }
    
    try {
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.getTrades();
      }
      
      return this.webApiDataService.getTrades();
    } catch (error) {
      console.error("Error fetching trades from Interactive Brokers:", error);
      throw error;
    }
  }
}
