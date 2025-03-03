
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
  
  // New fields for enhanced machine learning capabilities
  adaptiveLearning?: boolean; // whether the strategy auto-adapts based on ML insights
  performanceScore?: number; // composite score from 0-100
  patternEffectiveness?: Record<string, number>; // effectiveness score for different market patterns
  lastOptimized?: Date; // when parameters were last optimized
  optimizationHistory?: {
    date: Date;
    parameter: string;
    oldValue: any;
    newValue: any;
    performanceChange: number; // percentage improvement
  }[];
  confidenceThreshold?: number; // minimum confidence score to apply ML suggestions (0-1)
  
  // Allow for additional dynamic properties
  [key: string]: any;
}

