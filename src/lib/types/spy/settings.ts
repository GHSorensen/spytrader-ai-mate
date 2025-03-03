
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
  
  // Advanced AI and analysis settings
  adaptivePositionSizing: boolean;
  advancedTechnicalAnalysis: boolean;
  technicalFundamentalBalance: number; // 0-100, higher means more technical
  shortLongTimeframeBalance: number; // 0-100, higher means more short-term focus
  
  // Automation settings
  maxCapitalDeployment: number; // percentage of portfolio to deploy
  autoPositionScaling: boolean;
  smartProfitTaking: boolean;
  
  // Risk factors
  considerEconomicData: boolean;
  considerGeopoliticalEvents: boolean;
  dailyLossLimitPct: number;
  volatilityThreshold: number; // VIX level
  
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
