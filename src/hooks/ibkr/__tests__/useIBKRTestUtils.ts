
import { SpyMarketData } from "@/lib/types/spy/marketData";
import { SpyOption } from "@/lib/types/spy/options";
import { ClassifiedError, ErrorCategory } from "@/lib/errorMonitoring/types/errorClassification";

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
    timestamp: new Date(),
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
      expirationDate: nextWeek,
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
      expirationDate: nextMonth,
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

/**
 * Mock function creator for testing
 */
export const createMockCheckConnectionFn = () => jest.fn();

/**
 * Creates a mock executeWithRetry function
 */
export const createMockExecuteWithRetryFn = (shouldSucceed: boolean = true) => {
  if (shouldSucceed) {
    return jest.fn().mockResolvedValue(true);
  } else {
    return jest.fn().mockRejectedValue(new Error("Connection failed"));
  }
};

/**
 * Creates a mock setInternalErrors function
 */
export const createMockSetInternalErrorsFn = () => jest.fn();

/**
 * Test utility to create initial test errors
 */
export const createTestErrors = (): ClassifiedError[] => {
  return [
    {
      message: "Test error for testing",
      errorType: "TEST_ERROR",
      method: "testMethod",
      category: ErrorCategory.API,
      timestamp: new Date(),
      details: { additionalInfo: "test details" }
    } as ClassifiedError
  ];
};
