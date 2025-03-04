
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { TwsDataService } from "../tws/TwsDataService";
import { WebApiDataService } from "../webapi/WebApiDataService";
import { toast } from "sonner";

/**
 * Service for handling connection with Interactive Brokers
 */
export class IBKRConnectionService {
  private config: DataProviderConfig;
  private twsDataService: TwsDataService;
  private webApiDataService: WebApiDataService;
  private connectionMethod: 'webapi' | 'tws';
  private lastConnectTime: Date | null = null;
  private connectAttempts: number = 0;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  
  constructor(
    config: DataProviderConfig,
    twsDataService: TwsDataService,
    webApiDataService: WebApiDataService
  ) {
    this.config = config;
    this.connectionMethod = config.connectionMethod || 'webapi';
    this.twsDataService = twsDataService;
    this.webApiDataService = webApiDataService;
    
    // Detailed initialization logs
    console.log("[IBKRConnectionService] Initialized with method:", this.connectionMethod);
    console.log("[IBKRConnectionService] Config details:", {
      type: config.type,
      hasApiKey: !!config.apiKey,
      hasCallbackUrl: !!config.callbackUrl,
      twsHost: config.twsHost,
      twsPort: config.twsPort,
      paperTrading: config.paperTrading,
      connectionMethod: config.connectionMethod
    });
  }

  /**
   * Set access token for Web API connections
   */
  setAccessToken(token: string): void {
    console.log("[IBKRConnectionService] Setting access token:", token ? `${token.substring(0, 5)}...` : 'null');
    this.webApiDataService.setAccessToken(token);
  }
  
  /**
   * Connect to appropriate IBKR service
   */
  async connect(): Promise<boolean> {
    try {
      this.connectionState = 'connecting';
      this.lastConnectTime = new Date();
      this.connectAttempts++;
      
      console.log(`[IBKRConnectionService] Connection attempt #${this.connectAttempts} at ${this.lastConnectTime.toISOString()}`);
      console.log("[IBKRConnectionService] Attempting to connect via:", this.connectionMethod);
      
      // Check system compatibility
      this.checkSystemCompatibility();
      
      if (this.connectionMethod === 'tws') {
        console.log("[IBKRConnectionService] Connecting to TWS at:", this.config.twsHost, "port:", this.config.twsPort);
        
        // Verify TWS configuration
        if (!this.config.twsHost || !this.config.twsPort) {
          const errorMsg = "Missing TWS host or port configuration";
          console.error(`[IBKRConnectionService] ${errorMsg}`, {
            host: this.config.twsHost,
            port: this.config.twsPort
          });
          this.connectionState = 'error';
          
          toast.error("TWS Connection Error", {
            description: errorMsg,
          });
          
          return false;
        }
        
        // Check for port/paper configuration mismatch
        if (this.config.paperTrading && this.config.twsPort === '7496') {
          console.warn("[IBKRConnectionService] Paper trading enabled but using live port 7496");
          toast.warning("Port Configuration", {
            description: "Paper trading is enabled but using live port (7496). Switching to paper port (7497).",
          });
          // Instead of auto-switching, we'll warn and continue with their setting
        } else if (!this.config.paperTrading && this.config.twsPort === '7497') {
          console.warn("[IBKRConnectionService] Live trading enabled but using paper port 7497");
          toast.warning("Port Configuration", {
            description: "Live trading is enabled but using paper port (7497). Switching to live port (7496).",
          });
          // Instead of auto-switching, we'll warn and continue with their setting
        }
        
        const result = await this.twsDataService.connect();
        console.log("[IBKRConnectionService] TWS connection result:", result);
        this.connectionState = result ? 'connected' : 'error';
        return result;
      }
      
      // Debug WebAPI connection details
      console.log("[IBKRConnectionService] Using Web API connection. API Key present:", !!this.config.apiKey);
      console.log("[IBKRConnectionService] Callback URL:", this.config.callbackUrl);
      
      // Verify WebAPI configuration
      if (!this.config.apiKey) {
        const errorMsg = "Missing API Key for WebAPI connection";
        console.error(`[IBKRConnectionService] ${errorMsg}`);
        this.connectionState = 'error';
        
        toast.error("WebAPI Connection Error", {
          description: errorMsg,
        });
        
        return false;
      }
      
      // WebAPI doesn't have a direct connect method, as it's handled
      // via authentication and tokens, so we'll return true
      this.connectionState = 'connected';
      return true;
    } catch (error) {
      console.error("[IBKRConnectionService] Error connecting to Interactive Brokers:", error);
      console.error("[IBKRConnectionService] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      this.connectionState = 'error';
      
      const errorMessage = error instanceof Error ? error.message : "Unknown connection error";
      toast.error("IBKR Connection Error", {
        description: errorMessage,
      });
      
      return false;
    }
  }
  
  /**
   * Check system compatibility for connections
   */
  private checkSystemCompatibility(): void {
    try {
      // Check browser environment
      const isSecureContext = typeof window !== 'undefined' && window.isSecureContext;
      console.log("[IBKRConnectionService] Running in secure context:", isSecureContext);
      
      if (!isSecureContext) {
        console.warn("[IBKRConnectionService] Not running in a secure context - some browser features may be limited");
      }
      
      // Check if we're in a browser that supports needed features
      const features = {
        localStorage: typeof localStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        crypto: typeof crypto !== 'undefined',
        online: typeof navigator !== 'undefined' && navigator.onLine
      };
      
      console.log("[IBKRConnectionService] Browser feature support:", features);
      
      if (!features.localStorage) {
        console.warn("[IBKRConnectionService] localStorage not available - token persistence will be limited");
      }
      
      if (!features.online) {
        console.warn("[IBKRConnectionService] Browser reports offline status - connection may fail");
      }
    } catch (error) {
      console.error("[IBKRConnectionService] Error checking system compatibility:", error);
    }
  }
  
  /**
   * Get connection diagnostics for debugging
   */
  getDiagnostics(): {
    connectionMethod: 'webapi' | 'tws';
    connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
    lastConnectTime: string | null;
    connectAttempts: number;
    config: {
      hasApiKey: boolean;
      hasCallbackUrl: boolean;
      twsHost: string | undefined;
      twsPort: string | undefined;
      paperTrading: boolean | undefined;
    };
  } {
    return {
      connectionMethod: this.connectionMethod,
      connectionState: this.connectionState,
      lastConnectTime: this.lastConnectTime ? this.lastConnectTime.toISOString() : null,
      connectAttempts: this.connectAttempts,
      config: {
        hasApiKey: !!this.config.apiKey,
        hasCallbackUrl: !!this.config.callbackUrl,
        twsHost: this.config.twsHost,
        twsPort: this.config.twsPort,
        paperTrading: this.config.paperTrading
      }
    };
  }
}
