
import { OptionType, TradeStatus, MarketCondition } from './common';

export interface SpyTrade {
  id: string;
  optionId: string;
  type: OptionType;
  strikePrice: number;
  expirationDate: Date;
  entryPrice: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  quantity: number;
  status: TradeStatus;
  openedAt: Date;
  closedAt?: Date;
  profit?: number;
  profitPercentage?: number;
  confidenceScore: number;
  
  // Adding the missing properties used in strategyLearningService
  strategyId?: string;
  executionTime?: Date;
  closingTime?: Date;
  marketCondition?: MarketCondition;
}

