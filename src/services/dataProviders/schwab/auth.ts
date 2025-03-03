
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import * as endpoints from './endpoints';
import { toast } from "@/components/ui/use-toast";

/**
 * Authentication helper for Schwab API
 */
export class SchwabAuth {
  private config: DataProviderConfig;
  private redirectUri: string;
  private stateParam: string | null = null;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    
    // Use the provided callback URL or default to a secure URL structure
    // Note: Schwab requires HTTPS for callback URLs, even for development
    if (config.callbackUrl) {
      this.redirectUri = config.callbackUrl;
    } else {
      // Get the current origin if in a browser environment
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const callbackPath = '/auth/callback';
      
      // Default to current origin in production if it's HTTPS
      if (process.env.NODE_ENV === 'production' && origin.startsWith('https://')) {
        this.redirectUri = origin + callbackPath;
      } else {
        // For development, use a placeholder
        this.redirectUri = 'https://dev-placeholder.com/auth/callback';
        console.log('Using development placeholder for callback URL. Will use actual domain in production.');
      }
    }
    
    console.log('[SchwabAuth] Configured with redirect URI:', this.redirectUri);
  }
  
  /**
   * Get OAuth URL for authorization
   */
  getAuthorizationUrl(): string {
    try {
      if (!this.config.apiKey) {
        const error = "API Key is required for OAuth flow";
        console.error(`[SchwabAuth] Authorization URL error: ${error}`);
        throw new Error(error);
      }
      
      // Generate and store the state parameter for CSRF protection
      this.stateParam = this.generateStateParam();
      console.log(`[SchwabAuth] Generated state parameter for CSRF protection: ${this.stateParam.substring(0, 5)}...`);
      
      // Build the OAuth authorization URL with required parameters
      const params = new URLSearchParams({
        client_id: this.config.apiKey,
        redirect_uri: this.redirectUri,
        response_type: 'code',
        scope: 'openid profile email offline_access trade',
        state: this.stateParam
      });
      
      const authUrl = `${endpoints.OAUTH_AUTHORIZE_URL}?${params.toString()}`;
      console.log(`[SchwabAuth] Generated authorization URL (partial): ${authUrl.substring(0, 100)}...`);
      
      return authUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error generating authorization URL";
      console.error(`[SchwabAuth] Error generating authorization URL:`, error);
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  }
  
  /**
   * Get the stored state parameter
   */
  getStateParam(): string | null {
    return this.stateParam;
  }
  
  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(authCode: string): Promise<{ 
    accessToken: string, 
    refreshToken: string, 
    expiresIn: number,
    tokenType: string
  }> {
    try {
      if (!authCode) {
        const error = "Authorization code is required";
        console.error(`[SchwabAuth] Token exchange error: ${error}`);
        throw new Error(error);
      }
      
      console.log(`[SchwabAuth] Exchanging auth code for access token: ${authCode.substring(0, 5)}...`);
      
      // For development purposes, we'll simulate a successful response
      // In production, this would be a fetch call to the token endpoint
      if (process.env.NODE_ENV === 'development') {
        console.log("[SchwabAuth] DEV MODE: Simulating token exchange response");
        
        // Simulate network delay for more realistic testing
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockResponse = {
          accessToken: "mock-schwab-access-token-" + Date.now(),
          refreshToken: "mock-schwab-refresh-token-" + Date.now(),
          expiresIn: 3600, // 1 hour
          tokenType: "Bearer"
        };
        
        console.log("[SchwabAuth] DEV MODE: Token exchange successful");
        return mockResponse;
      }
      
      // The actual implementation for production
      console.log("[SchwabAuth] PROD MODE: Making real token exchange request");
      console.log(`[SchwabAuth] Token exchange request to: ${endpoints.OAUTH_TOKEN_URL}`);
      console.log(`[SchwabAuth] Using redirect URI: ${this.redirectUri}`);
      
      const response = await fetch(endpoints.OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: authCode,
          client_id: this.config.apiKey,
          client_secret: this.config.secretKey || '',
          redirect_uri: this.redirectUri
        })
      });
      
      console.log(`[SchwabAuth] Token exchange response status: ${response.status}`);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("[SchwabAuth] Token exchange error response:", errorData);
        } catch (e) {
          console.error("[SchwabAuth] Failed to parse error response:", e);
          errorData = { error: "unknown_error", error_description: "Unknown error occurred" };
        }
        
        const errorMessage = errorData.error_description || errorData.error || response.statusText;
        console.error(`[SchwabAuth] Token exchange failed: ${errorMessage}`);
        
        throw new Error(`Token exchange failed: ${errorMessage}`);
      }
      
      const tokenData = await response.json();
      console.log("[SchwabAuth] Token exchange successful");
      
      // Map response to our expected format
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type
      };
    } catch (error) {
      console.error("[SchwabAuth] Error exchanging code for token:", error);
      
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Unknown authentication error",
        variant: "destructive",
      });
      
      throw error;
    }
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ 
    accessToken: string, 
    refreshToken: string, 
    expiresIn: number,
    tokenType: string
  }> {
    try {
      if (!refreshToken) {
        const error = "Refresh token is required";
        console.error(`[SchwabAuth] Token refresh error: ${error}`);
        throw new Error(error);
      }
      
      console.log(`[SchwabAuth] Refreshing access token with refresh token: ${refreshToken.substring(0, 5)}...`);
      
      // For development purposes, simulate successful response
      if (process.env.NODE_ENV === 'development') {
        console.log("[SchwabAuth] DEV MODE: Simulating token refresh response");
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockResponse = {
          accessToken: "mock-schwab-access-token-refreshed-" + Date.now(),
          refreshToken: "mock-schwab-refresh-token-new-" + Date.now(),
          expiresIn: 3600, // 1 hour
          tokenType: "Bearer"
        };
        
        console.log("[SchwabAuth] DEV MODE: Token refresh successful");
        return mockResponse;
      }
      
      // The actual implementation for production
      console.log("[SchwabAuth] PROD MODE: Making real token refresh request");
      
      const response = await fetch(endpoints.OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.config.apiKey,
          client_secret: this.config.secretKey || ''
        })
      });
      
      console.log(`[SchwabAuth] Token refresh response status: ${response.status}`);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("[SchwabAuth] Token refresh error response:", errorData);
        } catch (e) {
          console.error("[SchwabAuth] Failed to parse error response:", e);
          errorData = { error: "unknown_error", error_description: "Unknown error occurred" };
        }
        
        const errorMessage = errorData.error_description || errorData.error || response.statusText;
        console.error(`[SchwabAuth] Token refresh failed: ${errorMessage}`);
        
        throw new Error(`Token refresh failed: ${errorMessage}`);
      }
      
      const tokenData = await response.json();
      console.log("[SchwabAuth] Token refresh successful");
      
      // Map response to our expected format
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken, // Some OAuth providers don't return a new refresh token
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type
      };
    } catch (error) {
      console.error("[SchwabAuth] Error refreshing token:", error);
      
      toast({
        title: "Authentication Refresh Failed",
        description: error instanceof Error ? error.message : "Unknown error refreshing authentication",
        variant: "destructive",
      });
      
      throw error;
    }
  }
  
  /**
   * Generate a random state parameter for CSRF protection
   */
  private generateStateParam(): string {
    const randomString = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    console.log(`[SchwabAuth] Generated state parameter: ${randomString.substring(0, 5)}...`);
    return randomString;
  }
  
  /**
   * Verify the state parameter returned by the OAuth provider
   */
  verifyStateParam(returnedState: string, originalState: string): boolean {
    console.log(`[SchwabAuth] Verifying state parameter: 
      - Returned: ${returnedState.substring(0, 5)}...
      - Original: ${originalState.substring(0, 5)}...`);
    
    const isValid = returnedState === originalState;
    console.log(`[SchwabAuth] State parameter verification ${isValid ? 'succeeded' : 'failed'}`);
    
    return isValid;
  }
}
