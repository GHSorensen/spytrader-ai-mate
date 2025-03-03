
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { SchwabAuth } from "./auth";
import { TokenManager } from "./TokenManager";
import { OAuthCallbackHandler } from "./OAuthCallbackHandler";
import { SchwabOAuthManager } from "./oauth/SchwabOAuthManager";
import { SchwabConnectionManager } from "./connection/SchwabConnectionManager";
import { ensureSecureCallbackUrl } from "./utils/callbackUrlUtils";

/**
 * Main auth manager that coordinates between OAuth and connection components
 */
export class SchwabAuthManager {
  private auth: SchwabAuth;
  private config: DataProviderConfig;
  private tokenManager: TokenManager;
  private oauthManager: SchwabOAuthManager;
  private connectionManager: SchwabConnectionManager;
  private updateTokens: (accessToken: string, refreshToken: string, expiryTime: Date) => void;
  private updateConnectionStatus: (connected: boolean, errorMessage?: string) => void;

  constructor(
    config: DataProviderConfig,
    updateTokens: (accessToken: string, refreshToken: string, expiryTime: Date) => void,
    updateConnectionStatus: (connected: boolean, errorMessage?: string) => void
  ) {
    console.log("[SchwabAuthManager] Initializing with config:", {
      type: config.type,
      hasApiKey: !!config.apiKey,
      hasSecretKey: !!config.secretKey,
      callbackUrl: config.callbackUrl,
      hasRefreshToken: !!config.refreshToken,
      paperTrading: config.paperTrading
    });
    
    // Ensure the callbackUrl is properly set for Schwab's HTTPS requirement
    config.callbackUrl = ensureSecureCallbackUrl(config);
    
    this.config = config;
    this.updateTokens = updateTokens;
    this.updateConnectionStatus = updateConnectionStatus;
    
    // Initialize auth component
    this.auth = new SchwabAuth(config);
    
    // Initialize token manager
    this.tokenManager = new TokenManager(updateTokens, updateConnectionStatus);
    // Set the refresh callback
    this.tokenManager.setRefreshCallback(this.refreshToken.bind(this));
    
    // Initialize OAuth manager
    this.oauthManager = new SchwabOAuthManager(this.auth, this.tokenManager, config);
    
    // Initialize connection manager
    this.connectionManager = new SchwabConnectionManager(this.auth, this.tokenManager, config, updateConnectionStatus);
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    return this.oauthManager.getAuthorizationUrl();
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleOAuthCallback(code: string, state?: string): Promise<boolean> {
    const success = await this.oauthManager.handleOAuthCallback(code, state);
    
    if (success) {
      console.log("[SchwabAuthManager] OAuth callback handled successfully");
      this.updateConnectionStatus(true);
    } else {
      console.error("[SchwabAuthManager] OAuth callback failed");
      this.updateConnectionStatus(false, "Failed to process authentication response");
    }
    
    return success;
  }

  /**
   * Connect to Schwab API - delegates to connection manager
   */
  async connect(): Promise<boolean> {
    return this.connectionManager.connect();
  }

  /**
   * Refresh token - delegates to connection manager
   */
  async refreshToken(): Promise<boolean> {
    return this.connectionManager.refreshToken();
  }

  /**
   * Clear all tokens - delegates to connection manager
   */
  clearTokens(): void {
    this.connectionManager.clearTokens();
  }
}
