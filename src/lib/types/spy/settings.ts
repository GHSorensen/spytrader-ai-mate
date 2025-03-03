
import { RiskToleranceType, MarketCondition, TimeOfDayPreference } from './common';

export interface AITradingSettings {
  enabledStrategies: RiskToleranceType[];
  maxSimultaneousTrades: number;
  maxDailyTrades: number;
  autoAdjustVolatility: boolean;
  useMarketSentiment: boolean;
  considerEarningsEvents: boolean;
  considerFedMeetings: boolean;
  enableHedging: boolean;
  minimumConfidenceScore: number;
  preferredTimeOfDay: TimeOfDayPreference;
  positionSizing: {
    type: 'fixed' | 'percentage' | 'kelly';
    value: number; // dollar amount, percentage of portfolio, or kelly criterion multiplier
  };
  stopLossSettings: {
    enabled: boolean;
    type: 'fixed' | 'percentage' | 'atr-based';
    value: number;
  };
  takeProfitSettings: {
    enabled: boolean;
    type: 'fixed' | 'percentage' | 'risk-reward';
    value: number;
  };
  marketConditionOverrides: {
    [key in MarketCondition]?: {
      enabled: boolean;
      adjustedRisk: number; // 0-1, where 1 is full risk
    };
  };
  backtestingSettings: {
    startDate: Date;
    endDate: Date;
    initialCapital: number;
    dataSource: string;
    includeCommissions: boolean;
    commissionPerTrade: number;
    includeTaxes: boolean;
    taxRate: number;
  };
}
