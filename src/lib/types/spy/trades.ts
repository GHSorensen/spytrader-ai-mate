
import { OptionType, TradeStatus, MarketCondition } from "./common";

/**
 * Trade data
 */
export interface SpyTrade {
  id: string;
  optionId?: string;
  strategyId?: string;
  type: "CALL" | "PUT";
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
  executionTime?: Date;
  closingTime?: Date;
  profit: number;
  profitPercentage: number;
  confidenceScore: number;
  signal?: string;
  paperTrading?: boolean;
  marketCondition?: MarketCondition;
}
