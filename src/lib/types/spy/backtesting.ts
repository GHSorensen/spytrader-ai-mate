
import { RiskToleranceType } from './common';
import { PerformanceMetrics } from './performance';
import { SpyTrade } from './trades';

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
