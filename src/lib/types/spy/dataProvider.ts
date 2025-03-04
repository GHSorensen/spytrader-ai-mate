
/**
 * Configuration for data providers
 */
export type DataProviderType = 'td-ameritrade' | 'interactive-brokers' | 'schwab' | 'mock';

export interface DataProviderConfig {
  type: DataProviderType;
  apiKey?: string;
  secretKey?: string;
  accountId?: string;
  callbackUrl?: string;
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: number;
  
  // Added for TWS integration
  twsHost?: string;
  twsPort?: string;
  connectionMethod?: 'webapi' | 'tws';
  
  // Added for other services
  paperTrading?: boolean;
  quotesDelayed?: boolean;
}

export interface DataProviderStatus {
  connected: boolean;
  errorMessage?: string;
  lastUpdated: Date;
  quotesDelayed?: boolean;
}

export interface DataProviderInterface {
  getMarketData(): Promise<any>;
  getOptions(): Promise<any>;
  getOptionsByType?(type: string): Promise<any>;
  getOptionChain(symbol: string): Promise<any>;
  getTrades(): Promise<any>;
  getTradesByStatus?(status: string): Promise<any>;
  isConnected(): boolean;
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
}
