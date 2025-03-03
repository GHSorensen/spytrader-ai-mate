
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import * as endpoints from '../endpoints';
import { toast } from "@/components/ui/use-toast";

/**
 * Handles token exchange and refresh operations
 */
export class TokenExchanger {
  private config: DataProviderConfig;
  private redirectUri: string;
  
  constructor(config: DataProviderConfig, redirectUri: string) {
    this.config = config;
    this.redirectUri = redirectUri;
    console.log('[TokenExchanger] Initialized with redirect URI:', this.redirectUri);
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
        console.error(`[TokenExchanger] Token exchange error: ${error}`);
        throw new Error(error);
      }
      
      console.log(`[TokenExchanger] Exchanging auth code for access token: ${authCode.substring(0, 5)}...`);
      
      // For development purposes, we'll simulate a successful response
      // In production, this would be a fetch call to the token endpoint
      if (process.env.NODE_ENV === 'development') {
        console.log("[TokenExchanger] DEV MODE: Simulating token exchange response");
        
        // Simulate network delay for more realistic testing
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockResponse = {
          accessToken: "mock-schwab-access-token-" + Date.now(),
          refreshToken: "mock-schwab-refresh-token-" + Date.now(),
          expiresIn: 3600, // 1 hour
          tokenType: "Bearer"
        };
        
        console.log("[TokenExchanger] DEV MODE: Token exchange successful");
        return mockResponse;
      }
      
      // The actual implementation for production
      console.log("[TokenExchanger] PROD MODE: Making real token exchange request");
      console.log(`[TokenExchanger] Token exchange request to: ${endpoints.OAUTH_TOKEN_URL}`);
      console.log(`[TokenExchanger] Using redirect URI: ${this.redirectUri}`);
      
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
      
      console.log(`[TokenExchanger] Token exchange response status: ${response.status}`);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("[TokenExchanger] Token exchange error response:", errorData);
        } catch (e) {
          console.error("[TokenExchanger] Failed to parse error response:", e);
          errorData = { error: "unknown_error", error_description: "Unknown error occurred" };
        }
        
        const errorMessage = errorData.error_description || errorData.error || response.statusText;
        console.error(`[TokenExchanger] Token exchange failed: ${errorMessage}`);
        
        throw new Error(`Token exchange failed: ${errorMessage}`);
      }
      
      const tokenData = await response.json();
      console.log("[TokenExchanger] Token exchange successful");
      
      // Map response to our expected format
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type
      };
    } catch (error) {
      console.error("[TokenExchanger] Error exchanging code for token:", error);
      
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
        console.error(`[TokenExchanger] Token refresh error: ${error}`);
        throw new Error(error);
      }
      
      console.log(`[TokenExchanger] Refreshing access token with refresh token: ${refreshToken.substring(0, 5)}...`);
      
      // For development purposes, simulate successful response
      if (process.env.NODE_ENV === 'development') {
        console.log("[TokenExchanger] DEV MODE: Simulating token refresh response");
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockResponse = {
          accessToken: "mock-schwab-access-token-refreshed-" + Date.now(),
          refreshToken: "mock-schwab-refresh-token-new-" + Date.now(),
          expiresIn: 3600, // 1 hour
          tokenType: "Bearer"
        };
        
        console.log("[TokenExchanger] DEV MODE: Token refresh successful");
        return mockResponse;
      }
      
      // The actual implementation for production
      console.log("[TokenExchanger] PROD MODE: Making real token refresh request");
      
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
      
      console.log(`[TokenExchanger] Token refresh response status: ${response.status}`);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("[TokenExchanger] Token refresh error response:", errorData);
        } catch (e) {
          console.error("[TokenExchanger] Failed to parse error response:", e);
          errorData = { error: "unknown_error", error_description: "Unknown error occurred" };
        }
        
        const errorMessage = errorData.error_description || errorData.error || response.statusText;
        console.error(`[TokenExchanger] Token refresh failed: ${errorMessage}`);
        
        throw new Error(`Token refresh failed: ${errorMessage}`);
      }
      
      const tokenData = await response.json();
      console.log("[TokenExchanger] Token refresh successful");
      
      // Map response to our expected format
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken, // Some OAuth providers don't return a new refresh token
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type
      };
    } catch (error) {
      console.error("[TokenExchanger] Error refreshing token:", error);
      
      toast({
        title: "Authentication Refresh Failed",
        description: error instanceof Error ? error.message : "Unknown error refreshing authentication",
        variant: "destructive",
      });
      
      throw error;
    }
  }
}
