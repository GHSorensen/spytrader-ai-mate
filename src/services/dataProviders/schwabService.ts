
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { BaseDataProvider } from "./base/BaseDataProvider";
import { SchwabAuthManager } from "./schwab/SchwabAuthManager";
import { SchwabMarketDataManager } from "./schwab/SchwabMarketDataManager";
import { SchwabOptionsManager } from "./schwab/SchwabOptionsManager";
import { SchwabTradesManager } from "./schwab/SchwabTradesManager";
import { toast } from "@/components/ui/use-toast";

export class SchwabService extends BaseDataProvider {
  private authManager: SchwabAuthManager;
  private marketDataManager: SchwabMarketDataManager;
  private optionsManager: SchwabOptionsManager;
  private tradesManager: SchwabTradesManager;

  constructor(config: DataProviderConfig) {
    super(config);
    this.authManager = new SchwabAuthManager(
      config, 
      this.updateTokens.bind(this),
      this.updateConnectionStatus.bind(this)
    );
    this.marketDataManager = new SchwabMarketDataManager(this);
    this.optionsManager = new SchwabOptionsManager(this);
    this.tradesManager = new SchwabTradesManager(this);
  }

  /**
   * Update tokens received from authentication
   */
  private updateTokens(accessToken: string, refreshToken: string, expiryTime: Date): void {
    this.accessToken = accessToken;
    this.config.refreshToken = refreshToken;
    this.tokenExpiry = expiryTime;
  }

  /**
   * Update connection status
   */
  private updateConnectionStatus(connected: boolean, errorMessage?: string): void {
    this.status.connected = connected;
    this.status.lastUpdated = new Date();
    
    if (errorMessage) {
      this.status.errorMessage = errorMessage;
    }
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    return this.authManager.getAuthorizationUrl();
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleOAuthCallback(code: string, state?: string): Promise<boolean> {
    return this.authManager.handleOAuthCallback(code, state);
  }

  /**
   * Connect to Schwab API - basic connection or OAuth flow
   */
  async connect(): Promise<boolean> {
    return this.authManager.connect();
  }

  /**
   * Disconnect from Schwab API
   */
  async disconnect(): Promise<boolean> {
    this.authManager.clearTokens();
    
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
  async getMarketData() {
    return this.marketDataManager.getMarketData();
  }

  /**
   * Get all SPY options from Schwab
   */
  async getOptions() {
    return this.optionsManager.getOptions();
  }

  /**
   * Get option chain for a specific symbol
   */
  async getOptionChain(symbol: string) {
    return this.optionsManager.getOptionChain(symbol);
  }

  /**
   * Get all trades from Schwab account
   */
  async getTrades() {
    return this.tradesManager.getTrades();
  }
}
