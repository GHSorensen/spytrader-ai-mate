
import { RiskToleranceType } from './common';

export type RiskSignalSource = 'price' | 'volatility' | 'volume' | 'momentum' | 'sentiment' | 'technical' | 'fundamental';
export type RiskSignalCondition = 'bullish' | 'bearish' | 'neutral' | 'volatile' | 'trending' | 'ranging';
export type RiskSignalStrength = 'weak' | 'moderate' | 'strong' | 'extreme';
export type RiskSignalDirection = 'bullish' | 'bearish' | 'neutral';
export type RiskActionType = 
  'exit_trade' | 
  'reduce_position_size' | 
  'hedge_position' | 
  'adjust_stop_loss' | 
  'adjust_take_profit' | 
  'increase_position_size' |
  'convert_to_spread' |
  'no_action';

// Risk signal detected by the system
export interface RiskSignal {
  id: string;
  timestamp: Date;
  source: RiskSignalSource;
  condition: RiskSignalCondition;
  strength: RiskSignalStrength;
  description: string;
  confidence: number; // 0 to 1
  direction: RiskSignalDirection;
  dataPoints?: any; // Optional data points related to the signal
}

// Risk action recommended based on signals
export interface RiskAction {
  id: string;
  timestamp: Date;
  type: RiskActionType;
  description: string;
  expectedImpact: {
    profitPotential: number; // % change
    riskReduction: number; // % change
  };
  appliedSuccess?: boolean;
  appliedAt?: Date;
  signalId: string; // ID of the signal that triggered this action
  tradeIds: string[]; // IDs of trades this action applies to
  parameters: any; // Parameters for the action
  previousRisk: number;
  newRisk: number;
  userRiskTolerance: RiskToleranceType;
  success?: boolean;
  profitImpact?: number;
  actionType?: RiskActionType; // Legacy field, use 'type' instead
}

// Learning insight from historical signals and actions
export interface LearningInsight {
  id: string;
  timestamp: Date;
  signalPattern: {
    source: RiskSignalSource;
    condition: RiskSignalCondition;
    strength: RiskSignalStrength;
    direction: RiskSignalDirection;
  };
  actionTaken: RiskActionType;
  successRate: number; // 0 to 1
  profitImpact: number; // $ amount
  description: string;
  appliedCount: number;
  relatedRiskTolerance: RiskToleranceType;
  confidence: number;
  recommendedActions: RiskActionType[];
  averageProfitImpact: number;
}

// Market risk profile
export interface MarketRiskProfile {
  currentCondition: RiskSignalCondition;
  volatilityLevel: number; // 0 to 1
  sentimentScore: number; // -1 to 1
  marketTrendStrength: number; // 0 to 1
  marketTrendDirection: RiskSignalDirection;
  keyRiskFactors: Array<{
    source: RiskSignalSource;
    impact: number; // 0 to 1
    description: string;
  }>;
  compositeRiskScore: number; // 0 to 1
}

// Risk monitoring log
export interface RiskMonitoringLog {
  signals: RiskSignal[];
  actions: RiskAction[];
  learningInsights: LearningInsight[];
}
