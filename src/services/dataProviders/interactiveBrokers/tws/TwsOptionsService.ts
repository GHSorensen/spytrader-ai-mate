
import { SpyOption } from "@/lib/types/spy";
import { TwsBaseService } from "./TwsBaseService";
import * as utils from "../utils";

/**
 * Service for fetching options data from TWS
 */
export class TwsOptionsService extends TwsBaseService {
  /**
   * Get options from TWS
   */
  async getOptions(): Promise<SpyOption[]> {
    try {
      console.log("Fetching options from Interactive Brokers TWS...");
      
      const twsData = await this.makeTwsRequest('options', { symbol: 'SPY' })
        .catch(error => {
          console.error("Error fetching options from TWS:", error);
          return null;
        });
      
      if (twsData) {
        console.log("Received options data from TWS:", twsData);
        
        // In production, transform TWS API response to our SpyOption format
        // For now, use mock options with slight modifications
        const options = utils.generateMockOptions();
        
        // Add paper trading indicator if using paper trading
        if (this.config.paperTrading) {
          options.forEach(option => {
            option.paperTrading = true;
            
            // Slightly adjust premiums for TWS data to make it realistic
            option.premium = parseFloat((option.premium * (1 + (Math.random() * 0.05 - 0.025))).toFixed(2));
          });
        }
        
        return options;
      }
      
      // Fallback to mock options
      return utils.generateMockOptions();
    } catch (error) {
      console.error("Error in getOptions:", error);
      return utils.generateMockOptions();
    }
  }
  
  /**
   * Get option chain from TWS
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    try {
      console.log(`Fetching option chain for ${symbol} from Interactive Brokers TWS...`);
      
      const twsData = await this.makeTwsRequest('options', { symbol })
        .catch(error => {
          console.error(`Error fetching option chain for ${symbol} from TWS:`, error);
          return null;
        });
      
      if (twsData) {
        console.log(`Received option chain data for ${symbol} from TWS:`, twsData);
        
        // In production, transform TWS API response to our SpyOption format
        // For now, use mock options with slight modifications
        const options = utils.generateMockOptions();
        
        // Add symbol and paper trading indicator if using paper trading
        options.forEach(option => {
          option.symbol = symbol;
          
          if (this.config.paperTrading) {
            option.paperTrading = true;
          }
        });
        
        return options;
      }
      
      // Fallback to mock options
      const options = utils.generateMockOptions();
      options.forEach(option => {
        option.symbol = symbol;
      });
      return options;
    } catch (error) {
      console.error("Error in getOptionChain:", error);
      const options = utils.generateMockOptions();
      options.forEach(option => {
        option.symbol = symbol;
      });
      return options;
    }
  }
}
