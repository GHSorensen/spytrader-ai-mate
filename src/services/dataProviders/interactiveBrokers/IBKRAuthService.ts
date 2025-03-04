
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { IBKRAuth } from "./auth";
import { toast } from "sonner";

/**
 * Handles authentication for Interactive Brokers
 */
export class IBKRAuthService {
  private auth: IBKRAuth;
  private config: DataProviderConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    this.auth = new IBKRAuth(config);
  }
  
  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }
  
  /**
   * Get token expiry date
   */
  getTokenExpiry(): Date | null {
    return this.tokenExpiry;
  }
  
  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }
  
  /**
   * Set token expiry
   */
  setTokenExpiry(expiry: Date): void {
    this.tokenExpiry = expiry;
  }
  
  /**
   * Check if token is valid
   */
  isAccessTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }
    
    return this.tokenExpiry > new Date();
  }
  
  /**
   * Handle authentication as part of connection process
   */
  async authenticate(): Promise<boolean> {
    try {
      if (this.config.refreshToken) {
        const authResult = await this.auth.refreshAccessToken(this.config.refreshToken);
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
      
      toast.error("Authentication Required", {
        description: "Please complete the Interactive Brokers authorization process.",
      });
      
      return false;
    } catch (error) {
      console.error("Error during authentication:", error);
      toast.error("Authentication Error", {
        description: error instanceof Error ? error.message : "Unknown error during authentication",
      });
      return false;
    }
  }
}
