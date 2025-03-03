export type BrokerType = 'interactive-brokers' | 'td-ameritrade' | 'none';

export interface BrokerSettings {
  type: BrokerType;
  isConnected: boolean;
  credentials: {
    apiKey?: string;
    secretKey?: string;
    accountId?: string;
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
