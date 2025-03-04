
import { format, subMonths, subYears } from 'date-fns';
import { BacktestResult, RiskToleranceType, PerformanceMetrics } from '@/lib/types/spy';
import { generateEquityCurveData, generateMonthlyPerformanceData } from './useMockChartData';

// Helper function to create a performance metrics object
const createPerformanceMetrics = (
  totalTrades: number,
  winRate: number,
  profitFactor: number,
  averageWin: number,
  averageLoss: number,
  netProfit: number,
  maxDrawdown: number,
  sharpeRatio: number,
  sortinoRatio: number,
  calmarRatio: number,
  benchmarkReturn: number
): PerformanceMetrics => {
  const successfulTrades = Math.round(totalTrades * (winRate / 100));
  const failedTrades = totalTrades - successfulTrades;
  
  return {
    totalTrades,
    winRate,
    profitFactor,
    averageWin,
    averageLoss,
    netProfit,
    totalProfit: netProfit + Math.abs(averageLoss * failedTrades),
    totalLoss: -Math.abs(averageLoss * failedTrades),
    maxDrawdown,
    sharpeRatio,
    successfulTrades,
    failedTrades,
    averageDuration: 120 + Math.floor(Math.random() * 120), // in minutes
    bestTrade: averageWin * 2,
    worstTrade: averageLoss * 1.5,
    consecutiveWins: Math.floor(Math.random() * 10) + 5,
    consecutiveLosses: Math.floor(Math.random() * 5) + 3,
    returnsVolatility: Math.random() * 10 + 10,
    sortinoRatio,
    calmarRatio,
    dailyReturns: Array(30).fill(0).map((_, i) => ({
      date: subMonths(new Date(), i),
      return: (Math.random() * 6 - 2) / 100, // -2% to 4%
    })),
    monthlyReturns: Array(12).fill(0).map((_, i) => ({
      month: format(subMonths(new Date(), i), 'MMM yyyy'),
      return: (Math.random() * 15 - 5) / 100, // -5% to 10%
    })),
    annualReturns: Array(3).fill(0).map((_, i) => ({
      year: new Date().getFullYear() - i,
      return: (Math.random() * 40 - 10) / 100, // -10% to 30%
    })),
    riskAdjustedReturn: netProfit / (maxDrawdown || 1),
    kellyPercentage: (winRate / 100) - ((1 - (winRate / 100)) / (averageWin / Math.abs(averageLoss))),
    dollarReturn: netProfit,
    percentageReturn: netProfit / 1000,
    benchmarkComparison: {
      spyReturn: benchmarkReturn,
      outperformance: (netProfit / 1000) - benchmarkReturn,
    },
  };
};

export const createMockBacktestResults = (): BacktestResult[] => {
  const startDate = subYears(new Date(), 1);
  const endDate = new Date();
  
  return [
    {
      strategyId: '1',
      strategyName: 'Conservative Strategy',
      riskProfile: 'conservative' as RiskToleranceType,
      totalReturn: 35.25,
      totalTrades: 250,
      winningTrades: 171,
      losingTrades: 79,
      winRate: 68.5,
      profitFactor: 2.3,
      sharpeRatio: 1.8,
      performanceMetrics: createPerformanceMetrics(
        250, // totalTrades
        68.5, // winRate
        2.3, // profitFactor
        15.2, // averageWin
        -8.5, // averageLoss
        35250.75, // netProfit
        12.5, // maxDrawdown
        1.8, // sharpeRatio
        2.1, // sortinoRatio
        1.5, // calmarRatio
        12.5 // benchmarkReturn
      ),
      trades: [], // Would contain actual trade data
      equityCurve: generateEquityCurveData(365, 100000).map(item => ({
        date: item.date,
        equity: item.value,
      })),
      monthlyReturns: generateMonthlyPerformanceData(12),
      drawdowns: Array(5).fill(0).map(() => ({
        startDate: subMonths(new Date(), Math.floor(Math.random() * 12)),
        endDate: subMonths(new Date(), Math.floor(Math.random() * 6)),
        depth: Math.random() * 15,
        duration: Math.floor(Math.random() * 30) + 5,
      })),
      startDate,
      endDate,
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
    },
    {
      strategyId: '2',
      strategyName: 'Moderate Strategy',
      riskProfile: 'moderate' as RiskToleranceType,
      totalReturn: 42.5,
      totalTrades: 350,
      winningTrades: 228,
      losingTrades: 122,
      winRate: 65.2,
      profitFactor: 2.1,
      sharpeRatio: 1.6,
      performanceMetrics: createPerformanceMetrics(
        350, // totalTrades
        65.2, // winRate
        2.1, // profitFactor
        18.5, // averageWin
        -10.2, // averageLoss
        42500.50, // netProfit
        18.2, // maxDrawdown
        1.6, // sharpeRatio
        1.9, // sortinoRatio
        1.3, // calmarRatio
        12.5 // benchmarkReturn
      ),
      trades: [], // Would contain actual trade data
      equityCurve: generateEquityCurveData(365, 100000).map(item => ({
        date: item.date,
        equity: item.value,
      })),
      monthlyReturns: generateMonthlyPerformanceData(12),
      drawdowns: Array(5).fill(0).map(() => ({
        startDate: subMonths(new Date(), Math.floor(Math.random() * 12)),
        endDate: subMonths(new Date(), Math.floor(Math.random() * 6)),
        depth: Math.random() * 20,
        duration: Math.floor(Math.random() * 35) + 5,
      })),
      startDate,
      endDate,
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
    },
    {
      strategyId: '3',
      strategyName: 'Aggressive Strategy',
      riskProfile: 'aggressive' as RiskToleranceType,
      totalReturn: 55.0,
      totalTrades: 450,
      winningTrades: 281,
      losingTrades: 169,
      winRate: 62.5,
      profitFactor: 1.9,
      sharpeRatio: 1.4,
      performanceMetrics: createPerformanceMetrics(
        450, // totalTrades
        62.5, // winRate
        1.9, // profitFactor
        25.2, // averageWin
        -15.5, // averageLoss
        55000.25, // netProfit
        25.5, // maxDrawdown
        1.4, // sharpeRatio
        1.7, // sortinoRatio
        1.1, // calmarRatio
        12.5 // benchmarkReturn
      ),
      trades: [], // Would contain actual trade data
      equityCurve: generateEquityCurveData(365, 100000).map(item => ({
        date: item.date,
        equity: item.value,
      })),
      monthlyReturns: generateMonthlyPerformanceData(12),
      drawdowns: Array(5).fill(0).map(() => ({
        startDate: subMonths(new Date(), Math.floor(Math.random() * 12)),
        endDate: subMonths(new Date(), Math.floor(Math.random() * 6)),
        depth: Math.random() * 25,
        duration: Math.floor(Math.random() * 40) + 5,
      })),
      startDate,
      endDate,
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
    },
  ];
};
