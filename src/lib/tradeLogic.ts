
import { Trade, TradeDirection, MarketData, StrategyConfig, PerformanceMetric } from './types';

// Mock market data
export const getMarketData = (): MarketData[] => {
  return [
    { symbol: 'AAPL', price: 193.89, change: 2.13, changePercent: 1.11, volume: 52_456_789 },
    { symbol: 'TSLA', price: 175.29, change: -3.45, changePercent: -1.93, volume: 48_123_456 },
    { symbol: 'AMZN', price: 186.45, change: 1.23, changePercent: 0.66, volume: 31_789_012 },
    { symbol: 'MSFT', price: 426.53, change: 5.28, changePercent: 1.25, volume: 28_456_123 },
    { symbol: 'GOOGL', price: 175.76, change: 0.87, changePercent: 0.50, volume: 22_345_678 },
    { symbol: 'META', price: 475.32, change: 7.23, changePercent: 1.54, volume: 21_234_567 },
    { symbol: 'NVDA', price: 950.02, change: 15.42, changePercent: 1.65, volume: 38_789_123 },
    { symbol: 'AMD', price: 147.85, change: -2.15, changePercent: -1.43, volume: 25_678_901 }
  ];
};

// Mock trade data
export const getRecentTrades = (): Trade[] => {
  return [
    {
      id: '1',
      symbol: 'AAPL',
      direction: 'CALL',
      entryPrice: 190.25,
      targetPrice: 200.50,
      stopLoss: 185.75,
      quantity: 5,
      status: 'executed',
      timestamp: new Date(Date.now() - 86400000 * 3),
      expiryDate: new Date(Date.now() + 86400000 * 14),
      profit: 875,
      confidence: 0.78
    },
    {
      id: '2',
      symbol: 'TSLA',
      direction: 'PUT',
      entryPrice: 180.50,
      targetPrice: 170.25,
      stopLoss: 185.75,
      quantity: 3,
      status: 'executed',
      timestamp: new Date(Date.now() - 86400000 * 2),
      expiryDate: new Date(Date.now() + 86400000 * 7),
      profit: -320,
      confidence: 0.65
    },
    {
      id: '3',
      symbol: 'NVDA',
      direction: 'CALL',
      entryPrice: 930.75,
      targetPrice: 975.00,
      stopLoss: 915.25,
      quantity: 2,
      status: 'pending',
      timestamp: new Date(),
      expiryDate: new Date(Date.now() + 86400000 * 21),
      confidence: 0.92
    }
  ];
};

// Mock strategies
export const getStrategies = (): StrategyConfig[] => {
  return [
    {
      id: '1',
      name: 'Momentum Breakout',
      description: 'Identifies stocks breaking out of consolidation patterns with high volume',
      isEnabled: true,
      riskLevel: 7,
      timeFrame: '1d',
      maxPosition: 10,
      autoAdjust: true
    },
    {
      id: '2',
      name: 'Volatility Squeeze',
      description: 'Captures explosive moves after periods of low volatility',
      isEnabled: false,
      riskLevel: 8,
      timeFrame: '4h',
      maxPosition: 5,
      autoAdjust: false
    },
    {
      id: '3',
      name: 'Trend Following',
      description: 'Follows strong market trends with momentum confirmation',
      isEnabled: true,
      riskLevel: 5,
      timeFrame: '1d',
      maxPosition: 8,
      autoAdjust: true
    }
  ];
};

// Mock performance data
export const getPerformanceMetrics = (): PerformanceMetric => {
  return {
    totalTrades: 47,
    winRate: 68.3,
    profitFactor: 2.18,
    averageProfit: 432,
    averageLoss: -245,
    netProfit: 12680,
    sharpeRatio: 1.85,
    maxDrawdown: 3450,
    successfulTrades: 32,
    failedTrades: 15
  };
};

// Mock function to generate a new trade
export const generateTrade = (symbol: string, direction: TradeDirection): Trade => {
  const currentPrice = getMarketData().find(data => data.symbol === symbol)?.price || 100;
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    symbol,
    direction,
    entryPrice: currentPrice,
    targetPrice: direction === 'CALL' 
      ? currentPrice * 1.1 
      : currentPrice * 0.9,
    stopLoss: direction === 'CALL' 
      ? currentPrice * 0.95 
      : currentPrice * 1.05,
    quantity: Math.floor(Math.random() * 10) + 1,
    status: 'pending',
    timestamp: new Date(),
    expiryDate: new Date(Date.now() + 86400000 * 14),
    confidence: parseFloat((0.6 + Math.random() * 0.35).toFixed(2))
  };
};

// Mock API call simulation
export const executeTrade = async (trade: Trade): Promise<Trade> => {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulating trade execution
  return {
    ...trade,
    status: 'executed',
    timestamp: new Date()
  };
};
