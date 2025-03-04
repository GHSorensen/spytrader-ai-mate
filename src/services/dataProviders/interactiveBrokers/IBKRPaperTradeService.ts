
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
    console.log("Creating paper trade for:", order);
    
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
    return !isWeekend && ((hour > 9 || (hour === 9 && minute >= 30)) && hour < 16);
  }
}
