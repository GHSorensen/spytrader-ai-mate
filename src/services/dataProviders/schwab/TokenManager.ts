
/**
 * Manages authentication tokens and refresh cycles
 */
export class TokenManager {
  private updateTokens: (accessToken: string, refreshToken: string, expiryTime: Date) => void;
  private updateConnectionStatus: (connected: boolean, errorMessage?: string) => void;
  private refreshCallback: (() => Promise<boolean>) | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  
  constructor(
    updateTokens: (accessToken: string, refreshToken: string, expiryTime: Date) => void,
    updateConnectionStatus: (connected: boolean, errorMessage?: string) => void
  ) {
    console.log("[TokenManager] Initializing token manager");
    this.updateTokens = updateTokens;
    this.updateConnectionStatus = updateConnectionStatus;
  }
  
  /**
   * Set the function to call when token refresh is needed
   */
  setRefreshCallback(callback: () => Promise<boolean>): void {
    this.refreshCallback = callback;
  }
  
  /**
   * Handle token update from OAuth flow or refresh
   */
  handleTokenUpdate(tokenResponse: { 
    accessToken: string, 
    refreshToken: string, 
    expiresIn: number 
  }): void {
    const { accessToken, refreshToken, expiresIn } = tokenResponse;
    
    // Calculate expiry time based on expiresIn seconds
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + expiresIn);
    
    console.log(`[TokenManager] Handling token update, expires in ${expiresIn} seconds (${expiryTime.toISOString()})`);
    
    // Update tokens in parent component
    this.updateTokens(accessToken, refreshToken, expiryTime);
    
    // Set up token refresh before it expires
    this.setupTokenRefresh(expiryTime);
    
    // Update connection status
    this.updateConnectionStatus(true);
  }
  
  /**
   * Set up timer to refresh token before expiry
   */
  private setupTokenRefresh(expiryTime: Date): void {
    // Clear any existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    // Calculate refresh time (1 minute before expiry)
    const currentTime = new Date();
    const timeUntilExpiry = expiryTime.getTime() - currentTime.getTime();
    const refreshTime = Math.max(timeUntilExpiry - 60000, 0); // Refresh 1 minute before expiry or immediately
    
    console.log(`[TokenManager] Setting up token refresh in ${refreshTime / 1000} seconds`);
    
    // Set up timer
    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
  }
  
  /**
   * Refresh token when it's about to expire
   */
  private async refreshToken(): Promise<void> {
    if (!this.refreshCallback) {
      console.error("[TokenManager] No refresh callback set");
      return;
    }
    
    console.log("[TokenManager] Attempting token refresh");
    
    try {
      const success = await this.refreshCallback();
      
      if (!success) {
        console.error("[TokenManager] Token refresh failed");
        this.updateConnectionStatus(false, "Failed to refresh authentication token");
      } else {
        console.log("[TokenManager] Token refresh successful");
      }
    } catch (error) {
      console.error("[TokenManager] Error during token refresh:", error);
      this.updateConnectionStatus(false, error instanceof Error ? error.message : "Unknown token refresh error");
    }
  }
  
  /**
   * Clear tokens and refresh timer
   */
  clearTokens(): void {
    console.log("[TokenManager] Clearing tokens and refresh timer");
    
    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    // Clear tokens by setting empty values and expired time
    const expiredTime = new Date(0); // January 1, 1970
    this.updateTokens("", "", expiredTime);
    
    // Update connection status
    this.updateConnectionStatus(false);
  }
}
