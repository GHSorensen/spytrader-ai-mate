
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { AuthUrlGenerator } from "./auth/AuthUrlGenerator";
import { TokenExchanger } from "./auth/TokenExchanger";
import { verifyStateParam } from "./utils/stateParamUtils";
import { ensureSecureCallbackUrl } from "./utils/callbackUrlUtils";

/**
 * Authentication helper for Schwab API
 */
export class SchwabAuth {
  private config: DataProviderConfig;
  private authUrlGenerator: AuthUrlGenerator;
  private tokenExchanger: TokenExchanger;
  private redirectUri: string;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    
    // Ensure the callback URL is HTTPS
    this.redirectUri = ensureSecureCallbackUrl(config);
    
    // Initialize component classes
    this.authUrlGenerator = new AuthUrlGenerator(config);
    this.tokenExchanger = new TokenExchanger(config, this.redirectUri);
    
    console.log('[SchwabAuth] Initialized with redirect URI:', this.redirectUri);
  }
  
  /**
   * Get OAuth URL for authorization
   */
  getAuthorizationUrl(): string {
    return this.authUrlGenerator.getAuthorizationUrl();
  }
  
  /**
   * Get the stored state parameter
   */
  getStateParam(): string | null {
    return this.authUrlGenerator.getStateParam();
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
    return this.tokenExchanger.getAccessToken(authCode);
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
    return this.tokenExchanger.refreshAccessToken(refreshToken);
  }
  
  /**
   * Verify the state parameter returned by the OAuth provider
   */
  verifyStateParam(returnedState: string, originalState: string): boolean {
    return verifyStateParam(returnedState, originalState);
  }
}
