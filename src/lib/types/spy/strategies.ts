
import { OptionType, OptionExpiry, MarketCondition } from './common';

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
