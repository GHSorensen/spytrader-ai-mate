
/**
 * Types related to backtesting functionality
 */
import { SpyTrade } from './trades';
import { PerformanceMetrics } from './performance';

export interface BacktestResult {
  // Original properties
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: {
    amount: number;
    percentage: number;
    startDate: Date;
    endDate: Date;
  };
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  trades: SpyTrade[];
  equityCurve: { date: Date; equity: number }[];
  monthlyReturns: { month: string; return: number }[];
  drawdowns: { startDate: Date; endDate: Date; depth: number; duration: number }[];
  
  // Additional properties needed by components
  strategyId: string;
  strategyName: string;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  performanceMetrics: PerformanceMetrics;
  startDate: Date;
  endDate: Date;
  marketBenchmarkReturn: number;
}

export interface PaperTradingChallenge {
  id: string;
  name: string;
  description: string;
  initialBudget: number;
  currentValue: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'active' | 'completed' | 'failed';
  objective: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  trades: SpyTrade[];
  winRate: number;
  gainPercentage: number;
}
