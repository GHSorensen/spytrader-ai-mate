
import { toast } from "@/components/ui/use-toast";

export class TokenManager {
  private refreshTokenInterval: number | null = null;
  private updateTokens: (accessToken: string, refreshToken: string, expiryTime: Date) => void;
  private updateConnectionStatus: (connected: boolean, errorMessage?: string) => void;
  private refreshCallback: (() => Promise<boolean>) | null = null;

  constructor(
    updateTokens: (accessToken: string, refreshToken: string, expiryTime: Date) => void,
    updateConnectionStatus: (connected: boolean, errorMessage?: string) => void
  ) {
    this.updateTokens = updateTokens;
    this.updateConnectionStatus = updateConnectionStatus;
  }

  /**
   * Set the refresh callback function
   */
  setRefreshCallback(callback: () => Promise<boolean>): void {
    this.refreshCallback = callback;
  }

  /**
   * Update tokens with new values and calculate expiry time
   */
  handleTokenUpdate(tokenResponse: { accessToken: string, refreshToken: string, expiresIn: number }): void {
    // Calculate expiry time from expiresIn seconds
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + tokenResponse.expiresIn);
    
    // Update tokens in parent service
    this.updateTokens(tokenResponse.accessToken, tokenResponse.refreshToken, expiryTime);
    
    // Update connection status
    this.updateConnectionStatus(true);
    
    // Set up automatic token refresh
    this.setupTokenRefresh(tokenResponse.expiresIn);
  }

  /**
   * Clear all tokens and intervals
   */
  clearTokens(): void {
    // Clear token refresh interval
    if (this.refreshTokenInterval !== null) {
      window.clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = null;
    }
    
    // Update with null tokens
    this.updateTokens("", "", new Date(0));
  }

  /**
   * Set up automatic token refresh
   */
  setupTokenRefresh(expiresInSeconds: number): void {
    if (!this.refreshCallback) {
      console.warn("No refresh callback set for token manager");
      return;
    }
    
    // Clear any existing refresh interval
    if (this.refreshTokenInterval !== null) {
      window.clearInterval(this.refreshTokenInterval);
    }
    
    // Refresh the token 5 minutes before it expires
    const refreshMs = Math.max(0, (expiresInSeconds - 300) * 1000);
    
    // Set up the interval
    this.refreshTokenInterval = window.setInterval(() => {
      if (this.refreshCallback) {
        this.refreshCallback().catch(error => {
          console.error("Automatic token refresh failed:", error);
          
          // If refresh fails, clear the interval
          if (this.refreshTokenInterval !== null) {
            window.clearInterval(this.refreshTokenInterval);
            this.refreshTokenInterval = null;
          }
        });
      }
    }, refreshMs);
  }
}
