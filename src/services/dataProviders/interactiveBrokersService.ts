import { BaseDataProvider } from "./base/BaseDataProvider";
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { IBKRAuth } from "./interactiveBrokers/auth";
import * as endpoints from "./interactiveBrokers/endpoints";
import * as utils from "./interactiveBrokers/utils";
import { toast } from "@/hooks/use-toast";

/**
 * Interactive Brokers API service
 */
export class InteractiveBrokersService extends BaseDataProvider {
  private auth: IBKRAuth;
  
  constructor(config: DataProviderConfig) {
    super(config);
    this.auth = new IBKRAuth(config);
  }
  
  /**
   * Connect to the Interactive Brokers API
   */
  async connect(): Promise<boolean> {
    try {
      console.log("Connecting to Interactive Brokers API...");
      
      // If we have a refresh token, use it to get a new access token
      if (this.config.refreshToken) {
        const authResult = await this.auth.refreshAccessToken(this.config.refreshToken);
        this.accessToken = authResult.accessToken;
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + authResult.expiresIn);
        this.tokenExpiry = expiryDate;
        this.status.connected = true;
        this.status.lastUpdated = new Date();
        return true;
      }
      
      // Otherwise, if we have an access token, use it
      if (this.config.accessToken) {
        this.accessToken = this.config.accessToken;
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1); // Assume 1 hour expiry
        this.tokenExpiry = expiryDate;
        this.status.connected = true;
        this.status.lastUpdated = new Date();
        return true;
      }
      
      // If we have no token, we'll need to go through the OAuth flow
      // This would be handled elsewhere, directing the user to authorize
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
    try {
      // In production, this would make a real API call
      console.log("Fetching market data from Interactive Brokers...");
      
      // For now, return mock data
      return utils.generateMockMarketData();
    } catch (error) {
      console.error("Error fetching market data from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get options from Interactive Brokers
   */
  async getOptions(): Promise<SpyOption[]> {
    try {
      // In production, this would make a real API call
      console.log("Fetching options from Interactive Brokers...");
      
      // For now, return mock data
      return utils.generateMockOptions();
    } catch (error) {
      console.error("Error fetching options from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get option chain from Interactive Brokers
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    try {
      // In production, this would make a real API call with the specific symbol
      console.log(`Fetching option chain for ${symbol} from Interactive Brokers...`);
      
      // For now, return mock data
      return utils.generateMockOptions();
    } catch (error) {
      console.error(`Error fetching option chain for ${symbol} from Interactive Brokers:`, error);
      throw error;
    }
  }
  
  /**
   * Get trades from Interactive Brokers
   */
  async getTrades(): Promise<SpyTrade[]> {
    try {
      // In production, this would make a real API call
      console.log("Fetching trades from Interactive Brokers...");
      
      // For now, return mock data
      return utils.generateMockTrades();
    } catch (error) {
      console.error("Error fetching trades from Interactive Brokers:", error);
      throw error;
    }
  }
}
