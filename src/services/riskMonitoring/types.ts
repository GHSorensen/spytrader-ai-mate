
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
