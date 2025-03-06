
import { SpyOption, SpyTrade } from "@/lib/types/spy";

/**
 * Generate mock options data for development
 */
export function generateMockOptions(): SpyOption[] {
  const options: SpyOption[] = [];
  const basePrice = 450;
  const currentDate = new Date();
  
  // Generate expiry dates (next 4 Fridays)
  const expiryDates: Date[] = [];
  for (let i = 0; i < 4; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + ((5 - currentDate.getDay() + 7) % 7) + (i * 7));
    expiryDates.push(date);
  }
  
  // Strike prices around current price
  const strikes = [-20, -15, -10, -5, 0, 5, 10, 15, 20].map(offset => basePrice + offset);
  
  // Generate call and put options
  expiryDates.forEach(expiry => {
    strikes.forEach(strike => {
      // Generate call option
      options.push({
        id: `SCHWAB-C-${strike}-${expiry.toISOString().split('T')[0]}`,
        symbol: "SPY",
        optionType: "call",
        strikePrice: strike,
        expirationDate: expiry.toISOString().split('T')[0],
        bid: parseFloat((Math.random() * 5 + (basePrice - strike > 0 ? basePrice - strike : 0)).toFixed(2)),
        ask: parseFloat((Math.random() * 5 + 0.5 + (basePrice - strike > 0 ? basePrice - strike : 0)).toFixed(2)),
        lastPrice: parseFloat((Math.random() * 5 + (basePrice - strike > 0 ? basePrice - strike : 0)).toFixed(2)),
        volume: Math.floor(Math.random() * 10000),
        openInterest: Math.floor(Math.random() * 20000),
        delta: parseFloat((Math.random() * 0.5 + 0.2).toFixed(2)),
        gamma: parseFloat((Math.random() * 0.05).toFixed(3)),
        theta: parseFloat((-Math.random() * 0.2).toFixed(3)),
        vega: parseFloat((Math.random() * 0.2).toFixed(3)),
        impliedVolatility: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)),
      });
      
      // Generate put option
      options.push({
        id: `SCHWAB-P-${strike}-${expiry.toISOString().split('T')[0]}`,
        symbol: "SPY",
        optionType: "put",
        strikePrice: strike,
        expirationDate: expiry.toISOString().split('T')[0],
        bid: parseFloat((Math.random() * 5 + (strike - basePrice > 0 ? strike - basePrice : 0)).toFixed(2)),
        ask: parseFloat((Math.random() * 5 + 0.5 + (strike - basePrice > 0 ? strike - basePrice : 0)).toFixed(2)),
        lastPrice: parseFloat((Math.random() * 5 + (strike - basePrice > 0 ? strike - basePrice : 0)).toFixed(2)),
        volume: Math.floor(Math.random() * 10000),
        openInterest: Math.floor(Math.random() * 20000),
        delta: parseFloat((-Math.random() * 0.5 - 0.2).toFixed(2)),
        gamma: parseFloat((Math.random() * 0.05).toFixed(3)),
        theta: parseFloat((-Math.random() * 0.2).toFixed(3)),
        vega: parseFloat((Math.random() * 0.2).toFixed(3)),
        impliedVolatility: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)),
      });
    });
  });
  
  return options;
}

/**
 * Generate mock trade data for development
 */
export function generateMockTrades(): SpyTrade[] {
  const trades: SpyTrade[] = [];
  const currentDate = new Date();
  
  // Status options
  const statuses = ['open', 'closed', 'pending', 'cancelled'];
  const strategies = ['Bull Call Spread', 'Bear Put Spread', 'Iron Condor', 'Long Call', 'Long Put'];
  
  // Generate 10 mock trades
  for (let i = 0; i < 10; i++) {
    const entryDate = new Date(currentDate);
    entryDate.setDate(currentDate.getDate() - Math.floor(Math.random() * 30));
    
    const exitDate = Math.random() > 0.3 ? new Date(entryDate) : null;
    if (exitDate) {
      exitDate.setDate(entryDate.getDate() + Math.floor(Math.random() * 14) + 1);
    }
    
    const strike = Math.floor(Math.random() * 50 + 420);
    const isCall = Math.random() > 0.5;
    
    trades.push({
      id: `SCHWAB-TRADE-${i}`,
      symbol: "SPY",
      optionType: isCall ? "call" : "put",
      strikePrice: strike,
      expirationDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15).toISOString().split('T')[0],
      quantity: Math.floor(Math.random() * 5) + 1,
      entryPrice: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      exitPrice: exitDate ? parseFloat((Math.random() * 8 + 1).toFixed(2)) : null,
      entryDate: entryDate.toISOString(),
      exitDate: exitDate ? exitDate.toISOString() : null,
      profit: exitDate ? parseFloat((Math.random() * 500 - 200).toFixed(2)) : null,
      status: exitDate ? 'closed' : statuses[Math.floor(Math.random() * statuses.length)],
      strategy: strategies[Math.floor(Math.random() * strategies.length)],
      broker: 'schwab'
    });
  }
  
  return trades;
}
