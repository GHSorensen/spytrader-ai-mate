
/**
 * Manages token updates, refresh timers, and notifies parent components
 */
export class TokenManager {
  private refreshCallback: (() => Promise<boolean>) | null = null;
  private refreshTimer: number | null = null;
  private updateTokens: (accessToken: string, refreshToken: string, expiryTime: Date) => void;
  private updateConnectionStatus: (connected: boolean, errorMessage?: string) => void;
  
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
   * Handle token update from OAuth flow
   */
  handleTokenUpdate(tokenResponse: { 
    accessToken: string, 
    refreshToken: string, 
    expiresIn: number,
    tokenType?: string 
  }): void {
    try {
      console.log("[TokenManager] Handling token update");
      
      const { accessToken, refreshToken, expiresIn } = tokenResponse;
      
      // Calculate expiry time
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + expiresIn);
      
      console.log(`[TokenManager] Token expires at: ${expiryTime.toISOString()}`);
      
      // Update tokens in parent component
      this.updateTokens(accessToken, refreshToken, expiryTime);
      
      // Update connection status
      this.updateConnectionStatus(true);
      
      // Set up refresh timer
      this.setupRefreshTimer(expiresIn);
    } catch (error) {
      console.error("[TokenManager] Error handling token update:", error);
      this.updateConnectionStatus(false, "Error handling token update");
    }
  }
  
  /**
   * Set up a timer to refresh the token before it expires
   */
  private setupRefreshTimer(expiresInSeconds: number): void {
    // Clear any existing timer
    if (this.refreshTimer !== null) {
      window.clearTimeout(this.refreshTimer);
    }
    
    // Calculate refresh time (refresh 5 minutes before expiry)
    const refreshDelay = Math.max((expiresInSeconds - 300) * 1000, 60000);
    
    console.log(`[TokenManager] Setting up refresh timer for ${refreshDelay / 1000} seconds from now`);
    
    // Set up new timer
    this.refreshTimer = window.setTimeout(() => {
      console.log("[TokenManager] Token refresh timer triggered");
      this.refreshToken();
    }, refreshDelay);
  }
  
  /**
   * Refresh the token using the refresh callback
   */
  private async refreshToken(): Promise<void> {
    try {
      if (!this.refreshCallback) {
        throw new Error("No refresh callback set");
      }
      
      console.log("[TokenManager] Attempting to refresh token");
      const success = await this.refreshCallback();
      
      if (!success) {
        console.error("[TokenManager] Token refresh failed");
        this.updateConnectionStatus(false, "Token refresh failed");
      } else {
        console.log("[TokenManager] Token refresh successful");
      }
    } catch (error) {
      console.error("[TokenManager] Error refreshing token:", error);
      this.updateConnectionStatus(false, "Error refreshing token");
    }
  }
  
  /**
   * Clear all tokens and timers
   */
  clearTokens(): void {
    console.log("[TokenManager] Clearing tokens and timers");
    
    // Clear refresh timer
    if (this.refreshTimer !== null) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    // Update with empty tokens
    this.updateTokens("", "", new Date(0));
    this.updateConnectionStatus(false);
  }
}
