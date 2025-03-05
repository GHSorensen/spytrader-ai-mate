
/**
 * Logger utilities for the trades service
 */
export class TradesLogger {
  /**
   * Log trades fetch information
   */
  static logTradesFetch(trades: any[], startTime: number): void {
    const endTime = Date.now();
    console.log(`[TradesLogger] Trades fetch took ${endTime - startTime}ms`);
    console.log(`[TradesLogger] Received ${trades.length} trades`);
    
    // Add detailed debugging for each trade
    if (trades.length > 0) {
      console.log("[TradesLogger] First 3 trades sample:", 
        trades.slice(0, 3).map(t => ({
          id: t.id,
          type: t.type, 
          status: t.status,
          strikePrice: t.strikePrice,
          openedAt: t.openedAt
        }))
      );
    } else {
      console.log("[TradesLogger] No trades returned - this might indicate a connection issue");
    }
  }

  /**
   * Log error with enhanced information
   */
  static logError(context: string, error: unknown): void {
    console.error(`[TradesLogger] Error in ${context}:`, error);
    console.error(`[TradesLogger] Stack trace:`, error instanceof Error ? error.stack : "No stack trace");
    
    // Enhanced error logging
    if (error instanceof Error) {
      if (error.message.includes("Authentication") || error.message.includes("token")) {
        console.error(`[TradesLogger] This appears to be an authentication error. Please check your IBKR credentials and connection status.`);
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        console.error(`[TradesLogger] This appears to be a network error. Please check your internet connection and IBKR service status.`);
      }
    }
  }

  /**
   * Log trade execution
   */
  static logTradeExecution(result: any, startTime: number): void {
    const endTime = Date.now();
    console.log(`[TradesLogger] Trade execution took ${endTime - startTime}ms`);
    console.log(`[TradesLogger] Trade result:`, JSON.stringify(result, null, 2));
  }
}
