
import { OptionType } from './common';

/**
 * Option data
 */
export interface SpyOption {
  id: string;
  strikePrice: number;
  expirationDate: Date;
  type: OptionType;
  premium: number;
  impliedVolatility: number;
  openInterest: number;
  volume: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  symbol?: string;
  paperTrading?: boolean;
}
