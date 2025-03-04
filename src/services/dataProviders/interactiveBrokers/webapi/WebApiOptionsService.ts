
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { SpyOption } from "@/lib/types/spy";
import * as utils from "../utils";
import * as endpoints from '../endpoints';
import { WebApiBaseService } from "./WebApiBaseService";

/**
 * Service for fetching options data from IBKR Web API
 */
export class WebApiOptionsService extends WebApiBaseService {
  constructor(config: DataProviderConfig, accessToken: string | null = null) {
    super(config, accessToken);
  }
  
  /**
   * Get options from Web API
   */
  async getOptions(): Promise<SpyOption[]> {
    try {
      console.log("Fetching options from Interactive Brokers Web API...");
      
      const optionsData = await this.fetchFromAPI(endpoints.OPTIONS_ENDPOINT, {
        symbol: 'SPY',
        includeExpired: false
      }).catch(error => {
        console.error("Error fetching options from IBKR:", error);
        return null;
      });
      
      if (optionsData && Array.isArray(optionsData)) {
        console.log("Received options data from IBKR:", optionsData);
        
        // Transform API response to our SpyOption format
        return optionsData.map(option => ({
          id: option.id || `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          strikePrice: option.strike,
          expirationDate: new Date(option.expirationDate),
          type: option.putCall.toUpperCase() === 'CALL' ? 'CALL' : 'PUT',
          premium: option.ask, // Use ask price as premium
          impliedVolatility: option.impliedVolatility,
          openInterest: option.openInterest,
          volume: option.volume,
          delta: option.delta,
          gamma: option.gamma,
          theta: option.theta,
          vega: option.vega,
          paperTrading: this.config.paperTrading || false
        }));
      }
      
      // Fallback to mock options if API call fails
      console.warn("Falling back to mock options data");
      return utils.generateMockOptions();
    } catch (error) {
      console.error("Error in getOptions:", error);
      // Fallback to mock data in case of errors
      return utils.generateMockOptions();
    }
  }
  
  /**
   * Get option chain from Web API
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    try {
      console.log(`Fetching option chain for ${symbol} from Interactive Brokers Web API...`);
      
      const optionChainData = await this.fetchFromAPI(`${endpoints.OPTIONS_ENDPOINT}/chain`, {
        symbol: symbol,
        includeExpired: false
      }).catch(error => {
        console.error(`Error fetching option chain for ${symbol} from IBKR:`, error);
        return null;
      });
      
      if (optionChainData && Array.isArray(optionChainData)) {
        console.log(`Received option chain data for ${symbol} from IBKR:`, optionChainData);
        
        // Transform API response to our SpyOption format
        return optionChainData.map(option => ({
          id: option.id || `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          symbol: symbol,
          strikePrice: option.strike,
          expirationDate: new Date(option.expirationDate),
          type: option.putCall.toUpperCase() === 'CALL' ? 'CALL' : 'PUT',
          premium: option.ask, // Use ask price as premium
          impliedVolatility: option.impliedVolatility,
          openInterest: option.openInterest,
          volume: option.volume,
          delta: option.delta,
          gamma: option.gamma,
          theta: option.theta,
          vega: option.vega,
          paperTrading: this.config.paperTrading || false
        }));
      }
      
      // Fallback to mock options if API call fails
      console.warn(`Falling back to mock option chain data for ${symbol}`);
      const mockOptions = utils.generateMockOptions();
      mockOptions.forEach(option => {
        option.symbol = symbol;
      });
      return mockOptions;
    } catch (error) {
      console.error("Error in getOptionChain:", error);
      // Fallback to mock data in case of errors
      const mockOptions = utils.generateMockOptions();
      mockOptions.forEach(option => {
        option.symbol = symbol;
      });
      return mockOptions;
    }
  }
}
