
import { SchwabAuth } from "./auth";
import { TokenManager } from "./TokenManager";
import { toast } from "@/components/ui/use-toast";

export class OAuthCallbackHandler {
  private auth: SchwabAuth;
  private tokenManager: TokenManager;
  private stateParam: string | null = null;

  constructor(auth: SchwabAuth, tokenManager: TokenManager) {
    this.auth = auth;
    this.tokenManager = tokenManager;
    console.log("[OAuthCallbackHandler] Initialized");
  }

  /**
   * Set the state parameter for CSRF protection
   */
  setStateParam(stateParam: string): void {
    console.log(`[OAuthCallbackHandler] Setting state parameter: ${stateParam.substring(0, 5)}...`);
    this.stateParam = stateParam;
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleCallback(code: string, state?: string): Promise<boolean> {
    try {
      console.log(`[OAuthCallbackHandler] Handling OAuth callback:
        - Code: ${code.substring(0, 5)}...
        - State: ${state ? state.substring(0, 5) + '...' : 'undefined'}
        - Stored state: ${this.stateParam ? this.stateParam.substring(0, 5) + '...' : 'not set'}`);
      
      // Verify state parameter if both the received state and stored state exist
      if (state && this.stateParam) {
        console.log("[OAuthCallbackHandler] Verifying state parameter for CSRF protection");
        
        if (!this.auth.verifyStateParam(state, this.stateParam)) {
          console.error("[OAuthCallbackHandler] State parameter verification failed", { 
            received: state,
            expected: this.stateParam
          });
          throw new Error("Invalid state parameter, possible CSRF attack");
        }
        
        console.log("[OAuthCallbackHandler] State parameter verified successfully");
      } else {
        // Log a warning if state parameter is missing
        if (!state) {
          console.warn("[OAuthCallbackHandler] No state parameter received in callback");
        }
        if (!this.stateParam) {
          console.warn("[OAuthCallbackHandler] No stored state parameter to verify against");
        }
      }

      console.log("[OAuthCallbackHandler] Exchanging authorization code for tokens");
      const tokenResponse = await this.auth.getAccessToken(code);
      console.log("[OAuthCallbackHandler] Token response received successfully");
      
      // Use token manager to handle the token update
      this.tokenManager.handleTokenUpdate(tokenResponse);
      console.log("[OAuthCallbackHandler] Token manager updated with new tokens");
      
      toast({
        title: "Schwab Connected",
        description: "Successfully authenticated with Schwab API",
      });
      
      return true;
    } catch (error) {
      console.error("[OAuthCallbackHandler] OAuth callback error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      
      // Show more detailed error toast with suggestions for common issues
      if (errorMessage.includes("Invalid state parameter")) {
        toast({
          title: "Security Error",
          description: "Authentication failed due to security verification. Please try again from the beginning.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("Token exchange failed")) {
        toast({
          title: "Authentication Failed",
          description: "Could not exchange authorization code for access token. This could be due to an expired code or configuration issues.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      return false;
    }
  }
}
