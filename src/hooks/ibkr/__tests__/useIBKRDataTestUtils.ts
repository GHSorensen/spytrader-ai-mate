
import { SpyMarketData, SpyOption } from '@/lib/types/spy';

/**
 * Creates mock market data for testing
 */
export const createMockMarketData = (): SpyMarketData => ({
  symbol: 'SPY',
  price: 458.92,
  change: 1.23,
  changePercent: 0.27,
  high: 460.45,
  low: 457.12,
  open: 458.11,
  previousClose: 457.69,
  volume: 67584200,
  timestamp: new Date().toISOString(),
});

/**
 * Creates mock options data for testing
 */
export const createMockOptions = (count = 10): SpyOption[] => {
  const result: SpyOption[] = [];
  const today = new Date();
  
  // Create expiry dates (weekly options)
  const expiryDates = Array.from({ length: 4 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + ((5 - date.getDay()) % 7) + 7 * i); // Next 4 Fridays
    return date.toISOString().split('T')[0];
  });
  
  // Mock strike prices around current SPY price
  const baseStrike = 460;
  const strikeRange = Array.from({ length: 5 }).map((_, i) => baseStrike - 10 + i * 5);
  
  // Generate options with different strikes and expiries
  for (let i = 0; i < count; i++) {
    const isCall = i % 2 === 0;
    const strikeIndex = i % strikeRange.length;
    const expiryIndex = Math.floor(i / (strikeRange.length * 2)) % expiryDates.length;
    
    const strike = strikeRange[strikeIndex];
    const expiryDate = expiryDates[expiryIndex];
    
    // Calculate some reasonable option prices
    const daysToExpiry = Math.floor((new Date(expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const intrinsicValue = isCall ? Math.max(0, 458.92 - strike) : Math.max(0, strike - 458.92);
    const timeValue = (daysToExpiry / 30) * 5 * (1 - Math.abs(strike - 458.92) / 50);
    
    result.push({
      id: `SPY_${expiryDate}_${strike}_${isCall ? 'C' : 'P'}_${i}`,
      symbol: 'SPY',
      strikePrice: strike,
      expirationDate: expiryDate,
      type: isCall ? 'CALL' : 'PUT',
      bidPrice: Math.round((intrinsicValue + timeValue - 0.25) * 100) / 100,
      askPrice: Math.round((intrinsicValue + timeValue + 0.25) * 100) / 100,
      lastPrice: Math.round((intrinsicValue + timeValue) * 100) / 100,
      volume: Math.floor(1000 * Math.random()),
      openInterest: Math.floor(10000 * Math.random()),
      delta: isCall ? 0.5 + (458.92 - strike) / 50 : 0.5 - (458.92 - strike) / 50,
      gamma: 0.05,
      theta: -0.03 * (30 / daysToExpiry),
      vega: 0.1,
      impliedVolatility: 0.2 + (Math.abs(strike - 458.92) / 100),
      inTheMoney: isCall ? 458.92 > strike : 458.92 < strike,
    });
  }
  
  return result;
};

/**
 * Helper function to simulate network latency
 */
export const simulateNetworkLatency = async (minMs = 100, maxMs = 500): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Helper to generate random error for testing
 */
export const generateRandomError = (): Error => {
  const errorMessages = [
    'Network connection failed',
    'API rate limit exceeded',
    'Authentication error',
    'Server timeout',
    'Invalid response format',
  ];
  
  const randomIndex = Math.floor(Math.random() * errorMessages.length);
  return new Error(errorMessages[randomIndex]);
};
