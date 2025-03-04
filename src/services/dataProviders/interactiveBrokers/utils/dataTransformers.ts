
import { SpyOption, SpyMarketData } from "@/lib/types/spy";
import { generateMockOptions, generateMockMarketData } from "./mockData";

/**
 * Parse IBKR market data response to our format
 */
export const parseMarketData = (ibkrData: any): SpyMarketData => {
  // This would parse real IBKR data in production
  // Mock implementation for now
  return {
    price: ibkrData?.last || 500.25,
    previousClose: ibkrData?.prevClose || 498.75,
    change: ibkrData?.change || 1.5,
    changePercent: ibkrData?.changePercent || 0.3,
    volume: ibkrData?.volume || 5200000,
    averageVolume: ibkrData?.avgVolume || 6500000,
    high: ibkrData?.high || 502.50,
    low: ibkrData?.low || 499.00,
    open: ibkrData?.open || 499.25,
    timestamp: ibkrData?.timestamp ? new Date(ibkrData.timestamp) : new Date(),
    vix: ibkrData?.vix || 16.25,
    paperTrading: ibkrData?.paperTrading || false,
  };
};

/**
 * Parse IBKR option data to our format
 */
export const parseOptions = (ibkrOptions: any[]): SpyOption[] => {
  // This would parse real IBKR options data in production
  // Mock implementation for now
  if (!ibkrOptions || !Array.isArray(ibkrOptions)) {
    return generateMockOptions();
  }
  
  return ibkrOptions.map((opt, index) => ({
    id: opt.id || `ibkr-opt-${index}`,
    symbol: opt.symbol || "SPY",
    strikePrice: opt.strike || 500 + (index * 5),
    expirationDate: opt.expiry ? new Date(opt.expiry) : new Date(Date.now() + 86400000 * 7),
    type: opt.putCall || (index % 2 === 0 ? "CALL" : "PUT"),
    premium: opt.premium || 3.5 + (index * 0.25),
    impliedVolatility: opt.iv || 0.2 + (index * 0.01),
    openInterest: opt.openInterest || 1000 + (index * 100),
    volume: opt.volume || 500 + (index * 50),
    delta: opt.delta || (opt.putCall === "CALL" ? 0.5 + (index * 0.05) : -0.5 - (index * 0.05)),
    gamma: opt.gamma || 0.05 + (index * 0.01),
    theta: opt.theta || -0.1 - (index * 0.01),
    vega: opt.vega || 0.1 + (index * 0.01),
    paperTrading: opt.paperTrading || false,
  }));
};
