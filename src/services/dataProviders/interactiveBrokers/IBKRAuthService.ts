
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { IBKRAuth } from "./auth";
import { toast } from "sonner";

/**
 * Handles authentication for Interactive Brokers
 */
export class IBKRAuthService {
  private auth: IBKRAuth;
  private config: DataProviderConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private authAttempts: number = 0;
  private lastAuthError: string | null = null;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    this.auth = new IBKRAuth(config);
    
    // Log configuration for debugging
    console.log("[IBKRAuthService] Initialized with config:", {
      type: config.type,
      hasApiKey: !!config.apiKey,
      hasCallbackUrl: !!config.callbackUrl,
      hasRefreshToken: !!config.refreshToken,
      hasAccessToken: !!config.accessToken,
      connectionMethod: config.connectionMethod,
      paperTrading: config.paperTrading
    });
    
    // Initialize from stored token if available
    if (config.accessToken) {
      this.accessToken = config.accessToken;
      console.log("[IBKRAuthService] Using provided access token");
      
      if (config.expiresAt) {
        this.tokenExpiry = new Date(config.expiresAt);
        console.log("[IBKRAuthService] Token expires at:", this.tokenExpiry.toISOString());
      }
    }
  }
  
  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    // Check expiry before returning token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry < new Date()) {
      console.warn("[IBKRAuthService] Token has expired, returning null");
      return null;
    }
    return this.accessToken;
  }
  
  /**
   * Get token expiry date
   */
  getTokenExpiry(): Date | null {
    return this.tokenExpiry;
  }
  
  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
    console.log("[IBKRAuthService] Access token set successfully");
    
    // Store in localStorage for persistence across page reloads
    try {
      const tokenData = {
        token,
        expires: this.tokenExpiry ? this.tokenExpiry.toISOString() : null
      };
      localStorage.setItem('ibkr-token', JSON.stringify(tokenData));
      console.log("[IBKRAuthService] Token saved to localStorage");
    } catch (error) {
      console.error("[IBKRAuthService] Failed to save token to localStorage:", error);
    }
  }
  
  /**
   * Set token expiry
   */
  setTokenExpiry(expiry: Date): void {
    this.tokenExpiry = expiry;
    console.log("[IBKRAuthService] Token expiry set:", expiry.toISOString());
    
    // Update localStorage
    try {
      const savedToken = localStorage.getItem('ibkr-token');
      if (savedToken) {
        const tokenData = JSON.parse(savedToken);
        tokenData.expires = expiry.toISOString();
        localStorage.setItem('ibkr-token', JSON.stringify(tokenData));
      }
    } catch (error) {
      console.error("[IBKRAuthService] Failed to update token expiry in localStorage:", error);
    }
  }
  
  /**
   * Check if token is valid
   */
  isAccessTokenValid(): boolean {
    if (!this.accessToken) {
      console.log("[IBKRAuthService] No access token available");
      return false;
    }
    
    if (!this.tokenExpiry) {
      console.log("[IBKRAuthService] Token has no expiry date, assuming valid");
      return true;
    }
    
    const isValid = this.tokenExpiry > new Date();
    console.log("[IBKRAuthService] Token valid:", isValid, "Expires:", this.tokenExpiry.toISOString());
    return isValid;
  }
  
  /**
   * Handle authentication as part of connection process
   */
  async authenticate(): Promise<boolean> {
    try {
      this.authAttempts++;
      console.log(`[IBKRAuthService] Authentication attempt #${this.authAttempts}`);
      
      // First check if we already have a valid token
      if (this.isAccessTokenValid()) {
        console.log("[IBKRAuthService] Using existing valid token");
        return true;
      }
      
      // Try to restore token from localStorage if not already done
      if (!this.accessToken) {
        try {
          const savedToken = localStorage.getItem('ibkr-token');
          if (savedToken) {
            const tokenData = JSON.parse(savedToken);
            if (tokenData.token && tokenData.expires) {
              const expiryDate = new Date(tokenData.expires);
              if (expiryDate > new Date()) {
                this.accessToken = tokenData.token;
                this.tokenExpiry = expiryDate;
                console.log("[IBKRAuthService] Restored valid token from localStorage");
                return true;
              } else {
                console.log("[IBKRAuthService] Saved token has expired, will try refresh flow");
              }
            }
          }
        } catch (error) {
          console.error("[IBKRAuthService] Error restoring token from localStorage:", error);
        }
      }
      
      // Try refresh token if available
      if (this.config.refreshToken) {
        console.log("[IBKRAuthService] Attempting to use refresh token");
        try {
          const authResult = await this.auth.refreshAccessToken(this.config.refreshToken);
          console.log("[IBKRAuthService] Refresh token successful");
          
          this.accessToken = authResult.accessToken;
          
          const expiryDate = new Date();
          expiryDate.setSeconds(expiryDate.getSeconds() + authResult.expiresIn);
          this.tokenExpiry = expiryDate;
          
          // Save the updated token
          this.setAccessToken(this.accessToken);
          this.setTokenExpiry(this.tokenExpiry);
          
          this.lastAuthError = null;
          return true;
        } catch (refreshError) {
          console.error("[IBKRAuthService] Refresh token failed:", refreshError);
          // Continue to other auth methods
        }
      }
      
      // Try with existing access token if available
      if (this.config.accessToken) {
        console.log("[IBKRAuthService] Using config access token");
        this.accessToken = this.config.accessToken;
        
        // Set a default expiry if not provided
        if (!this.tokenExpiry && this.config.expiresAt) {
          this.tokenExpiry = new Date(this.config.expiresAt);
        } else if (!this.tokenExpiry) {
          // Default to 1 hour expiry if not specified
          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 1);
          this.tokenExpiry = expiryDate;
        }
        
        // Save the token
        this.setAccessToken(this.accessToken);
        if (this.tokenExpiry) {
          this.setTokenExpiry(this.tokenExpiry);
        }
        
        this.lastAuthError = null;
        return true;
      }
      
      // If we get here, we need user to authorize
      console.log("[IBKRAuthService] No valid authentication method available");
      this.lastAuthError = "Authentication required. Please complete the Interactive Brokers authorization process.";
      
      toast.error("Authentication Required", {
        description: "Please complete the Interactive Brokers authorization process.",
      });
      
      return false;
    } catch (error) {
      console.error("[IBKRAuthService] Error during authentication:", error);
      this.lastAuthError = error instanceof Error 
        ? error.message 
        : "Unknown error during authentication";
        
      toast.error("Authentication Error", {
        description: this.lastAuthError,
      });
      
      return false;
    }
  }
  
  /**
   * Get authentication status for diagnostics
   */
  getAuthStatus(): {
    hasToken: boolean;
    tokenExpired: boolean | null;
    authAttempts: number;
    lastError: string | null;
  } {
    return {
      hasToken: !!this.accessToken,
      tokenExpired: this.tokenExpiry ? this.tokenExpiry < new Date() : null,
      authAttempts: this.authAttempts,
      lastError: this.lastAuthError
    };
  }
}
