
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { SchwabAuth } from "../auth";
import { TokenManager } from "../TokenManager";
import { toast } from "@/components/ui/use-toast";

/**
 * Manages connection to Schwab API and token refresh
 */
export class SchwabConnectionManager {
  private auth: SchwabAuth;
  private config: DataProviderConfig;
  private tokenManager: TokenManager;
  private updateConnectionStatus: (connected: boolean, errorMessage?: string) => void;

  constructor(
    auth: SchwabAuth,
    tokenManager: TokenManager,
    config: DataProviderConfig,
    updateConnectionStatus: (connected: boolean, errorMessage?: string) => void
  ) {
    this.auth = auth;
    this.config = config;
    this.tokenManager = tokenManager;
    this.updateConnectionStatus = updateConnectionStatus;
  }

  /**
   * Connect to Schwab API - basic connection or OAuth flow
   */
  async connect(): Promise<boolean> {
    console.log("[SchwabConnectionManager] Attempting to connect to Schwab API");
    
    try {
      if (!this.config.apiKey) {
        const error = "Schwab API key not provided";
        console.error(`[SchwabConnectionManager] Connection error: ${error}`);
        throw new Error(error);
      }

      // Check if we have a refresh token to use
      if (this.config.refreshToken) {
        console.log("[SchwabConnectionManager] Refresh token found, attempting to refresh connection");
        return this.refreshToken();
      }
      
      // For development without real OAuth flow, we simulate successful connection
      if (process.env.NODE_ENV === 'development') {
        console.log("[SchwabConnectionManager] Development mode: Simulating successful connection to Schwab API");
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock token for development
        const accessToken = "mock-schwab-token-" + Date.now();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour
        
        this.tokenManager.handleTokenUpdate({
          accessToken: accessToken,
          refreshToken: "mock-refresh-token",
          expiresIn: 3600
        });
        
        this.updateConnectionStatus(true);
        
        toast({
          title: "Schwab Connected (Dev Mode)",
          description: "Successfully connected to Schwab API in development mode",
        });
        
        return true;
      }
      
      // In production, we can't do redirects within this service
      console.log("[SchwabConnectionManager] In production, OAuth flow requires UI redirection");
      return false;
    } catch (error) {
      console.error("[SchwabConnectionManager] Schwab connection error:", error);
      
      this.updateConnectionStatus(
        false, 
        error instanceof Error ? error.message : "Unknown connection error"
      );
      
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      
      return false;
    }
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    console.log("[SchwabConnectionManager] Attempting to refresh token");
    
    try {
      if (!this.config.refreshToken) {
        const error = "No refresh token available";
        console.error(`[SchwabConnectionManager] Token refresh error: ${error}`);
        throw new Error(error);
      }
      
      console.log(`[SchwabConnectionManager] Using refresh token: ${this.config.refreshToken.substring(0, 5)}...`);
      
      const tokenResponse = await this.auth.refreshAccessToken(this.config.refreshToken);
      console.log("[SchwabConnectionManager] Token refresh successful");
      
      // Use token manager to handle the token update
      this.tokenManager.handleTokenUpdate(tokenResponse);
      
      // Show success toast
      toast({
        title: "Authentication Refreshed",
        description: "Successfully refreshed Schwab API authentication",
      });
      
      return true;
    } catch (error) {
      console.error("[SchwabConnectionManager] Token refresh error:", error);
      
      this.updateConnectionStatus(
        false, 
        error instanceof Error ? error.message : "Token refresh failed"
      );
      
      // Clear tokens on refresh failure
      this.clearTokens();
      
      return false;
    }
  }

  /**
   * Clear all tokens and intervals
   */
  clearTokens(): void {
    console.log("[SchwabConnectionManager] Clearing all tokens and refresh intervals");
    this.tokenManager.clearTokens();
  }
}
