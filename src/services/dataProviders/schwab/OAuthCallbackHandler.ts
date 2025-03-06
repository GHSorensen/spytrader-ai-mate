
import { SchwabAuth } from "./auth";
import { TokenManager } from "./TokenManager";
import { verifyStateParam } from "./utils/stateParamUtils";
import { toast } from "@/components/ui/use-toast";

/**
 * Handles OAuth callback with authorization code
 */
export class OAuthCallbackHandler {
  private auth: SchwabAuth;
  private tokenManager: TokenManager;
  private stateParam: string | null = null;
  
  constructor(
    auth: SchwabAuth,
    tokenManager: TokenManager
  ) {
    this.auth = auth;
    this.tokenManager = tokenManager;
  }
  
  /**
   * Set state parameter from URL generation
   */
  setStateParam(stateParam: string): void {
    this.stateParam = stateParam;
    console.log(`[OAuthCallbackHandler] State parameter set: ${stateParam.substring(0, 5)}...`);
  }
  
  /**
   * Handle OAuth callback with authorization code
   */
  async handleCallback(code: string, state?: string): Promise<boolean> {
    try {
      console.log(`[OAuthCallbackHandler] Handling callback with code: ${code.substring(0, 5)}... and state: ${state ? state.substring(0, 5) + '...' : 'undefined'}`);
      
      // Validate state parameter to prevent CSRF attacks
      if (state && this.stateParam) {
        const validState = verifyStateParam(state, this.stateParam);
        
        if (!validState) {
          const error = "Invalid state parameter in callback, possible CSRF attack";
          console.error(`[OAuthCallbackHandler] ${error}`);
          throw new Error(error);
        }
        
        console.log(`[OAuthCallbackHandler] State parameter verified: ${state.substring(0, 5)}...`);
      }
      
      // Exchange code for access token
      const tokenResponse = await this.auth.getAccessToken(code);
      console.log(`[OAuthCallbackHandler] Received token response, access token: ${tokenResponse.accessToken.substring(0, 5)}...`);
      
      // Handle token update and setup refresh
      this.tokenManager.handleTokenUpdate(tokenResponse);
      
      // Show success toast
      toast({
        title: "Authentication Successful",
        description: "Successfully authenticated with Schwab API",
      });
      
      return true;
    } catch (error) {
      console.error("[OAuthCallbackHandler] Error handling callback:", error);
      
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Unknown authentication error",
        variant: "destructive",
      });
      
      return false;
    }
  }
}
