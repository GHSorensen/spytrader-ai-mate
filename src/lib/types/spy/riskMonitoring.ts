
import { MarketCondition, RiskToleranceType } from './common';
import { SpyTrade, SpyMarketData } from './index';

export type RiskSignalSource = 
  | 'technical'
  | 'fundamental'
  | 'volatility'
  | 'momentum'
  | 'sentiment'
  | 'economic'
  | 'geopolitical'
  | 'earnings'
  | 'federal_reserve'
  | 'liquidity';

export type RiskSignalStrength = 'weak' | 'moderate' | 'strong' | 'extreme';

export type RiskSignalDirection = 'bullish' | 'bearish' | 'neutral';

export type RiskActionType = 
  | 'reduce_position_size'
  | 'increase_position_size'
  | 'exit_trade'
  | 'hedge_position'
  | 'adjust_stop_loss'
  | 'adjust_take_profit'
  | 'no_action'
  | 'enter_new_trade'
  | 'convert_to_spread';

export interface RiskSignal {
  id: string;
  timestamp: Date;
  source: RiskSignalSource;
  condition: MarketCondition;
  strength: RiskSignalStrength;
  direction: RiskSignalDirection;
  description: string;
  dataPoints?: Record<string, any>;
  confidence: number; // 0-1
}

export interface RiskAction {
  id: string;
  signalId: string;
  timestamp: Date;
  actionType: RiskActionType;
  tradeIds: string[];
  description: string;
  parameters: Record<string, any>;
  previousRisk: number; // 0-1
  newRisk: number; // 0-1
  userRiskTolerance: RiskToleranceType;
  success?: boolean;
  profitImpact?: number;
}

export interface RiskMonitoringLog {
  signals: RiskSignal[];
  actions: RiskAction[];
  learningInsights: LearningInsight[];
}

export interface LearningInsight {
  id: string;
  timestamp: Date;
  description: string;
  signalPattern: {
    source: RiskSignalSource;
    condition: MarketCondition;
    strength: RiskSignalStrength;
    direction: RiskSignalDirection;
  };
  successRate: number; // 0-1
  averageProfitImpact: number;
  recommendedActions: RiskActionType[];
  confidence: number; // 0-1
}

export interface MarketRiskProfile {
  currentCondition: MarketCondition;
  volatilityLevel: number; // 0-1
  sentimentScore: number; // -1 to 1
  marketTrendStrength: number; // 0-1
  marketTrendDirection: 'bullish' | 'bearish' | 'neutral';
  keyRiskFactors: {
    source: RiskSignalSource;
    impact: number; // 0-1
    description: string;
  }[];
  compositeRiskScore: number; // 0-1
}
