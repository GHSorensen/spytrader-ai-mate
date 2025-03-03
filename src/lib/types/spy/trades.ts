
import { OptionType, TradeStatus } from './common';

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
}
