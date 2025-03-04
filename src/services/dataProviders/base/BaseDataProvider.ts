
import { DataProviderInterface, DataProviderConfig, DataProviderStatus } from "@/lib/types/spy/dataProvider";
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { toast } from "@/components/ui/use-toast";

/**
 * Base class for all data providers
 */
export abstract class BaseDataProvider implements DataProviderInterface {
  protected config: DataProviderConfig;
  protected status: DataProviderStatus = {
    connected: false,
    lastUpdated: new Date(),
    quotesDelayed: true
  };
  protected accessToken: string | null = null;
  protected tokenExpiry: Date | null = null;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
  }

  /**
   * Connect to the broker API
   */
  abstract connect(): Promise<boolean>;

  /**
   * Disconnect from the broker API
   */
  async disconnect(): Promise<boolean> {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.status.connected = false;
    this.status.lastUpdated = new Date();
    return true;
  }

  /**
   * Check if connected to the broker API
   */
  isConnected(): boolean {
    return this.status.connected && 
      this.accessToken !== null && 
      this.tokenExpiry !== null && 
      this.tokenExpiry > new Date();
  }

  /**
   * Get market data
   */
  abstract getMarketData(): Promise<SpyMarketData>;

  /**
   * Get all options
   */
  abstract getOptions(): Promise<SpyOption[]>;

  /**
   * Get options by type (CALL or PUT)
   */
  async getOptionsByType(type: 'CALL' | 'PUT'): Promise<SpyOption[]> {
    const options = await this.getOptions();
    return options.filter(option => option.type === type);
  }

  /**
   * Get option chain for a specific symbol
   */
  abstract getOptionChain(symbol: string): Promise<SpyOption[]>;

  /**
   * Get all trades
   */
  abstract getTrades(): Promise<SpyTrade[]>;

  /**
   * Get trades by status
   */
  async getTradesByStatus(status: string): Promise<SpyTrade[]> {
    const trades = await this.getTrades();
    return trades.filter(trade => trade.status === status);
  }

  /**
   * Get account data (balance, P&L, etc.)
   */
  async getAccountData(): Promise<{balance: number, dailyPnL: number, allTimePnL: number}> {
    // Default implementation that can be overridden by specific providers
    return {
      balance: 1600, // Default mock value
      dailyPnL: 0,
      allTimePnL: 0
    };
  }
}
