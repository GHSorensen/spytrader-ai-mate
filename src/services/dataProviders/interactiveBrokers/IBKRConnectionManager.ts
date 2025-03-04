
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { IBKRAuth } from "./auth";
import { TwsConnectionManager } from "./tws/TwsConnectionManager";
import { toast } from "sonner";

/**
 * Manages connections to Interactive Brokers
 */
export class IBKRConnectionManager {
  private config: DataProviderConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private twsConnectionManager: TwsConnectionManager;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    this.twsConnectionManager = new TwsConnectionManager(config);
  }
  
  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }
  
  /**
   * Get the token expiry date
   */
  getTokenExpiry(): Date | null {
    return this.tokenExpiry;
  }
  
  /**
   * Connect to Interactive Brokers
   */
  async connect(auth: IBKRAuth): Promise<boolean> {
    const connectionMethod = this.config.connectionMethod || 'webapi';
    
    if (connectionMethod === 'tws') {
      return this.connectViaTws();
    } else {
      return this.connectViaWebApi(auth);
    }
  }
  
  /**
   * Connect via TWS
   */
  private async connectViaTws(): Promise<boolean> {
    const connected = await this.twsConnectionManager.connect();
    return connected;
  }
  
  /**
   * Connect via Web API
   */
  private async connectViaWebApi(auth: IBKRAuth): Promise<boolean> {
    try {
      if (this.config.refreshToken) {
        const authResult = await auth.refreshAccessToken(this.config.refreshToken);
        this.accessToken = authResult.accessToken;
        
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + authResult.expiresIn);
        this.tokenExpiry = expiryDate;
        return true;
      }
      
      if (this.config.accessToken) {
        this.accessToken = this.config.accessToken;
        
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1); // Assume 1 hour expiry
        this.tokenExpiry = expiryDate;
        return true;
      }
      
      toast.error("Connection Required", {
        description: "Please complete the Interactive Brokers authorization process.",
      });
      
      return false;
    } catch (error) {
      console.error("Error in Web API connection:", error);
      return false;
    }
  }
}
