
import { TradingStrategy } from '@/lib/types/spy/strategies';
import { OptionExpiry, MarketCondition } from '@/lib/types/spy/common';

export const createDefaultStrategy = (): TradingStrategy => {
  return {
    id: "default-strategy",
    name: "Default Strategy",
    description: "A basic trading strategy for testing",
    isActive: true,
    riskLevel: 5,
    timeFrame: "1d",
    optionType: "BOTH" as const,
    expiryPreference: ["weekly", "monthly"] as Array<OptionExpiry>,
    deltaRange: [0.3, 0.7] as [number, number],
    maxPositionSize: 10,
    maxLossPerTrade: 25,
    profitTarget: 50,
    marketCondition: "neutral" as MarketCondition,
    averageHoldingPeriod: 5,
    successRate: 0.6
  };
};
