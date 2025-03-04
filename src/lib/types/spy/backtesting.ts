
import { SpyTrade } from './trades';

export interface BacktestResult {
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
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
