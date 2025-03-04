
import { SpyMarketData, SpyOption, SpyTrade } from "@/lib/types/spy";
import { BrokerType } from "./broker";

export interface DataProviderConfig {
  type: BrokerType;
  apiKey?: string;
  secretKey?: string;
  accountId?: string;
  appKey?: string;
  callbackUrl?: string;
  refreshToken?: string;
  accessToken?: string; // Added this property to fix the type error
  paperTrading?: boolean;
}

export interface DataProviderInterface {
  getMarketData(): Promise<SpyMarketData>;
  getOptions(): Promise<SpyOption[]>;
  getOptionsByType(type: 'CALL' | 'PUT'): Promise<SpyOption[]>;
  getOptionChain(symbol: string): Promise<SpyOption[]>;
  getTrades(): Promise<SpyTrade[]>;
  getTradesByStatus(status: string): Promise<SpyTrade[]>;
  isConnected(): boolean;
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
}

export type DataProviderStatus = {
  connected: boolean;
  lastUpdated: Date;
  errorMessage?: string;
  quotesDelayed: boolean;
};
