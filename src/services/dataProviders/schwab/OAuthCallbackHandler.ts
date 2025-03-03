
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
  }

  /**
   * Set the state parameter for CSRF protection
   */
  setStateParam(stateParam: string): void {
    this.stateParam = stateParam;
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleCallback(code: string, state?: string): Promise<boolean> {
    try {
      console.log("Handling OAuth callback with code:", code, "and state:", state);
      
      if (state && this.stateParam && !this.auth.verifyStateParam(state, this.stateParam)) {
        console.error("State parameter verification failed", { 
          received: state,
          expected: this.stateParam
        });
        throw new Error("Invalid state parameter, possible CSRF attack");
      }

      const tokenResponse = await this.auth.getAccessToken(code);
      console.log("Token response received successfully");
      
      // Use token manager to handle the token update
      this.tokenManager.handleTokenUpdate(tokenResponse);
      
      toast({
        title: "Schwab Connected",
        description: "Successfully authenticated with Schwab API",
      });
      
      return true;
    } catch (error) {
      console.error("OAuth callback error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  }
}
