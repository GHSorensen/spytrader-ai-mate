
// Fix the mock backtest results to fully match the BacktestResult interface
import { format, subDays, subMonths, subYears } from 'date-fns';
import { 
  BacktestResult,
  PerformanceMetrics
} from '@/lib/types/spy';

// Helper function to generate equity curve data
const generateEquityCurveData = (days: number, startValue: number = 100000) => {
  const data = [];
  let currentValue = startValue;
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    // Random daily change between -2% and 3%
    const dailyChange = (Math.random() * 5 - 2) / 100;
    currentValue = currentValue * (1 + dailyChange);
    
    data.push({
      date,
      equity: Math.round(currentValue * 100) / 100,
    });
  }
  
  return data;
};

// Generate mock backtest results that fully conform to the BacktestResult interface
export const mockBacktestResults: BacktestResult[] = [
  {
    strategyId: '1',
    strategyName: 'Conservative Strategy',
    riskProfile: 'conservative',
    totalReturn: 35.25,
    totalTrades: 250,
    winningTrades: 171,
    losingTrades: 79,
    winRate: 68.5,
    profitFactor: 2.3,
    sharpeRatio: 1.8,
    trades: [],
    equityCurve: generateEquityCurveData(365, 100000),
    monthlyReturns: Array(12).fill(0).map((_, i) => ({
      month: format(subMonths(new Date(), i), 'MMM yyyy'),
      return: (Math.random() * 15 - 5) / 100,
    })),
    drawdowns: Array(5).fill(0).map(() => ({
      startDate: subMonths(new Date(), Math.floor(Math.random() * 12)),
      endDate: subMonths(new Date(), Math.floor(Math.random() * 6)),
      depth: Math.random() * 15,
      duration: Math.floor(Math.random() * 30) + 5,
    })),
    startDate: subYears(new Date(), 1),
    endDate: new Date(),
    initialCapital: 100000,
    finalCapital: 135250.75,
    maxDrawdown: {
      amount: 15250.50,
      percentage: 12.5,
      startDate: subMonths(new Date(), 6),
      endDate: subMonths(new Date(), 5),
    },
    annualizedReturn: 35.25,
    marketBenchmarkReturn: 12.5,
    performanceMetrics: {
      totalTrades: 250,
      winRate: 68.5,
      profitFactor: 2.3,
      averageWin: 15.2,
      averageLoss: -8.5,
      netProfit: 35250.75,
      totalProfit: 48750.25,
      totalLoss: -13500.50,
      maxDrawdown: 12.5,
      sharpeRatio: 1.8,
      successfulTrades: 171,
      failedTrades: 79,
      averageDuration: 120,
      bestTrade: 45.8,
      worstTrade: -22.5,
      consecutiveWins: 12,
      consecutiveLosses: 5,
      returnsVolatility: 15.2,
      sortinoRatio: 2.1,
      calmarRatio: 1.5,
      dailyReturns: Array(30).fill(0).map((_, i) => ({
        date: subDays(new Date(), i),
        return: (Math.random() * 6 - 2) / 100,
      })),
      monthlyReturns: Array(12).fill(0).map((_, i) => ({
        month: format(subMonths(new Date(), i), 'MMM yyyy'),
        return: (Math.random() * 15 - 5) / 100,
      })),
      annualReturns: Array(3).fill(0).map((_, i) => ({
        year: new Date().getFullYear() - i,
        return: (Math.random() * 40 - 10) / 100,
      })),
      riskAdjustedReturn: 18.5,
      kellyPercentage: 25.2,
      dollarReturn: 35250.75,
      percentageReturn: 35.25,
      benchmarkComparison: {
        spyReturn: 12.5,
        outperformance: 22.75,
      },
    }
  },
  {
    strategyId: '2',
    strategyName: 'Moderate Strategy',
    riskProfile: 'moderate',
    totalReturn: 42.5,
    totalTrades: 350,
    winningTrades: 228,
    losingTrades: 122,
    winRate: 65.2,
    profitFactor: 2.1,
    sharpeRatio: 1.6,
    trades: [],
    equityCurve: generateEquityCurveData(365, 100000),
    monthlyReturns: Array(12).fill(0).map((_, i) => ({
      month: format(subMonths(new Date(), i), 'MMM yyyy'),
      return: (Math.random() * 20 - 8) / 100,
    })),
    drawdowns: Array(5).fill(0).map(() => ({
      startDate: subMonths(new Date(), Math.floor(Math.random() * 12)),
      endDate: subMonths(new Date(), Math.floor(Math.random() * 6)),
      depth: Math.random() * 20,
      duration: Math.floor(Math.random() * 35) + 5,
    })),
    startDate: subYears(new Date(), 1),
    endDate: new Date(),
    initialCapital: 100000,
    finalCapital: 142500.50,
    maxDrawdown: {
      amount: 22500.25,
      percentage: 18.2,
      startDate: subMonths(new Date(), 8),
      endDate: subMonths(new Date(), 7),
    },
    annualizedReturn: 42.5,
    marketBenchmarkReturn: 12.5,
    performanceMetrics: {
      totalTrades: 350,
      winRate: 65.2,
      profitFactor: 2.1,
      averageWin: 18.5,
      averageLoss: -10.2,
      netProfit: 42500.50,
      totalProfit: 62500.75,
      totalLoss: -20000.25,
      maxDrawdown: 18.2,
      sharpeRatio: 1.6,
      successfulTrades: 228,
      failedTrades: 122,
      averageDuration: 180,
      bestTrade: 55.2,
      worstTrade: -28.5,
      consecutiveWins: 10,
      consecutiveLosses: 6,
      returnsVolatility: 18.5,
      sortinoRatio: 1.9,
      calmarRatio: 1.3,
      dailyReturns: Array(30).fill(0).map((_, i) => ({
        date: subDays(new Date(), i),
        return: (Math.random() * 8 - 3) / 100,
      })),
      monthlyReturns: Array(12).fill(0).map((_, i) => ({
        month: format(subMonths(new Date(), i), 'MMM yyyy'),
        return: (Math.random() * 20 - 8) / 100,
      })),
      annualReturns: Array(3).fill(0).map((_, i) => ({
        year: new Date().getFullYear() - i,
        return: (Math.random() * 50 - 15) / 100,
      })),
      riskAdjustedReturn: 22.5,
      kellyPercentage: 28.5,
      dollarReturn: 42500.50,
      percentageReturn: 42.5,
      benchmarkComparison: {
        spyReturn: 12.5,
        outperformance: 30.0,
      },
    }
  },
  {
    strategyId: '3',
    strategyName: 'Aggressive Strategy',
    riskProfile: 'aggressive',
    totalReturn: 55.0,
    totalTrades: 450,
    winningTrades: 281,
    losingTrades: 169,
    winRate: 62.5,
    profitFactor: 1.9,
    sharpeRatio: 1.4,
    trades: [],
    equityCurve: generateEquityCurveData(365, 100000),
    monthlyReturns: Array(12).fill(0).map((_, i) => ({
      month: format(subMonths(new Date(), i), 'MMM yyyy'),
      return: (Math.random() * 25 - 10) / 100,
    })),
    drawdowns: Array(5).fill(0).map(() => ({
      startDate: subMonths(new Date(), Math.floor(Math.random() * 12)),
      endDate: subMonths(new Date(), Math.floor(Math.random() * 6)),
      depth: Math.random() * 25,
      duration: Math.floor(Math.random() * 40) + 5,
    })),
    startDate: subYears(new Date(), 1),
    endDate: new Date(),
    initialCapital: 100000,
    finalCapital: 155000.25,
    maxDrawdown: {
      amount: 32500.50,
      percentage: 25.5,
      startDate: subMonths(new Date(), 5),
      endDate: subMonths(new Date(), 3),
    },
    annualizedReturn: 55.0,
    marketBenchmarkReturn: 12.5,
    performanceMetrics: {
      totalTrades: 450,
      winRate: 62.5,
      profitFactor: 1.9,
      averageWin: 25.2,
      averageLoss: -15.5,
      netProfit: 55000.25,
      totalProfit: 85000.50,
      totalLoss: -30000.25,
      maxDrawdown: 25.5,
      sharpeRatio: 1.4,
      successfulTrades: 281,
      failedTrades: 169,
      averageDuration: 240,
      bestTrade: 75.5,
      worstTrade: -38.2,
      consecutiveWins: 8,
      consecutiveLosses: 7,
      returnsVolatility: 22.5,
      sortinoRatio: 1.7,
      calmarRatio: 1.1,
      dailyReturns: Array(30).fill(0).map((_, i) => ({
        date: subDays(new Date(), i),
        return: (Math.random() * 10 - 4) / 100,
      })),
      monthlyReturns: Array(12).fill(0).map((_, i) => ({
        month: format(subMonths(new Date(), i), 'MMM yyyy'),
        return: (Math.random() * 25 - 10) / 100,
      })),
      annualReturns: Array(3).fill(0).map((_, i) => ({
        year: new Date().getFullYear() - i,
        return: (Math.random() * 60 - 20) / 100,
      })),
      riskAdjustedReturn: 28.5,
      kellyPercentage: 32.5,
      dollarReturn: 55000.25,
      percentageReturn: 55.0,
      benchmarkComparison: {
        spyReturn: 12.5,
        outperformance: 42.5,
      },
    }
  }
];
