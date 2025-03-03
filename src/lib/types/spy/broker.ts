export type BrokerType = 'interactive-brokers' | 'td-ameritrade' | 'schwab' | 'none';

export interface BrokerSettings {
  type: BrokerType;
  isConnected: boolean;
  credentials: {
    apiKey?: string;
    secretKey?: string;
    accountId?: string;
    appKey?: string; // Added for Schwab
    callbackUrl?: string; // Added for OAuth flows
    // Other credentials as needed
  };
  paperTrading: boolean;
  lastConnected?: Date;
}

export interface BrokerConnectionStatus {
  connected: boolean;
  error?: string;
  lastChecked: Date;
}
