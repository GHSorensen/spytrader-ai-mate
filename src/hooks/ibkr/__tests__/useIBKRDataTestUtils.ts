
/**
 * Test utilities for IBKR data hooks
 */

import { SpyMarketData } from "@/lib/types/spy/marketData";
import { SpyOption } from "@/lib/types/spy/options";

/**
 * Creates mock market data for testing
 */
export const createMockMarketData = (): SpyMarketData => {
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
    timestamp: new Date(), // Fixed: Using Date object instead of string
    vix: 15.23,
    paperTrading: false,
  };
};

/**
 * Creates mock options for testing
 */
export const createMockOptions = (): SpyOption[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

  return [
    {
      id: "test-opt-1",
      symbol: "SPY",
      strikePrice: 500,
      expirationDate: nextWeek, // Fixed: Using Date object instead of string
      type: "CALL",
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
      id: "test-opt-2",
      symbol: "SPY",
      strikePrice: 495,
      expirationDate: nextMonth, // Fixed: Using Date object instead of string
      type: "PUT",
      premium: 2.87,
      impliedVolatility: 0.19,
      openInterest: 9876,
      volume: 2198,
      delta: -0.48,
      gamma: 0.07,
      theta: -0.14,
      vega: 0.11,
      paperTrading: false,
    }
  ];
};
