
import { SpyMarketData } from '@/lib/types/spy/marketData';

/**
 * Generates mock current market data for demonstration purposes
 */
export const generateMockCurrentData = (): SpyMarketData => {
  return {
    price: 415.50,
    previousClose: 412.25,
    change: 3.25,
    changePercent: 0.79,
    volume: 78500000,
    averageVolume: 72000000,
    high: 416.75,
    low: 413.20,
    open: 413.50,
    timestamp: new Date(),
    vix: 18.5
  };
};

/**
 * Generates mock historical market data for demonstration purposes
 * @returns An array of 30 days of historical market data
 */
export const generateMockHistoricalData = (): SpyMarketData[] => {
  // Create 30 days of historical data
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    
    // Add some randomness to make it realistic
    const basePrice = 410 + Math.sin(i * 0.3) * 8;
    const randomFactor = Math.random() * 2 - 1;
    
    return {
      price: basePrice + randomFactor,
      previousClose: basePrice - 0.25,
      change: randomFactor + 0.25,
      changePercent: (randomFactor + 0.25) / basePrice * 100,
      volume: 70000000 + Math.random() * 10000000,
      averageVolume: 72000000,
      high: basePrice + 1 + randomFactor,
      low: basePrice - 1 + randomFactor,
      open: basePrice - 0.5 + randomFactor,
      timestamp: date,
      vix: 17 + Math.sin(i * 0.4) * 3
    };
  });
};
