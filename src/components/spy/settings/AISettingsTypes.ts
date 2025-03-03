
import { 
  AITradingSettings, 
  RiskToleranceType, 
  MarketCondition, 
  TimeOfDayPreference 
} from '@/lib/types/spy';

export interface AISettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRiskTolerance: RiskToleranceType;
  onRiskToleranceChange: (tolerance: RiskToleranceType) => void;
}

export const DEFAULT_SETTINGS: AITradingSettings = {
  enabledStrategies: ['moderate'],
  maxSimultaneousTrades: 3,
  maxDailyTrades: 5,
  autoAdjustVolatility: true,
  useMarketSentiment: true,
  considerEarningsEvents: true,
  considerFedMeetings: true,
  enableHedging: false,
  minimumConfidenceScore: 0.65,
  preferredTimeOfDay: 'any',
  positionSizing: {
    type: 'percentage',
    value: 5, // 5% of portfolio per trade
  },
  stopLossSettings: {
    enabled: true,
    type: 'percentage',
    value: 25, // 25% loss
  },
  takeProfitSettings: {
    enabled: true,
    type: 'risk-reward',
    value: 2, // 1:2 risk-reward ratio
  },
  marketConditionOverrides: {
    volatile: {
      enabled: true,
      adjustedRisk: 0.5, // reduce risk by 50% in volatile markets
    }
  },
  backtestingSettings: {
    startDate: new Date(new Date().getFullYear() - 10, 0, 1), // 10 years ago
    endDate: new Date(),
    initialCapital: 100000,
    dataSource: 'alpha-vantage',
    includeCommissions: true,
    commissionPerTrade: 0.65,
    includeTaxes: false,
    taxRate: 0.25,
  }
};

export const strategyDescriptions = {
  conservative: 'Focuses on capital preservation with lower-risk trades, longer expirations, and strict stop losses. Targets 5-8% returns with high win rate.',
  moderate: 'Balanced approach with a mix of daily and weekly options. Targets 10-15% returns with moderate risk management.',
  aggressive: 'Seeks higher returns with shorter expirations and larger position sizes. May use leveraged strategies targeting 20%+ returns.',
};

export const marketConditionDescriptions: Record<MarketCondition, string> = {
  bullish: 'Trending upward market with positive momentum',
  bearish: 'Trending downward market with negative momentum',
  neutral: 'Sideways or range-bound market with low directional bias',
  volatile: 'High volatility market with sharp movements in both directions',
};
