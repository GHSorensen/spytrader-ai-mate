
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import * as endpoints from '../endpoints';
import { toast } from "@/components/ui/use-toast";
import { generateStateParam } from "../utils/stateParamUtils";
import { ensureSecureCallbackUrl } from "../utils/callbackUrlUtils";

/**
 * Handles generation of OAuth authorization URLs
 */
export class AuthUrlGenerator {
  private config: DataProviderConfig;
  private redirectUri: string;
  private stateParam: string | null = null;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    
    // Ensure the callback URL is HTTPS
    this.redirectUri = ensureSecureCallbackUrl(config);
    
    console.log('[AuthUrlGenerator] Configured with redirect URI:', this.redirectUri);
  }

  /**
   * Get OAuth URL for authorization
   */
  getAuthorizationUrl(): string {
    try {
      if (!this.config.apiKey) {
        const error = "API Key is required for OAuth flow";
        console.error(`[AuthUrlGenerator] Authorization URL error: ${error}`);
        throw new Error(error);
      }
      
      // Generate and store the state parameter for CSRF protection
      this.stateParam = generateStateParam();
      console.log(`[AuthUrlGenerator] Generated state parameter for CSRF protection: ${this.stateParam.substring(0, 5)}...`);
      
      // Build the OAuth authorization URL with required parameters
      const params = new URLSearchParams({
        client_id: this.config.apiKey,
        redirect_uri: this.redirectUri,
        response_type: 'code',
        scope: 'openid profile email offline_access trade',
        state: this.stateParam
      });
      
      const authUrl = `${endpoints.OAUTH_AUTHORIZE_URL}?${params.toString()}`;
      console.log(`[AuthUrlGenerator] Generated authorization URL (partial): ${authUrl.substring(0, 100)}...`);
      
      return authUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error generating authorization URL";
      console.error(`[AuthUrlGenerator] Error generating authorization URL:`, error);
      
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
}
