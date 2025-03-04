
import { useState, useCallback } from 'react';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { 
  PerformanceMetrics, 
  PerformanceSummary,
  TradeAnalytics,
  PerformanceChartData,
  BacktestResult,
  RiskToleranceType
} from '@/lib/types/spy';

export const useMockPerformanceData = () => {
  // Mock performance summary data
  const mockPerformanceSummary: PerformanceSummary = {
    today: {
      profit: 1250.75,
      percentageChange: 2.3,
      tradesOpened: 5,
      tradesClosed: 3,
    },
    week: {
      profit: 3450.25,
      percentageChange: 5.8,
      tradesOpened: 12,
      tradesClosed: 10,
    },
    month: {
      profit: 8750.50,
      percentageChange: 12.4,
      tradesOpened: 45,
      tradesClosed: 42,
    },
    year: {
      profit: 42500.75,
      percentageChange: 35.2,
      tradesOpened: 215,
      tradesClosed: 205,
      winRate: 68.5,
    },
    allTime: {
      profit: 87500.25,
      percentageChange: 87.5,
      totalTrades: 450,
      winRate: 71.2,
      startDate: new Date('2022-01-01'),
    },
  };

  // Mock trade analytics data
  const mockTradeAnalytics: TradeAnalytics = {
    byStrategy: [
      {
        strategyId: '1',
        strategyName: 'Momentum Breakout',
        trades: 120,
        winRate: 72.5,
        averageReturn: 15.3,
        totalProfit: 25750.50,
      },
      {
        strategyId: '2',
        strategyName: 'Volatility Crush',
        trades: 85,
        winRate: 68.2,
        averageReturn: 12.8,
        totalProfit: 18250.75,
      },
      {
        strategyId: '3',
        strategyName: 'Mean Reversion',
        trades: 95,
        winRate: 65.8,
        averageReturn: 10.5,
        totalProfit: 15500.25,
      },
      {
        strategyId: '4',
        strategyName: 'Trend Following',
        trades: 150,
        winRate: 75.3,
        averageReturn: 18.2,
        totalProfit: 28000.50,
      },
    ],
    byOptionType: [
      {
        type: 'CALL',
        trades: 250,
        winRate: 73.5,
        averageReturn: 16.8,
        totalProfit: 48750.25,
      },
      {
        type: 'PUT',
        trades: 200,
        winRate: 68.5,
        averageReturn: 14.2,
        totalProfit: 38750.50,
      },
    ],
    byExpiry: [
      {
        expiry: 'daily',
        trades: 120,
        winRate: 65.8,
        averageReturn: 12.5,
        totalProfit: 22500.75,
      },
      {
        expiry: 'weekly',
        trades: 220,
        winRate: 72.5,
        averageReturn: 15.8,
        totalProfit: 42500.50,
      },
      {
        expiry: 'monthly',
        trades: 110,
        winRate: 75.2,
        averageReturn: 18.5,
        totalProfit: 22500.25,
      },
    ],
    byHoldingPeriod: [
      {
        period: '0-1 days',
        trades: 150,
        winRate: 68.5,
        averageReturn: 12.8,
        totalProfit: 28750.50,
      },
      {
        period: '1-3 days',
        trades: 180,
        winRate: 72.5,
        averageReturn: 15.3,
        totalProfit: 35500.25,
      },
      {
        period: '3-7 days',
        trades: 85,
        winRate: 75.8,
        averageReturn: 18.2,
        totalProfit: 18250.75,
      },
      {
        period: '>7 days',
        trades: 35,
        winRate: 62.5,
        averageReturn: 10.5,
        totalProfit: 5000.50,
      },
    ],
  };

  // Generate mock equity curve data
  const generateEquityCurveData = useCallback((days: number, startValue: number = 100000) => {
    const data = [];
    let currentValue = startValue;
    let benchmarkValue = startValue;
    
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      
      // Random daily change between -2% and 3%
      const dailyChange = (Math.random() * 5 - 2) / 100;
      currentValue = currentValue * (1 + dailyChange);
      
      // Random benchmark change between -1.5% and 2%
      const benchmarkChange = (Math.random() * 3.5 - 1.5) / 100;
      benchmarkValue = benchmarkValue * (1 + benchmarkChange);
      
      data.push({
        date,
        value: Math.round(currentValue * 100) / 100,
        benchmarkValue: Math.round(benchmarkValue * 100) / 100,
      });
    }
    
    return data;
  }, []);

  // Generate mock monthly performance data
  const generateMonthlyPerformanceData = useCallback((months: number) => {
    const data = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(currentDate, i);
      const monthName = format(date, 'MMM yyyy');
      
      // Random monthly return between -15% and 20%
      const monthlyReturn = Math.round((Math.random() * 35 - 15) * 10) / 10;
      
      data.push({
        month: monthName,
        return: monthlyReturn,
      });
    }
    
    return data;
  }, []);

  // Generate mock profit distribution data
  const generateProfitDistributionData = useCallback(() => {
    const ranges = [
      '-50% to -40%',
      '-40% to -30%',
      '-30% to -20%',
      '-20% to -10%',
      '-10% to 0%',
      '0% to 10%',
      '10% to 20%',
      '20% to 30%',
      '30% to 40%',
      '40% to 50%',
      '50%+',
    ];
    
    return ranges.map(range => ({
      range,
      count: Math.floor(Math.random() * 50) + (range.includes('-') ? 5 : 15), // More positive results
    }));
  }, []);

  // Generate mock drawdowns data
  const generateDrawdownsData = useCallback((count: number) => {
    const data = [];
    const currentDate = new Date();
    
    for (let i = 0; i < count; i++) {
      const startDate = subDays(currentDate, Math.floor(Math.random() * 365) + 30);
      const durationDays = Math.floor(Math.random() * 30) + 5;
      const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      
      data.push({
        startDate,
        endDate,
        duration: durationDays,
        depthPercent: Math.round((Math.random() * 25 + 5) * 10) / 10, // 5% to 30%
        recoveryDays: Math.floor(Math.random() * 45) + 5,
      });
    }
    
    // Sort by depth (largest first)
    return data.sort((a, b) => b.depthPercent - a.depthPercent);
  }, []);

  // Mock performance chart data
  const mockPerformanceChartData: PerformanceChartData = {
    equityCurve: generateEquityCurveData(365),
    profitDistribution: generateProfitDistributionData(),
    monthlyPerformance: generateMonthlyPerformanceData(24),
    drawdowns: generateDrawdownsData(10),
  };

  // Mock backtest results
  const mockBacktestResults: BacktestResult[] = [
    {
      strategyId: '1',
      strategyName: 'Conservative Strategy',
      riskProfile: 'conservative' as RiskToleranceType,
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
        averageDuration: 120, // in minutes
        bestTrade: 45.8,
        worstTrade: -22.5,
        consecutiveWins: 12,
        consecutiveLosses: 5,
        returnsVolatility: 15.2,
        sortinoRatio: 2.1,
        calmarRatio: 1.5,
        dailyReturns: Array(30).fill(0).map((_, i) => ({
          date: subDays(new Date(), i),
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
        riskAdjustedReturn: 18.5,
        kellyPercentage: 25.2,
        dollarReturn: 35250.75,
        percentageReturn: 35.25,
        benchmarkComparison: {
          spyReturn: 12.5,
          outperformance: 22.75,
        },
      },
      // Additional properties required by BacktestResult
      totalReturn: 35.25,
      totalTrades: 250,
      winningTrades: 171,
      losingTrades: 79,
      winRate: 68.5,
      profitFactor: 2.3,
      sharpeRatio: 1.8,
      trades: [], // Would contain actual trade data
      equityCurve: generateEquityCurveData(365, 100000).map(item => ({
        date: item.date,
        equity: item.value,
      })),
      monthlyReturns: Array(12).fill(0).map((_, i) => ({
        month: format(subMonths(new Date(), i), 'MMM yyyy'),
        return: (Math.random() * 15 - 5) / 100, // -5% to 10%
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
    },
    {
      strategyId: '2',
      strategyName: 'Moderate Strategy',
      riskProfile: 'moderate' as RiskToleranceType,
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
        averageDuration: 180, // in minutes
        bestTrade: 55.2,
        worstTrade: -28.5,
        consecutiveWins: 10,
        consecutiveLosses: 6,
        returnsVolatility: 18.5,
        sortinoRatio: 1.9,
        calmarRatio: 1.3,
        dailyReturns: Array(30).fill(0).map((_, i) => ({
          date: subDays(new Date(), i),
          return: (Math.random() * 8 - 3) / 100, // -3% to 5%
        })),
        monthlyReturns: Array(12).fill(0).map((_, i) => ({
          month: format(subMonths(new Date(), i), 'MMM yyyy'),
          return: (Math.random() * 20 - 8) / 100, // -8% to 12%
        })),
        annualReturns: Array(3).fill(0).map((_, i) => ({
          year: new Date().getFullYear() - i,
          return: (Math.random() * 50 - 15) / 100, // -15% to 35%
        })),
        riskAdjustedReturn: 22.5,
        kellyPercentage: 28.5,
        dollarReturn: 42500.50,
        percentageReturn: 42.5,
        benchmarkComparison: {
          spyReturn: 12.5,
          outperformance: 30.0,
        },
      },
      // Additional properties required by BacktestResult
      totalReturn: 42.5,
      totalTrades: 350,
      winningTrades: 228,
      losingTrades: 122,
      winRate: 65.2,
      profitFactor: 2.1,
      sharpeRatio: 1.6,
      trades: [], // Would contain actual trade data
      equityCurve: generateEquityCurveData(365, 100000).map(item => ({
        date: item.date,
        equity: item.value,
      })),
      monthlyReturns: Array(12).fill(0).map((_, i) => ({
        month: format(subMonths(new Date(), i), 'MMM yyyy'),
        return: (Math.random() * 20 - 8) / 100, // -8% to 12%
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
    },
    {
      strategyId: '3',
      strategyName: 'Aggressive Strategy',
      riskProfile: 'aggressive' as RiskToleranceType,
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
        averageDuration: 240, // in minutes
        bestTrade: 75.5,
        worstTrade: -38.2,
        consecutiveWins: 8,
        consecutiveLosses: 7,
        returnsVolatility: 22.5,
        sortinoRatio: 1.7,
        calmarRatio: 1.1,
        dailyReturns: Array(30).fill(0).map((_, i) => ({
          date: subDays(new Date(), i),
          return: (Math.random() * 10 - 4) / 100, // -4% to 6%
        })),
        monthlyReturns: Array(12).fill(0).map((_, i) => ({
          month: format(subMonths(new Date(), i), 'MMM yyyy'),
          return: (Math.random() * 25 - 10) / 100, // -10% to 15%
        })),
        annualReturns: Array(3).fill(0).map((_, i) => ({
          year: new Date().getFullYear() - i,
          return: (Math.random() * 60 - 20) / 100, // -20% to 40%
        })),
        riskAdjustedReturn: 28.5,
        kellyPercentage: 32.5,
        dollarReturn: 55000.25,
        percentageReturn: 55.0,
        benchmarkComparison: {
          spyReturn: 12.5,
          outperformance: 42.5,
        },
      },
      // Additional properties required by BacktestResult
      totalReturn: 55.0,
      totalTrades: 450,
      winningTrades: 281,
      losingTrades: 169,
      winRate: 62.5,
      profitFactor: 1.9,
      sharpeRatio: 1.4,
      trades: [], // Would contain actual trade data
      equityCurve: generateEquityCurveData(365, 100000).map(item => ({
        date: item.date,
        equity: item.value,
      })),
      monthlyReturns: Array(12).fill(0).map((_, i) => ({
        month: format(subMonths(new Date(), i), 'MMM yyyy'),
        return: (Math.random() * 25 - 10) / 100, // -10% to 15%
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
    },
  ];

  // Return all the mock data and helper functions
  return {
    mockPerformanceSummary,
    mockTradeAnalytics,
    mockPerformanceChartData,
    mockBacktestResults,
    // Helper functions
    generateEquityCurveData,
    generateMonthlyPerformanceData,
    generateProfitDistributionData,
    generateDrawdownsData,
  };
};
