import { RiskToleranceType } from './common';

export type RiskSignalSource = 'price' | 'volatility' | 'volume' | 'momentum' | 'sentiment' | 'technical' | 'fundamental' | 'market_volatility' | 'price_action' | 'correlation' | 'news';
export type RiskSignalCondition = 'bullish' | 'bearish' | 'neutral' | 'volatile' | 'trending' | 'ranging';
export type RiskSignalStrength = 'weak' | 'moderate' | 'strong' | 'extreme' | 'critical';
export type RiskSignalDirection = 'bullish' | 'bearish' | 'neutral';
export type RiskActionType = 
  'exit_trade' | 
  'reduce_position_size' | 
  'hedge_position' | 
  'adjust_stop_loss' | 
  'adjust_take_profit' | 
  'increase_position_size' |
  'convert_to_spread' |
  'no_action' |
  'close_position';

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

export interface RiskMonitoringLog {
  signals: RiskSignal[];
  actions: RiskAction[];
  learningInsights: LearningInsight[];
}

export type AnomalyType = 
  'price_spike' | 
  'volume_surge' | 
  'volatility_explosion' | 
  'correlation_break' | 
  'pattern_deviation' | 
  'momentum_shift' | 
  'liquidity_change' |
  'option_skew_change' |
  'implied_volatility_divergence';

export type DetectionMethod = 
  'zscore' | 
  'moving_average' | 
  'bollinger_bands' | 
  'ARIMA' | 
  'isolation_forest' | 
  'DBSCAN' | 
  'local_outlier_factor' |
  'cumulative_sum' |
  'kernel_density';

export type TimeWindow = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';

export interface AnomalyDetectionParams {
  sensitivity: number; // 0 to 1, with 1 being most sensitive
  lookbackPeriods: number;
  minConfidence: number; // 0 to 1
  timeWindow: TimeWindow;
  detectionMethods: DetectionMethod[];
  anomalyTypes: AnomalyType[];
  enabledDataSeries: string[];
}

export interface StatisticalAnomaly {
  id: string;
  timestamp: Date;
  type: AnomalyType;
  detectionMethod: DetectionMethod;
  timeWindow: TimeWindow;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number; // how far from expected (normalized)
  zScore: number;
  confidence: number; // 0 to 1
  description: string;
  suggestedActions?: RiskActionType[];
  relatedSignals?: string[]; // IDs of related risk signals
  historicalOccurrences?: number;
  successfulTradeRate?: number; // 0 to 1, success rate when traded on this anomaly
}

export interface AnomalyProcessorResult {
  anomalies: StatisticalAnomaly[];
  processedDataPoints: number;
  detectionTimestamp: Date;
  executionTimeMs: number;
  triggerThresholdMet: boolean;
}

export interface StrategyLearningAnomaly {
  anomalyType: AnomalyType;
  strategyId: string;
  detectionTimestamp: Date;
  tradingPerformance: {
    successRate: number;
    profitFactor: number;
    sampleSize: number;
  };
  recommendedParameters: {
    parameter: string;
    currentValue: any;
    suggestedValue: any;
    confidence: number;
  }[];
}
