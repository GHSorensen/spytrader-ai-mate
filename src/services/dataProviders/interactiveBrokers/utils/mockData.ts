
import { SpyOption, SpyTrade, OptionType, TradeStatus, SpyMarketData } from "@/lib/types/spy";

/**
 * Generate mock options for development/testing
 */
export const generateMockOptions = (): SpyOption[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

  return [
    {
      id: "ibkr-opt-1",
      symbol: "SPY",
      strikePrice: 500,
      expirationDate: nextWeek,
      type: "CALL" as OptionType,
      premium: 3.45,
      impliedVolatility: 0.21,
      openInterest: 12543,
      volume: 3421,
      delta: 0.56,
      gamma: 0.08,
      theta: -0.15,
      vega: 0.12,
      paperTrading: false,
    },
    {
      id: "ibkr-opt-2",
      symbol: "SPY",
      strikePrice: 495,
      expirationDate: nextWeek,
      type: "PUT" as OptionType,
      premium: 2.87,
      impliedVolatility: 0.19,
      openInterest: 9876,
      volume: 2198,
      delta: -0.48,
      gamma: 0.07,
      theta: -0.14,
      vega: 0.11,
      paperTrading: false,
    },
    {
      id: "ibkr-opt-3",
      symbol: "SPY",
      strikePrice: 505,
      expirationDate: nextMonth,
      type: "CALL" as OptionType,
      premium: 5.67,
      impliedVolatility: 0.23,
      openInterest: 7654,
      volume: 1876,
      delta: 0.52,
      gamma: 0.06,
      theta: -0.11,
      vega: 0.14,
      paperTrading: false,
    },
    {
      id: "ibkr-opt-4",
      symbol: "SPY",
      strikePrice: 490,
      expirationDate: nextMonth,
      type: "PUT" as OptionType,
      premium: 4.32,
      impliedVolatility: 0.22,
      openInterest: 5432,
      volume: 1543,
      delta: -0.45,
      gamma: 0.05,
      theta: -0.10,
      vega: 0.13,
      paperTrading: false,
    },
  ];
};

/**
 * Generate mock trades for development/testing
 */
export const generateMockTrades = (): SpyTrade[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  return [
    {
      id: "ibkr-trade-1",
      optionId: "ibkr-opt-1",
      type: "CALL",
      strikePrice: 500,
      expirationDate: nextWeek,
      entryPrice: 3.25,
      currentPrice: 3.45,
      targetPrice: 4.50,
      stopLoss: 2.75,
      quantity: 5,
      status: "active" as TradeStatus,
      openedAt: yesterday,
      profit: 100,
      profitPercentage: 6.15,
      confidenceScore: 0.78,
      paperTrading: false,
    },
    {
      id: "ibkr-trade-2",
      optionId: "ibkr-opt-2",
      type: "PUT",
      strikePrice: 495,
      expirationDate: nextWeek,
      entryPrice: 2.95,
      currentPrice: 2.87,
      targetPrice: 3.75,
      stopLoss: 2.40,
      quantity: 3,
      status: "active" as TradeStatus,
      openedAt: yesterday,
      profit: -24,
      profitPercentage: -2.71,
      confidenceScore: 0.65,
      paperTrading: false,
    },
  ];
};

/**
 * Generate mock market data for development/testing
 */
export const generateMockMarketData = (): SpyMarketData => {
  const now = new Date();
  
  return {
    price: 498.75,
    previousClose: 497.82,
    change: 0.93,
    changePercent: 0.19,
    volume: 31840213,
    averageVolume: 42615200,
    high: 501.15,
    low: 498.12,
    open: 498.45,
    timestamp: now,
    vix: 15.23,
    paperTrading: false,
  };
};
