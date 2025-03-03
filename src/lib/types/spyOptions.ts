
export type OptionType = 'CALL' | 'PUT';
export type OptionExpiry = 'daily' | 'weekly' | 'monthly';
export type TradeStatus = 'pending' | 'active' | 'closed' | 'cancelled';
export type RiskToleranceType = 'conservative' | 'moderate' | 'aggressive';
export type MarketCondition = 'bullish' | 'bearish' | 'neutral' | 'volatile';
export type TimeOfDayPreference = 'market-open' | 'midday' | 'market-close' | 'any';

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
  marketCondition: MarketCondition;
  averageHoldingPeriod: number; // in days
  successRate: number; // percentage based on backtest
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
  bestTrade: number;
  worstTrade: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  returnsVolatility: number;
  sortinoRatio: number;
}

export interface AITradingSettings {
  enabledStrategies: RiskToleranceType[];
  maxSimultaneousTrades: number;
  maxDailyTrades: number;
  autoAdjustVolatility: boolean;
  useMarketSentiment: boolean;
  considerEarningsEvents: boolean;
  considerFedMeetings: boolean;
  enableHedging: boolean;
  minimumConfidenceScore: number;
  preferredTimeOfDay: TimeOfDayPreference;
  positionSizing: {
    type: 'fixed' | 'percentage' | 'kelly';
    value: number; // dollar amount, percentage of portfolio, or kelly criterion multiplier
  };
  stopLossSettings: {
    enabled: boolean;
    type: 'fixed' | 'percentage' | 'atr-based';
    value: number;
  };
  takeProfitSettings: {
    enabled: boolean;
    type: 'fixed' | 'percentage' | 'risk-reward';
    value: number;
  };
  marketConditionOverrides: {
    [key in MarketCondition]?: {
      enabled: boolean;
      adjustedRisk: number; // 0-1, where 1 is full risk
    };
  };
  backtestingSettings: {
    startDate: Date;
    endDate: Date;
    initialCapital: number;
    dataSource: string;
    includeCommissions: boolean;
    commissionPerTrade: number;
    includeTaxes: boolean;
    taxRate: number;
  };
}

export interface BacktestResult {
  strategyId: string;
  strategyName: string;
  riskProfile: RiskToleranceType;
  performanceMetrics: PerformanceMetrics;
  equityCurve: {date: Date; equity: number}[];
  trades: SpyTrade[];
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  finalCapital: number;
  maxDrawdown: {
    amount: number;
    percentage: number;
    startDate: Date;
    endDate: Date;
  };
  annualizedReturn: number;
  marketBenchmarkReturn: number;
}
