
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
    console.log("[SchwabAuthManager] Initializing with config:", {
      type: config.type,
      hasApiKey: !!config.apiKey,
      hasSecretKey: !!config.secretKey,
      callbackUrl: config.callbackUrl,
      hasRefreshToken: !!config.refreshToken,
      paperTrading: config.paperTrading
    });
    
    // Ensure the callbackUrl is properly set for Schwab's HTTPS requirement
    if (!config.callbackUrl || !config.callbackUrl.startsWith('https://')) {
      console.warn('[SchwabAuthManager] Schwab requires HTTPS for callback URLs. Updating config with secure URL.');
      
      // Use the current origin if in production, or development placeholder otherwise
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const callbackPath = '/auth/callback';
      
      if (process.env.NODE_ENV === 'production' && origin.startsWith('https://')) {
        // In production, use the actual window origin
        config.callbackUrl = origin + callbackPath;
        console.log(`[SchwabAuthManager] Using production domain for callback URL: ${config.callbackUrl}`);
      } else {
        // In development, use a placeholder
        config.callbackUrl = 'https://dev-placeholder.com/auth/callback';
        console.log('[SchwabAuthManager] Using development placeholder for callback URL. Will use actual domain in production.');
      }
      
      // Show a toast to notify the user about the callback URL
      toast({
        title: "Callback URL Notice",
        description: process.env.NODE_ENV === 'production' 
          ? `Using ${config.callbackUrl} for Schwab authentication.`
          : "Using development placeholder. Will use actual domain in production.",
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
    
    // Pass the state parameter to the callback handler if it exists
    const stateParam = this.auth.getStateParam();
    if (stateParam) {
      this.callbackHandler.setStateParam(stateParam);
      console.log(`[SchwabAuthManager] Set state parameter on callback handler: ${stateParam.substring(0, 5)}...`);
    }
  }

  /**
   * Get OAuth authorization URL and pass state parameter to callback handler
   */
  getAuthorizationUrl(): string {
    try {
      console.log("[SchwabAuthManager] Generating authorization URL");
      const url = this.auth.getAuthorizationUrl();
      
      // Pass the state parameter to the callback handler
      const stateParam = this.auth.getStateParam();
      if (stateParam) {
        this.callbackHandler.setStateParam(stateParam);
        console.log(`[SchwabAuthManager] Updated state parameter on callback handler: ${stateParam.substring(0, 5)}...`);
      }
      
      return url;
    } catch (error) {
      console.error("[SchwabAuthManager] Failed to generate authorization URL:", error);
      
      this.updateConnectionStatus(
        false, 
        error instanceof Error ? error.message : "Failed to generate authorization URL"
      );
      
      throw error;
    }
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleOAuthCallback(code: string, state?: string): Promise<boolean> {
    console.log(`[SchwabAuthManager] Handling OAuth callback with code: ${code.substring(0, 5)}... and state: ${state ? state.substring(0, 5) + '...' : 'undefined'}`);
    
    try {
      const success = await this.callbackHandler.handleCallback(code, state);
      
      if (success) {
        console.log("[SchwabAuthManager] OAuth callback handled successfully");
        this.updateConnectionStatus(true);
      } else {
        console.error("[SchwabAuthManager] OAuth callback failed");
        this.updateConnectionStatus(false, "Failed to process authentication response");
      }
      
      return success;
    } catch (error) {
      console.error("[SchwabAuthManager] Error handling OAuth callback:", error);
      
      this.updateConnectionStatus(
        false, 
        error instanceof Error ? error.message : "Unknown error processing authentication"
      );
      
      return false;
    }
  }

  /**
   * Connect to Schwab API - basic connection or OAuth flow
   */
  async connect(): Promise<boolean> {
    console.log("[SchwabAuthManager] Attempting to connect to Schwab API");
    
    try {
      if (!this.config.apiKey) {
        const error = "Schwab API key not provided";
        console.error(`[SchwabAuthManager] Connection error: ${error}`);
        throw new Error(error);
      }

      // Check if we have a refresh token to use
      if (this.config.refreshToken) {
        console.log("[SchwabAuthManager] Refresh token found, attempting to refresh connection");
        return this.refreshToken();
      }
      
      // For development without real OAuth flow, we simulate successful connection
      if (process.env.NODE_ENV === 'development') {
        console.log("[SchwabAuthManager] Development mode: Simulating successful connection to Schwab API");
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
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
      
      // In production, we can't do redirects within this service
      console.log("[SchwabAuthManager] In production, OAuth flow requires UI redirection");
      return false;
    } catch (error) {
      console.error("[SchwabAuthManager] Schwab connection error:", error);
      
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
    console.log("[SchwabAuthManager] Attempting to refresh token");
    
    try {
      if (!this.config.refreshToken) {
        const error = "No refresh token available";
        console.error(`[SchwabAuthManager] Token refresh error: ${error}`);
        throw new Error(error);
      }
      
      console.log(`[SchwabAuthManager] Using refresh token: ${this.config.refreshToken.substring(0, 5)}...`);
      
      const tokenResponse = await this.auth.refreshAccessToken(this.config.refreshToken);
      console.log("[SchwabAuthManager] Token refresh successful");
      
      // Use token manager to handle the token update
      this.tokenManager.handleTokenUpdate(tokenResponse);
      
      // Show success toast
      toast({
        title: "Authentication Refreshed",
        description: "Successfully refreshed Schwab API authentication",
      });
      
      return true;
    } catch (error) {
      console.error("[SchwabAuthManager] Token refresh error:", error);
      
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
    console.log("[SchwabAuthManager] Clearing all tokens and refresh intervals");
    this.tokenManager.clearTokens();
  }
}
