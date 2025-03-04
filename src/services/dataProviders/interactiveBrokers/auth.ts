
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import * as endpoints from './endpoints';

/**
 * Authentication helper for Interactive Brokers API
 */
export class IBKRAuth {
  private config: DataProviderConfig;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
  }
  
  /**
   * Get OAuth URL for authorization
   * Based on IBKR Web API documentation at:
   * https://www.interactivebrokers.com/campus/ibkr-api-page/web-api/#getting-started-1
   */
  getAuthorizationUrl(): string {
    if (!this.config.callbackUrl) {
      throw new Error("Callback URL is required for OAuth flow");
    }
    
    if (!this.config.apiKey) {
      throw new Error("API Key is required for OAuth flow");
    }
    
    console.log("Generating auth URL with:", {
      clientId: this.config.apiKey,
      redirectUri: this.config.callbackUrl
    });
    
    // Updated to match the official IBKR authorization endpoint format
    return `${endpoints.AUTH_BASE_URL}/oauth/authorize?client_id=${this.config.apiKey}&redirect_uri=${encodeURIComponent(this.config.callbackUrl)}&response_type=code&scope=trading`;
  }
  
  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(authCode: string): Promise<{ accessToken: string, refreshToken: string, expiresIn: number }> {
    console.log("Exchanging auth code for access token", authCode);
    
    if (!this.config.apiKey) {
      throw new Error("API Key is required for token exchange");
    }
    
    // In a real implementation, this would call the IBKR token endpoint with:
    // - client_id (API key)
    // - client_secret (if required by IBKR)
    // - grant_type=authorization_code
    // - code=authCode
    // - redirect_uri=this.config.callbackUrl
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock token response 
      // In production, this would be a real API call to IBKR's token endpoint
      return {
        accessToken: `mock-ibkr-access-token-${Date.now()}`,
        refreshToken: `mock-ibkr-refresh-token-${Date.now()}`,
        expiresIn: 3600 // 1 hour
      };
    } catch (error) {
      console.error("Error exchanging auth code for tokens:", error);
      throw new Error("Failed to exchange authorization code for access token");
    }
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string, refreshToken: string, expiresIn: number }> {
    console.log("Refreshing access token with refresh token", refreshToken);
    
    if (!this.config.apiKey) {
      throw new Error("API Key is required for token refresh");
    }
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock token refresh response
      // In production, this would be a real API call to IBKR's token endpoint with:
      // - client_id (API key)
      // - client_secret (if required by IBKR)
      // - grant_type=refresh_token
      // - refresh_token=refreshToken
      return {
        accessToken: `mock-ibkr-access-token-refreshed-${Date.now()}`,
        refreshToken: `mock-ibkr-refresh-token-new-${Date.now()}`,
        expiresIn: 3600 // 1 hour
      };
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw new Error("Failed to refresh access token");
    }
  }
  
  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    console.log("Validating access token", accessToken);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In production, this would make a lightweight API call to IBKR
      // to verify the token is still valid
      return accessToken.includes('mock-ibkr-access-token');
    } catch (error) {
      console.error("Error validating access token:", error);
      return false;
    }
  }
}
