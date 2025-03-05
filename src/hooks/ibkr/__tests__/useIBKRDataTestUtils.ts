
import { SpyMarketData, SpyOption } from "@/lib/types/spy";
import { IBKRConnectionStatus } from "@/lib/types/ibkr";

/**
 * Mock data generator utilities for testing IBKR data hooks
 */

/**
 * Generate mock market data for testing
 */
export const createMockMarketData = (overrides?: Partial<SpyMarketData>): SpyMarketData => {
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
    ...overrides
  };
};

/**
 * Generate mock options data for testing
 */
export const createMockOptions = (count: number = 4): SpyOption[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

  const baseOptions = [
    {
      id: "test-opt-1",
      symbol: "SPY",
      strikePrice: 500,
      expirationDate: nextWeek,
      type: "CALL" as const,
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
      expirationDate: nextWeek,
      type: "PUT" as const,
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
      id: "test-opt-3",
      symbol: "SPY",
      strikePrice: 505,
      expirationDate: nextMonth,
      type: "CALL" as const,
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
      id: "test-opt-4",
      symbol: "SPY",
      strikePrice: 490,
      expirationDate: nextMonth,
      type: "PUT" as const,
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

  return baseOptions.slice(0, count);
};

/**
 * Mock connection diagnostics for testing
 */
export const createMockConnectionDiagnostics = (status: IBKRConnectionStatus) => {
  return {
    status,
    lastChecked: new Date(),
    connected: status === 'connected',
    error: status === 'error' ? 'Connection error' : null,
    dataSource: status === 'connected' ? 'live' : 'mock',
    apiVersion: '1.0.0',
    sessionId: 'test-session-123',
    latency: 15,
  };
};
