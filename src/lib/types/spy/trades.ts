import { OptionType, TradeStatus } from "./options";

/**
 * Trade data
 */
export interface SpyTrade {
  id: string;
  optionId?: string;
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
  profit: number;
  profitPercentage: number;
  confidenceScore: number;
  signal?: string;
  paperTrading?: boolean;
}
