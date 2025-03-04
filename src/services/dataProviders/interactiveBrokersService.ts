
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
  private connectionMethod: 'webapi' | 'tws';
  private connectAttempts: number = 0;
  private maxConnectAttempts: number = 3;
  private readonly RETRY_DELAY: number = 2000; // 2 seconds
  
  constructor(config: DataProviderConfig) {
    super(config);
    this.auth = new IBKRAuth(config);
    this.connectionMethod = config.connectionMethod || 'webapi';
  }
  
  /**
   * Connect to the Interactive Brokers API
   */
  async connect(): Promise<boolean> {
    try {
      console.log(`Connecting to Interactive Brokers API via ${this.connectionMethod}...`);
      this.connectAttempts++;
      
      if (this.connectionMethod === 'tws') {
        // Logic for TWS connection
        if (!this.config.twsHost || !this.config.twsPort) {
          throw new Error("TWS host and port are required for TWS connection");
        }
        
        // Check if we should use the paper trading port
        if (this.config.paperTrading && this.config.twsPort === '7496') {
          console.log("Using paper trading port 7497 instead of 7496");
          this.config.twsPort = '7497';
        }
        
        // In a real implementation, we would make a socket connection to TWS
        console.log(`Connecting to TWS at ${this.config.twsHost}:${this.config.twsPort} (Paper trading: ${this.config.paperTrading ? 'Yes' : 'No'})`);
        
        // Simulate a connection attempt with possible failure for testing
        const connectionSuccessful = await this.simulateTwsConnection();
        
        if (connectionSuccessful) {
          this.status.connected = true;
          this.status.lastUpdated = new Date();
          this.status.quotesDelayed = false;
          this.connectAttempts = 0; // Reset on success
          return true;
        } else {
          // Try to reconnect if we haven't exceeded max attempts
          if (this.connectAttempts < this.maxConnectAttempts) {
            console.log(`Connection attempt ${this.connectAttempts} failed. Trying again in ${this.RETRY_DELAY/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
            return this.connect();
          }
          
          throw new Error("Failed to connect to TWS after multiple attempts. Please check if TWS is running and API connections are enabled.");
        }
      }
      
      // Web API connection logic
      if (this.config.refreshToken) {
        const authResult = await this.auth.refreshAccessToken(this.config.refreshToken);
        this.accessToken = authResult.accessToken;
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + authResult.expiresIn);
        this.tokenExpiry = expiryDate;
        this.status.connected = true;
        this.status.lastUpdated = new Date();
        this.connectAttempts = 0; // Reset on success
        return true;
      }
      
      if (this.config.accessToken) {
        this.accessToken = this.config.accessToken;
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1); // Assume 1 hour expiry
        this.tokenExpiry = expiryDate;
        this.status.connected = true;
        this.status.lastUpdated = new Date();
        this.connectAttempts = 0; // Reset on success
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
   * Simulate a connection to TWS for testing
   * In a real implementation, this would be replaced with actual socket connection code
   */
  private async simulateTwsConnection(): Promise<boolean> {
    // Simulate the connection process
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Randomly succeed or fail for testing reconnection logic
      // In production, this would be actual connection logic
      const isConfigValid = this.config.twsHost && this.config.twsPort;
      
      // For testing, always succeed after first attempt
      if (this.connectAttempts > 1 || (isConfigValid && Math.random() > 0.3)) {
        console.log("TWS connection successful");
        return true;
      }
      
      console.log("TWS connection failed");
      return false;
    } catch (error) {
      console.error("Error in TWS connection:", error);
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
      // In production, this would make a real API call
      console.log("Fetching market data from Interactive Brokers...");
      
      if (this.connectionMethod === 'tws') {
        // Simulate TWS market data call
        return this.getTwsMarketData();
      }
      
      // Web API market data
      return utils.generateMockMarketData();
    } catch (error) {
      console.error("Error fetching market data from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get market data from TWS
   */
  private async getTwsMarketData(): Promise<SpyMarketData> {
    // In a real implementation, this would communicate with TWS
    // For now, return mock data with a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockData = utils.generateMockMarketData();
    
    // Modify mock data to make it appear slightly different from web API data
    mockData.price = parseFloat((mockData.price + (Math.random() * 0.5 - 0.25)).toFixed(2));
    mockData.volume = Math.floor(mockData.volume * (1 + (Math.random() * 0.1 - 0.05)));
    
    // Add paper trading indicator if using paper trading
    if (this.config.paperTrading) {
      mockData.paperTrading = true;
    }
    
    return mockData;
  }
  
  /**
   * Get options from Interactive Brokers
   */
  async getOptions(): Promise<SpyOption[]> {
    if (!this.isConnected()) {
      await this.connect();
    }
    
    try {
      console.log("Fetching options from Interactive Brokers...");
      
      if (this.connectionMethod === 'tws') {
        // Simulate TWS options data call
        return this.getTwsOptions();
      }
      
      // Web API options data
      return utils.generateMockOptions();
    } catch (error) {
      console.error("Error fetching options from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get options from TWS
   */
  private async getTwsOptions(): Promise<SpyOption[]> {
    // In a real implementation, this would communicate with TWS
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const options = utils.generateMockOptions();
    
    // Add paper trading indicator if using paper trading
    if (this.config.paperTrading) {
      options.forEach(option => {
        option.paperTrading = true;
        
        // Slightly adjust premiums for TWS data to make it realistic
        option.premium = parseFloat((option.premium * (1 + (Math.random() * 0.05 - 0.025))).toFixed(2));
      });
    }
    
    return options;
  }
  
  /**
   * Get option chain from Interactive Brokers
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    if (!this.isConnected()) {
      await this.connect();
    }
    
    try {
      console.log(`Fetching option chain for ${symbol} from Interactive Brokers...`);
      
      if (this.connectionMethod === 'tws') {
        // Simulate TWS option chain data
        return this.getTwsOptionChain(symbol);
      }
      
      // Web API option chain
      return utils.generateMockOptions();
    } catch (error) {
      console.error(`Error fetching option chain for ${symbol} from Interactive Brokers:`, error);
      throw error;
    }
  }
  
  /**
   * Get option chain from TWS
   */
  private async getTwsOptionChain(symbol: string): Promise<SpyOption[]> {
    // In a real implementation, this would communicate with TWS
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const options = utils.generateMockOptions();
    
    // Add symbol and paper trading indicator if using paper trading
    options.forEach(option => {
      option.symbol = symbol;
      
      if (this.config.paperTrading) {
        option.paperTrading = true;
      }
    });
    
    return options;
  }
  
  /**
   * Get trades from Interactive Brokers
   */
  async getTrades(): Promise<SpyTrade[]> {
    if (!this.isConnected()) {
      await this.connect();
    }
    
    try {
      console.log("Fetching trades from Interactive Brokers...");
      
      if (this.connectionMethod === 'tws') {
        // Simulate TWS trades data
        return this.getTwsTrades();
      }
      
      // Web API trades
      return utils.generateMockTrades();
    } catch (error) {
      console.error("Error fetching trades from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get trades from TWS
   */
  private async getTwsTrades(): Promise<SpyTrade[]> {
    // In a real implementation, this would communicate with TWS
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const trades = utils.generateMockTrades();
    
    // Add paper trading indicator if using paper trading
    if (this.config.paperTrading) {
      trades.forEach(trade => {
        trade.paperTrading = true;
      });
    }
    
    return trades;
  }
}
