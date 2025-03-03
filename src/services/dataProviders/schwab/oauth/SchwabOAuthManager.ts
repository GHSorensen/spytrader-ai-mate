
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { SchwabAuth } from "../auth";
import { TokenManager } from "../TokenManager";
import { OAuthCallbackHandler } from "../OAuthCallbackHandler";
import { toast } from "@/components/ui/use-toast";

/**
 * Manages the OAuth authentication flow for Schwab API
 */
export class SchwabOAuthManager {
  private auth: SchwabAuth;
  private tokenManager: TokenManager;
  private callbackHandler: OAuthCallbackHandler;

  constructor(
    auth: SchwabAuth,
    tokenManager: TokenManager,
    config: DataProviderConfig
  ) {
    this.auth = auth;
    this.tokenManager = tokenManager;
    
    // Initialize callback handler
    this.callbackHandler = new OAuthCallbackHandler(this.auth, this.tokenManager);
    
    // Pass the state parameter to the callback handler if it exists
    const stateParam = this.auth.getStateParam();
    if (stateParam) {
      this.callbackHandler.setStateParam(stateParam);
      console.log(`[SchwabOAuthManager] Set state parameter on callback handler: ${stateParam.substring(0, 5)}...`);
    }
  }

  /**
   * Get OAuth authorization URL and pass state parameter to callback handler
   */
  getAuthorizationUrl(): string {
    try {
      console.log("[SchwabOAuthManager] Generating authorization URL");
      const url = this.auth.getAuthorizationUrl();
      
      // Pass the state parameter to the callback handler
      const stateParam = this.auth.getStateParam();
      if (stateParam) {
        this.callbackHandler.setStateParam(stateParam);
        console.log(`[SchwabOAuthManager] Updated state parameter on callback handler: ${stateParam.substring(0, 5)}...`);
      }
      
      return url;
    } catch (error) {
      console.error("[SchwabOAuthManager] Failed to generate authorization URL:", error);
      
      // We don't have the updateConnectionStatus here, so we just throw
      throw error;
    }
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleOAuthCallback(code: string, state?: string): Promise<boolean> {
    console.log(`[SchwabOAuthManager] Handling OAuth callback with code: ${code.substring(0, 5)}... and state: ${state ? state.substring(0, 5) + '...' : 'undefined'}`);
    
    try {
      const success = await this.callbackHandler.handleCallback(code, state);
      return success;
    } catch (error) {
      console.error("[SchwabOAuthManager] Error handling OAuth callback:", error);
      return false;
    }
  }
}
