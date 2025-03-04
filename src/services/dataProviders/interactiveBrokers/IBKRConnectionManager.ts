
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { IBKRAuthService } from "./IBKRAuthService";
import { TwsConnectionManager } from "./tws/TwsConnectionManager";
import { toast } from "sonner";

/**
 * Manages connections to Interactive Brokers
 */
export class IBKRConnectionManager {
  private config: DataProviderConfig;
  private twsConnectionManager: TwsConnectionManager;
  private lastConnectionResult: boolean = false;
  private lastConnectionTime: Date | null = null;
  private lastConnectionError: string | null = null;
  private connectionAttempts: number = 0;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    this.twsConnectionManager = new TwsConnectionManager(config);
    console.log("[IBKRConnectionManager] Initialized with config:", JSON.stringify({
      connectionMethod: config.connectionMethod,
      paperTrading: config.paperTrading,
      hasApiKey: !!config.apiKey,
      hasCallbackUrl: !!config.callbackUrl,
      twsHost: config.twsHost,
      twsPort: config.twsPort
    }, null, 2));
  }
  
  /**
   * Connect to Interactive Brokers
   */
  async connect(authService: IBKRAuthService): Promise<boolean> {
    try {
      this.connectionAttempts++;
      this.lastConnectionTime = new Date();
      console.log(`[IBKRConnectionManager] Connection attempt #${this.connectionAttempts} at ${this.lastConnectionTime.toISOString()}`);
      
      const connectionMethod = this.config.connectionMethod || 'webapi';
      console.log(`[IBKRConnectionManager] Using connection method: ${connectionMethod}`);
      
      // Record browser timezone for debugging
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const currentTime = new Date().toLocaleString();
      console.log(`[IBKRConnectionManager] Current time: ${currentTime}, Timezone: ${timezone}`);
      
      let connected = false;
      if (connectionMethod === 'tws') {
        connected = await this.connectViaTws();
      } else {
        connected = await this.connectViaWebApi(authService);
      }
      
      this.lastConnectionResult = connected;
      console.log(`[IBKRConnectionManager] Connection ${connected ? 'successful' : 'failed'}`);
      
      if (connected) {
        this.lastConnectionError = null;
        // Print diagnostics on successful connection
        this.printConnectionDiagnostics();
      }
      
      return connected;
    } catch (error) {
      console.error("[IBKRConnectionManager] Connection error:", error);
      console.error("[IBKRConnectionManager] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      this.lastConnectionResult = false;
      this.lastConnectionError = error instanceof Error ? error.message : "Unknown error";
      return false;
    }
  }
  
  /**
   * Connect via TWS
   */
  private async connectViaTws(): Promise<boolean> {
    try {
      console.log("[IBKRConnectionManager] Attempting TWS connection...");
      const startTime = Date.now();
      const connected = await this.twsConnectionManager.connect();
      const endTime = Date.now();
      
      console.log(`[IBKRConnectionManager] TWS connection attempt took ${endTime - startTime}ms, result: ${connected}`);
      
      if (!connected) {
        console.error("[IBKRConnectionManager] TWS connection failed");
        this.lastConnectionError = "TWS connection failed - check if TWS is running and API access is enabled";
        toast.error("TWS Connection Failed", {
          description: "Check if TWS is running and API access is enabled.",
        });
      }
      
      return connected;
    } catch (error) {
      console.error("[IBKRConnectionManager] Error in TWS connection:", error);
      this.lastConnectionError = error instanceof Error ? error.message : "Unknown TWS connection error";
      return false;
    }
  }
  
  /**
   * Connect via Web API
   */
  private async connectViaWebApi(authService: IBKRAuthService): Promise<boolean> {
    try {
      console.log("[IBKRConnectionManager] Attempting Web API connection...");
      console.log("[IBKRConnectionManager] Checking Web API credentials:", {
        hasApiKey: !!this.config.apiKey,
        hasCallbackUrl: !!this.config.callbackUrl,
        hasRefreshToken: !!this.config.refreshToken
      });
      
      const startTime = Date.now();
      const authenticated = await authService.authenticate();
      const endTime = Date.now();
      
      console.log(`[IBKRConnectionManager] Web API authentication took ${endTime - startTime}ms, result: ${authenticated}`);
      
      if (!authenticated) {
        console.error("[IBKRConnectionManager] Web API authentication failed");
        this.lastConnectionError = "Web API authentication failed - check your API credentials";
        toast.error("IBKR Authentication Failed", {
          description: "Check your API key and credentials.",
        });
      }
      
      return authenticated;
    } catch (error) {
      console.error("[IBKRConnectionManager] Error in Web API connection:", error);
      this.lastConnectionError = error instanceof Error ? error.message : "Unknown Web API connection error";
      return false;
    }
  }
  
  /**
   * Get connection diagnostics
   */
  getDiagnostics(): any {
    return {
      connectionMethod: this.config.connectionMethod || 'webapi',
      paperTrading: this.config.paperTrading,
      lastConnectionResult: this.lastConnectionResult,
      lastConnectionTime: this.lastConnectionTime?.toISOString(),
      lastConnectionError: this.lastConnectionError,
      connectionAttempts: this.connectionAttempts,
      twsStatus: this.twsConnectionManager.getConnectionState(),
      config: {
        hasApiKey: !!this.config.apiKey,
        hasCallbackUrl: !!this.config.callbackUrl,
        hasRefreshToken: !!this.config.refreshToken,
        twsHost: this.config.twsHost,
        twsPort: this.config.twsPort
      },
      browser: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: new Date().toISOString()
      }
    };
  }
  
  /**
   * Print connection diagnostics to console
   */
  private printConnectionDiagnostics(): void {
    const diagnostics = this.getDiagnostics();
    console.log("[IBKRConnectionManager] Connection Diagnostics:", JSON.stringify(diagnostics, null, 2));
    
    if (this.config.connectionMethod === 'tws') {
      console.log("[IBKRConnectionManager] TWS Connection Check:", {
        port: this.config.twsPort,
        expectedPaperPort: '7497',
        expectedLivePort: '7496',
        correctPortForPaper: this.config.paperTrading ? this.config.twsPort === '7497' : true,
        correctPortForLive: !this.config.paperTrading ? this.config.twsPort === '7496' : true
      });
    }
  }
}
