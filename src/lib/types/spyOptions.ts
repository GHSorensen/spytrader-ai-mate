
export type OptionType = 'CALL' | 'PUT';
export type OptionExpiry = 'daily' | 'weekly' | 'monthly';
export type TradeStatus = 'pending' | 'active' | 'closed' | 'cancelled';

export interface SpyOption {
  id: string;
  strikePrice: number;
  expirationDate: Date;
  type: OptionType;
  premium: number;
  impliedVolatility: number;
  openInterest: number;
  volume: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export interface SpyTrade {
  id: string;
  optionId: string;
  type: OptionType;
  strikePrice: number;
  expirationDate: Date;
  entryPrice: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  quantity: number;
  status: TradeStatus;
  openedAt: Date;
  closedAt?: Date;
  profit?: number;
  profitPercentage?: number;
  confidenceScore: number;
}

export interface SpyMarketData {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  averageVolume: number;
  high: number;
  low: number;
  open: number;
  timestamp: Date;
  vix: number;
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  riskLevel: number; // 1-10
  timeFrame: string; // 1h, 4h, 1d, etc.
  optionType: OptionType | 'BOTH';
  expiryPreference: OptionExpiry[];
  deltaRange: [number, number];
  maxPositionSize: number;
  maxLossPerTrade: number;
  profitTarget: number; // percentage
}

export interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  netProfit: number;
  totalProfit: number;
  totalLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
  successfulTrades: number;
  failedTrades: number;
  averageDuration: number; // in minutes
}
