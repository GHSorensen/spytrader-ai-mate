
// Re-export all types from the main types file to maintain consistent imports
export * from '@/lib/types/spy/riskMonitoring';

// Add any additional strategy learning specific types
export interface StrategyLearningInsight {
  strategyId: string;
  parameter: string;
  currentValue: any;
  suggestedValue: any;
  confidence: number;
  reason: string;
  expectedImprovement: string;
  timestamp: Date;
}

// Import necessary types
import { MarketCondition, RiskToleranceType } from '@/lib/types/spy/common';

// Risk signal source
export type RiskSignalSource = 'market_volatility' | 'price_action' | 'volume' | 'technical_indicator' | 'fundamental' | 'news' | 'correlation';

// Risk signal strength
export type RiskSignalStrength = 'weak' | 'moderate' | 'strong' | 'critical';

// Risk signal direction
export type RiskSignalDirection = 'bullish' | 'bearish' | 'neutral';

// Risk action type
export type RiskActionType = 'reduce_position_size' | 'increase_position_size' | 'adjust_stop_loss' | 'adjust_take_profit' | 'hedge_position' | 'close_position' | 'no_action' | 'exit_trade';

// Additional types to support the learning service
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
  actionTaken: RiskActionType;
  successRate: number;
  profitImpact: number;
  appliedCount: number;
  relatedRiskTolerance: RiskToleranceType;
  confidence: number;
  recommendedActions: RiskActionType[];
  averageProfitImpact: number;
}
