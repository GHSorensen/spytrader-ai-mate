
import { DataProviderConfig, DataProviderStatus } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { toast } from "@/components/ui/use-toast";
import { BaseDataProvider } from "./base/BaseDataProvider";
import { SchwabAuth } from "./schwab/auth";
import { generateMockOptions, generateMockTrades } from "./schwab/utils";
import { generateMockMarketData } from "./tdAmeritrade/utils";
import * as endpoints from "./schwab/endpoints";

export class SchwabService extends BaseDataProvider {
  private auth: SchwabAuth;
  private refreshTokenInterval: number | null = null;
  private stateParam: string | null = null;

  constructor(config: DataProviderConfig) {
    super(config);
    this.auth = new SchwabAuth(config);
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    try {
      return this.auth.getAuthorizationUrl();
    } catch (error) {
      console.error("Failed to generate authorization URL:", error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleOAuthCallback(code: string, state?: string): Promise<boolean> {
    try {
      if (state && this.stateParam && !this.auth.verifyStateParam(state, this.stateParam)) {
        throw new Error("Invalid state parameter, possible CSRF attack");
      }

      const tokenResponse = await this.auth.getAccessToken(code);
      
      this.accessToken = tokenResponse.accessToken;
      
      // Store refresh token in config for future use
      this.config.refreshToken = tokenResponse.refreshToken;
      
      // Calculate expiry time from expiresIn seconds
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + tokenResponse.expiresIn);
      this.tokenExpiry = expiryTime;
      
      this.status.connected = true;
      this.status.lastUpdated = new Date();
      
      // Set up automatic token refresh
      this.setupTokenRefresh(tokenResponse.expiresIn);
      
      toast({
        title: "Schwab Connected",
        description: "Successfully authenticated with Schwab API",
      });
      
      return true;
    } catch (error) {
      console.error("OAuth callback error:", error);
      
      this.status.connected = false;
      this.status.errorMessage = error instanceof Error ? error.message : "Authentication failed";
      
      toast({
        title: "Authentication Failed",
        description: this.status.errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  }

  /**
   * Connect to Schwab API - basic connection or OAuth flow
   */
  async connect(): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        throw new Error("Schwab API key not provided");
      }

      // Check if we have a refresh token to use
      if (this.config.refreshToken) {
        return this.refreshToken();
      }
      
      // For development without real OAuth flow, we simulate successful connection
      if (process.env.NODE_ENV === 'development') {
        console.log("Development mode: Simulating successful connection to Schwab API");
        
        this.status.connected = true;
        this.status.lastUpdated = new Date();
        
        // Mock token for development
        this.accessToken = "mock-schwab-token-" + Date.now();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour
        this.tokenExpiry = tokenExpiry;
        
        toast({
          title: "Schwab Connected (Dev Mode)",
          description: "Successfully connected to Schwab API in development mode",
        });
        
        return true;
      }
      
      // In production, we would initiate the OAuth flow by redirecting
      // to the authorization URL, but we can't do redirects within this service
      // So we'll return false and let the UI handle the redirect
      return false;
    } catch (error) {
      console.error("Schwab connection error:", error);
      this.status.connected = false;
      this.status.errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Connection Failed",
        description: this.status.errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  }

  /**
   * Refresh the access token using refresh token
   */
  private async refreshToken(): Promise<boolean> {
    try {
      if (!this.config.refreshToken) {
        throw new Error("No refresh token available");
      }
      
      const tokenResponse = await this.auth.refreshAccessToken(this.config.refreshToken);
      
      this.accessToken = tokenResponse.accessToken;
      this.config.refreshToken = tokenResponse.refreshToken;
      
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + tokenResponse.expiresIn);
      this.tokenExpiry = expiryTime;
      
      this.status.connected = true;
      this.status.lastUpdated = new Date();
      
      // Set up automatic token refresh
      this.setupTokenRefresh(tokenResponse.expiresIn);
      
      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      this.status.connected = false;
      this.status.errorMessage = error instanceof Error ? error.message : "Token refresh failed";
      
      // Clear tokens on refresh failure
      this.accessToken = null;
      this.config.refreshToken = undefined;
      this.tokenExpiry = null;
      
      return false;
    }
  }

  /**
   * Set up automatic token refresh
   */
  private setupTokenRefresh(expiresInSeconds: number): void {
    // Clear any existing refresh interval
    if (this.refreshTokenInterval !== null) {
      window.clearInterval(this.refreshTokenInterval);
    }
    
    // Refresh the token 5 minutes before it expires
    const refreshMs = Math.max(0, (expiresInSeconds - 300) * 1000);
    
    // Set up the interval
    this.refreshTokenInterval = window.setInterval(() => {
      this.refreshToken().catch(error => {
        console.error("Automatic token refresh failed:", error);
        
        // If refresh fails, clear the interval
        if (this.refreshTokenInterval !== null) {
          window.clearInterval(this.refreshTokenInterval);
          this.refreshTokenInterval = null;
        }
      });
    }, refreshMs);
  }

  /**
   * Disconnect from Schwab API
   */
  async disconnect(): Promise<boolean> {
    // Clear token refresh interval
    if (this.refreshTokenInterval !== null) {
      window.clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = null;
    }
    
    // Clear tokens
    this.accessToken = null;
    this.config.refreshToken = undefined;
    this.tokenExpiry = null;
    
    const result = await super.disconnect();
    
    toast({
      title: "Schwab Disconnected",
      description: "Successfully disconnected from Schwab API",
    });
    
    return result;
  }

  /**
   * Get SPY market data from Schwab
   */
  async getMarketData(): Promise<SpyMarketData> {
    try {
      if (!this.isConnected()) {
        await this.connect();
      }

      // In a real implementation, we would call the Schwab API
      console.log("Fetching SPY market data from Schwab");
      
      // Return mock data for development using the shared utility function
      return generateMockMarketData();
    } catch (error) {
      console.error("Schwab market data error:", error);
      throw error;
    }
  }

  /**
   * Get all SPY options from Schwab
   */
  async getOptions(): Promise<SpyOption[]> {
    try {
      if (!this.isConnected()) {
        await this.connect();
      }

      // In a real implementation, we would call the Schwab API
      console.log("Fetching SPY options from Schwab");
      
      // Return mock data for development
      return generateMockOptions();
    } catch (error) {
      console.error("Schwab options error:", error);
      throw error;
    }
  }

  /**
   * Get option chain for a specific symbol
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    try {
      if (!this.isConnected()) {
        await this.connect();
      }

      console.log(`Fetching ${symbol} option chain from Schwab`);
      
      // For SPY, return all options; for other symbols, we'd make specific requests
      if (symbol.toUpperCase() === 'SPY') {
        return this.getOptions();
      }
      
      // For other symbols, return empty array for now
      return [];
    } catch (error) {
      console.error("Schwab option chain error:", error);
      throw error;
    }
  }

  /**
   * Get all trades from Schwab account
   */
  async getTrades(): Promise<SpyTrade[]> {
    try {
      if (!this.isConnected()) {
        await this.connect();
      }

      // In a real implementation, we would query the account positions
      console.log("Fetching trades from Schwab account");
      
      // Return mock data for development
      return generateMockTrades();
    } catch (error) {
      console.error("Schwab trades error:", error);
      throw error;
    }
  }
}
