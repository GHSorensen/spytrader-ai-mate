
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { SchwabAuth } from "./auth";
import { TokenManager } from "./TokenManager";
import { OAuthCallbackHandler } from "./OAuthCallbackHandler";
import { toast } from "@/components/ui/use-toast";

export class SchwabAuthManager {
  private auth: SchwabAuth;
  private config: DataProviderConfig;
  private tokenManager: TokenManager;
  private callbackHandler: OAuthCallbackHandler;
  private updateTokens: (accessToken: string, refreshToken: string, expiryTime: Date) => void;
  private updateConnectionStatus: (connected: boolean, errorMessage?: string) => void;

  constructor(
    config: DataProviderConfig,
    updateTokens: (accessToken: string, refreshToken: string, expiryTime: Date) => void,
    updateConnectionStatus: (connected: boolean, errorMessage?: string) => void
  ) {
    // Ensure the callbackUrl is properly set for Schwab's HTTPS requirement
    if (!config.callbackUrl || !config.callbackUrl.startsWith('https://')) {
      console.warn('Schwab requires HTTPS for callback URLs. Updating config with secure URL.');
      
      // Use a placeholder URL that will be replaced with your actual domain when deployed
      config.callbackUrl = 'https://lovable-app-deployment.com/auth/callback';
      
      // Show a toast to notify the user about the callback URL requirement
      toast({
        title: "Callback URL Notice",
        description: "Using placeholder HTTPS URL. After deployment, register your actual domain in the Schwab Developer Portal.",
      });
    }
    
    this.config = config;
    this.auth = new SchwabAuth(config);
    this.updateTokens = updateTokens;
    this.updateConnectionStatus = updateConnectionStatus;
    
    // Initialize token manager
    this.tokenManager = new TokenManager(updateTokens, updateConnectionStatus);
    // Set the refresh callback
    this.tokenManager.setRefreshCallback(this.refreshToken.bind(this));
    
    // Initialize callback handler
    this.callbackHandler = new OAuthCallbackHandler(this.auth, this.tokenManager);
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    try {
      return this.auth.getAuthorizationUrl();
    } catch (error) {
      console.error("Failed to generate authorization URL:", error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleOAuthCallback(code: string, state?: string): Promise<boolean> {
    return this.callbackHandler.handleCallback(code, state);
  }

  /**
   * Connect to Schwab API - basic connection or OAuth flow
   */
  async connect(): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        throw new Error("Schwab API key not provided");
      }

      // Check if we have a refresh token to use
      if (this.config.refreshToken) {
        return this.refreshToken();
      }
      
      // For development without real OAuth flow, we simulate successful connection
      if (process.env.NODE_ENV === 'development') {
        console.log("Development mode: Simulating successful connection to Schwab API");
        
        // Mock token for development
        const accessToken = "mock-schwab-token-" + Date.now();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour
        
        this.updateTokens(accessToken, "mock-refresh-token", tokenExpiry);
        this.updateConnectionStatus(true);
        
        toast({
          title: "Schwab Connected (Dev Mode)",
          description: "Successfully connected to Schwab API in development mode",
        });
        
        return true;
      }
      
      // In production, we would initiate the OAuth flow by redirecting
      // to the authorization URL, but we can't do redirects within this service
      // So we'll return false and let the UI handle the redirect
      return false;
    } catch (error) {
      console.error("Schwab connection error:", error);
      
      this.updateConnectionStatus(false, error instanceof Error ? error.message : "Unknown error");
      
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
    try {
      if (!this.config.refreshToken) {
        throw new Error("No refresh token available");
      }
      
      const tokenResponse = await this.auth.refreshAccessToken(this.config.refreshToken);
      
      // Use token manager to handle the token update
      this.tokenManager.handleTokenUpdate(tokenResponse);
      
      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      
      this.updateConnectionStatus(false, error instanceof Error ? error.message : "Token refresh failed");
      
      // Clear tokens on refresh failure
      this.clearTokens();
      
      return false;
    }
  }

  /**
   * Clear all tokens and intervals
   */
  clearTokens(): void {
    this.tokenManager.clearTokens();
  }
}
