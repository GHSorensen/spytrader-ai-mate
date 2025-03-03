
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
  'increase_position_size';

// Risk signal detected by the system
export interface RiskSignal {
  id: string;
  timestamp: Date;
  source: RiskSignalSource;
  condition: RiskSignalCondition;
  strength: RiskSignalStrength;
  description: string;
  confidence: number; // 0 to 1
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
}
