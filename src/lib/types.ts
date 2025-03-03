
export type TradeDirection = 'CALL' | 'PUT';

export type TradeStatus = 'pending' | 'executed' | 'closed' | 'cancelled';

export interface Trade {
  id: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  quantity: number;
  status: TradeStatus;
  timestamp: Date;
  expiryDate: Date;
  profit?: number;
  confidence: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface StrategyConfig {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  riskLevel: number; // 1-10
  timeFrame: string; // 1h, 4h, 1d, etc.
  maxPosition: number;
  autoAdjust: boolean;
}

export interface PerformanceMetric {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  averageProfit: number;
  averageLoss: number;
  netProfit: number;
  sharpeRatio: number;
  maxDrawdown: number;
  successfulTrades: number;
  failedTrades: number;
}

export interface AppSettings {
  apiKey: string;
  isDarkMode: boolean;
  notifications: boolean;
  autoTrade: boolean;
  riskLevel: number;
  maxDailyLoss: number;
  maxPositionSize: number;
}
