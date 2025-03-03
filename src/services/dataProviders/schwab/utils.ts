
import { SpyOption, SpyTrade, OptionType, TradeStatus } from "@/lib/types/spy";

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
      id: "opt-s1",
      strikePrice: 500,
      expirationDate: nextWeek,
      type: "CALL" as OptionType,
      premium: 3.55,
      impliedVolatility: 0.22,
      openInterest: 13000,
      volume: 3500,
      delta: 0.58,
      gamma: 0.09,
      theta: -0.16,
      vega: 0.13,
    },
    {
      id: "opt-s2",
      strikePrice: 495,
      expirationDate: nextWeek,
      type: "PUT" as OptionType,
      premium: 2.95,
      impliedVolatility: 0.20,
      openInterest: 10000,
      volume: 2200,
      delta: -0.49,
      gamma: 0.08,
      theta: -0.14,
      vega: 0.12,
    },
    {
      id: "opt-s3",
      strikePrice: 505,
      expirationDate: nextMonth,
      type: "CALL" as OptionType,
      premium: 5.85,
      impliedVolatility: 0.24,
      openInterest: 7800,
      volume: 1900,
      delta: 0.54,
      gamma: 0.07,
      theta: -0.12,
      vega: 0.15,
    },
    {
      id: "opt-s4",
      strikePrice: 490,
      expirationDate: nextMonth,
      type: "PUT" as OptionType,
      premium: 4.45,
      impliedVolatility: 0.23,
      openInterest: 5500,
      volume: 1600,
      delta: -0.46,
      gamma: 0.06,
      theta: -0.11,
      vega: 0.14,
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
      id: "trade-s1",
      optionId: "opt-s1",
      type: "CALL",
      strikePrice: 500,
      expirationDate: nextWeek,
      entryPrice: 3.35,
      currentPrice: 3.55,
      targetPrice: 4.75,
      stopLoss: 2.85,
      quantity: 5,
      status: "active" as TradeStatus,
      openedAt: yesterday,
      profit: 100,
      profitPercentage: 5.97,
      confidenceScore: 0.80,
    },
    {
      id: "trade-s2",
      optionId: "opt-s2",
      type: "PUT",
      strikePrice: 495,
      expirationDate: nextWeek,
      entryPrice: 3.05,
      currentPrice: 2.95,
      targetPrice: 3.85,
      stopLoss: 2.50,
      quantity: 3,
      status: "active" as TradeStatus,
      openedAt: yesterday,
      profit: -30,
      profitPercentage: -3.28,
      confidenceScore: 0.68,
    },
  ];
};
