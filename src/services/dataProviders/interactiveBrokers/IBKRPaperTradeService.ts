
import { TradeOrder } from "@/lib/types/spy/dataProvider";
import { SpyTrade } from "@/lib/types/spy";

/**
 * Handles paper trading for Interactive Brokers
 */
export class IBKRPaperTradeService {
  /**
   * Create a paper trade for testing or when real trading fails
   */
  createPaperTrade(order: TradeOrder): any {
    console.log("[IBKRPaperTradeService] Creating paper trade for:", JSON.stringify(order, null, 2));
    
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
    
    const mockTrade: SpyTrade = {
      id: `paper-${Date.now()}`,
      type: order.action === 'BUY' ? "CALL" : "PUT",
      strikePrice: 500,
      expirationDate: expiryDate,
      entryPrice: 3.45,
      currentPrice: 3.45,
      targetPrice: 5.0,
      stopLoss: 2.0,
      quantity: order.quantity,
      status: "active",
      openedAt: now,
      profit: 0,
      profitPercentage: 0,
      confidenceScore: 0.75,
      paperTrading: true
    };
    
    console.log("[IBKRPaperTradeService] Created paper trade:", JSON.stringify(mockTrade, null, 2));
    console.log("[IBKRPaperTradeService] Is market currently open?", this.isMarketHours());
    
    return { 
      trade: mockTrade, 
      orderId: `PAPER-${Date.now()}`,
      isPaperTrade: true,
      message: "Created paper trade for testing purposes."
    };
  }
  
  /**
   * Check if current market hours
   */
  isMarketHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    const isMarketOpen = !isWeekend && ((hour > 9 || (hour === 9 && minute >= 30)) && hour < 16);
    
    // Enhanced debugging for market hours
    console.log(`[IBKRPaperTradeService] Market hours check:`, {
      now: now.toLocaleString(),
      day,
      hour,
      minute,
      isWeekend,
      isMarketOpen,
      marketStatus: isMarketOpen ? "OPEN" : "CLOSED",
      timeToOpen: !isMarketOpen && day > 0 && day < 6 && hour < 9 ? 
        `${9 - hour} hours and ${30 - minute} minutes until market open` : 
        (isMarketOpen ? "Market is currently open" : "Market is closed for the day"),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    return isMarketOpen;
  }
}
