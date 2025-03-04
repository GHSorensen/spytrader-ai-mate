
export type IBKRConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface IBKRAccount {
  id: string;
  accountId: string;
  accountName?: string;
  accountType: string;
  currency: string;
  isPrimary: boolean;
}

export interface IBKRCredentials {
  apiKey: string;
  callbackUrl: string;
}

export interface IBKRTwsSettings {
  host: string;
  port: string;
  isPaperTrading: boolean;
}
