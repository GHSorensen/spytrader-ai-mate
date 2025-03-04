
import { TradeOrder } from "@/lib/types/spy/dataProvider";
import { IBKRDataService } from "../IBKRDataService";
import { IBKRPaperTradeService } from "../IBKRPaperTradeService";
import { toast } from "sonner";

/**
 * Handles trade execution and paper trading for Interactive Brokers
 */
export class IBKRTradeService {
  private config: any;
  private paperTradeService: IBKRPaperTradeService;
  
  constructor(config: any) {
    this.config = config;
    this.paperTradeService = new IBKRPaperTradeService();
  }
  
  /**
   * Place a trade with Interactive Brokers
   */
  async placeTrade(order: TradeOrder, dataService: IBKRDataService): Promise<any> {
    // Always create a paper trade for immediate testing purposes
    // This guarantees we'll at least have a fallback when troubleshooting
    const mockResult = this.paperTradeService.createPaperTrade(order);
    
    // Check if paper trading is forced via config
    if (this.config.paperTrading) {
      console.log("Paper trading is enabled in config, using paper trade");
      toast.info("Paper Trading Mode", {
        description: "Using paper trading as configured in settings.",
      });
      return mockResult;
    }
    
    // Check market hours
    const isMarketHours = this.paperTradeService.isMarketHours();
    
    if (!isMarketHours) {
      console.log("Outside market hours, creating paper trade instead");
      toast.info("Outside Market Hours", {
        description: "Creating paper trade for demonstration purposes.",
      });
      return mockResult;
    }
    
    // Attempt to place the real trade with the data service
    try {
      const result = await dataService.placeTrade(order);
      console.log("Trade placed successfully with data service:", result);
      return result;
    } catch (dataError) {
      console.error("Error placing trade with data service:", dataError);
      toast.error("Trade Error", {
        description: dataError instanceof Error ? dataError.message : "Error placing trade with broker. Using paper trade instead.",
      });
      
      // Fall back to paper trade on error
      return mockResult;
    }
  }
  
  /**
   * Create a paper trade when there's an error
   */
  handleTradeError(error: unknown, order: TradeOrder): any {
    toast.error("Trade Error", {
      description: error instanceof Error ? error.message : "Error placing trade. Creating paper trade instead.",
    });
    
    // Always fall back to paper trade on error
    return this.paperTradeService.createPaperTrade(order);
  }
  
  /**
   * Create a paper trade
   */
  createPaperTrade(order: TradeOrder): any {
    return this.paperTradeService.createPaperTrade(order);
  }
}
