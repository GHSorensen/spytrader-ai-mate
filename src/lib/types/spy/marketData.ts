// Types related to market data
export interface SpyMarketData {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  averageVolume: number;
  high: number;
  low: number;
  open: number;
  timestamp: Date;
  vix?: number;
  paperTrading?: boolean;
}
