
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import * as endpoints from './endpoints';

/**
 * Authentication helper for Schwab API
 */
export class SchwabAuth {
  private config: DataProviderConfig;
  private redirectUri: string;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    
    // Use the provided callback URL or default to a secure URL structure
    // Note: Schwab requires HTTPS for callback URLs, even for development
    if (config.callbackUrl) {
      this.redirectUri = config.callbackUrl;
    } else {
      // Default to production URL if in production mode
      if (process.env.NODE_ENV === 'production') {
        this.redirectUri = window.location.origin + '/auth/callback';
      } else {
        // For development, we can use either the actual production domain or the placeholder
        this.redirectUri = 'https://your-production-domain.com/auth/callback';
        console.log('Using registered production callback URL for Schwab authentication');
      }
    }
    
    console.log('Using redirect URI:', this.redirectUri);
  }
  
  /**
   * Get OAuth URL for authorization
   */
  getAuthorizationUrl(): string {
    if (!this.config.apiKey) {
      throw new Error("API Key is required for OAuth flow");
    }
    
    // Build the OAuth authorization URL with required parameters
    const params = new URLSearchParams({
      client_id: this.config.apiKey,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid profile email offline_access trade',
      state: this.generateStateParam()
    });
    
    return `${endpoints.OAUTH_AUTHORIZE_URL}?${params.toString()}`;
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
    if (!authCode) {
      throw new Error("Authorization code is required");
    }
    
    // In a real implementation, we would make an API call to exchange the auth code
    // for an access token using the token endpoint
    console.log("Exchanging auth code for access token:", authCode);
    
    try {
      // For development purposes, we'll simulate a successful response
      // In production, this would be a fetch call to the token endpoint
      return {
        accessToken: "mock-schwab-access-token-" + Date.now(),
        refreshToken: "mock-schwab-refresh-token-" + Date.now(),
        expiresIn: 3600, // 1 hour
        tokenType: "Bearer"
      };
      
      // The actual implementation would look like this:
      /*
      const response = await fetch(endpoints.OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: authCode,
          client_id: this.config.apiKey,
          client_secret: this.config.secretKey,
          redirect_uri: this.redirectUri
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error || response.statusText}`);
      }
      
      return await response.json();
      */
    } catch (error) {
      console.error("Error exchanging code for token:", error);
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
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }
    
    console.log("Refreshing access token with refresh token:", refreshToken);
    
    try {
      // For development purposes, we'll simulate a successful response
      return {
        accessToken: "mock-schwab-access-token-refreshed-" + Date.now(),
        refreshToken: "mock-schwab-refresh-token-new-" + Date.now(),
        expiresIn: 3600, // 1 hour
        tokenType: "Bearer"
      };
      
      // The actual implementation would look like this:
      /*
      const response = await fetch(endpoints.OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.config.apiKey,
          client_secret: this.config.secretKey
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error || response.statusText}`);
      }
      
      return await response.json();
      */
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }
  
  /**
   * Generate a random state parameter for CSRF protection
   */
  private generateStateParam(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Verify the state parameter returned by the OAuth provider
   */
  verifyStateParam(returnedState: string, originalState: string): boolean {
    return returnedState === originalState;
  }
}
