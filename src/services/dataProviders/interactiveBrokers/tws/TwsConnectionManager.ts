
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { toast } from "@/hooks/use-toast";

/**
 * Manages connection to TWS (Trader Workstation)
 */
export class TwsConnectionManager {
  private config: DataProviderConfig;
  private connectAttempts: number = 0;
  private maxConnectAttempts: number = 3;
  private readonly RETRY_DELAY: number = 2000; // 2 seconds
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    console.log("[TwsConnectionManager] Initialized with config:", JSON.stringify(config, null, 2));
  }
  
  /**
   * Connect to TWS
   */
  async connect(): Promise<boolean> {
    try {
      this.connectAttempts++;
      console.log(`[TwsConnectionManager] Connection attempt ${this.connectAttempts} of ${this.maxConnectAttempts}`);
      
      if (!this.config.twsHost || !this.config.twsPort) {
        console.error("[TwsConnectionManager] Missing TWS host or port", {
          host: this.config.twsHost,
          port: this.config.twsPort
        });
        throw new Error("TWS host and port are required for TWS connection");
      }
      
      // Check if we should use the paper trading port
      if (this.config.paperTrading && this.config.twsPort === '7496') {
        console.log("[TwsConnectionManager] Using paper trading port 7497 instead of 7496");
        this.config.twsPort = '7497';
      } else if (!this.config.paperTrading && this.config.twsPort === '7497') {
        console.log("[TwsConnectionManager] Using live trading port 7496 instead of 7497");
        this.config.twsPort = '7496';
      }
      
      // In a real implementation, we would make a socket connection to TWS
      console.log(`[TwsConnectionManager] Connecting to TWS at ${this.config.twsHost}:${this.config.twsPort} (Paper trading: ${this.config.paperTrading ? 'Yes' : 'No'})`);
      
      // Simulate a connection attempt with possible failure for testing
      const connectionSuccessful = await this.simulateTwsConnection();
      
      if (connectionSuccessful) {
        console.log("[TwsConnectionManager] Connection successful");
        this.connectAttempts = 0; // Reset on success
        return true;
      } else {
        console.log("[TwsConnectionManager] Connection failed");
        // Try to reconnect if we haven't exceeded max attempts
        if (this.connectAttempts < this.maxConnectAttempts) {
          console.log(`[TwsConnectionManager] Connection attempt ${this.connectAttempts} failed. Trying again in ${this.RETRY_DELAY/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
          return this.connect();
        }
        
        console.error("[TwsConnectionManager] Failed after maximum connection attempts");
        throw new Error("Failed to connect to TWS after multiple attempts. Please check if TWS is running, you are logged in, and API connections are enabled.");
      }
    } catch (error) {
      console.error("[TwsConnectionManager] Error connecting to TWS:", error);
      
      toast({
        title: "TWS Connection Error",
        description: error instanceof Error ? error.message : "Unknown error connecting to TWS",
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
      console.log("[TwsConnectionManager] Simulating TWS connection...");
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Randomly succeed or fail for testing reconnection logic
      // In production, this would be actual connection logic
      const isConfigValid = this.config.twsHost && this.config.twsPort;
      console.log("[TwsConnectionManager] Config validation:", isConfigValid);
      
      // For testing, always succeed after first attempt
      const shouldSucceed = this.connectAttempts > 1 || (isConfigValid && Math.random() > 0.3);
      console.log("[TwsConnectionManager] Simulate connection result:", shouldSucceed);
      
      if (shouldSucceed) {
        console.log("[TwsConnectionManager] TWS connection successful");
        return true;
      }
      
      console.log("[TwsConnectionManager] TWS connection failed");
      return false;
    } catch (error) {
      console.error("[TwsConnectionManager] Error in TWS connection:", error);
      return false;
    }
  }
}
