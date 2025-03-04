
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { SpyOption } from "@/lib/types/spy";
import { TwsDataService } from "../tws/TwsDataService";
import { WebApiDataService } from "../webapi/WebApiDataService";

/**
 * Service for handling options data from Interactive Brokers
 */
export class IBKROptionsService {
  private config: DataProviderConfig;
  private twsDataService: TwsDataService;
  private webApiDataService: WebApiDataService;
  private connectionMethod: 'webapi' | 'tws';
  
  constructor(
    config: DataProviderConfig,
    twsDataService: TwsDataService,
    webApiDataService: WebApiDataService
  ) {
    this.config = config;
    this.connectionMethod = config.connectionMethod || 'webapi';
    this.twsDataService = twsDataService;
    this.webApiDataService = webApiDataService;
  }
  
  /**
   * Get options
   */
  async getOptions(): Promise<SpyOption[]> {
    try {
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.getOptions();
      }
      
      return this.webApiDataService.getOptions();
    } catch (error) {
      console.error("Error fetching options from Interactive Brokers:", error);
      throw error;
    }
  }
  
  /**
   * Get option chain
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    try {
      if (this.connectionMethod === 'tws') {
        return this.twsDataService.getOptionChain(symbol);
      }
      
      return this.webApiDataService.getOptionChain(symbol);
    } catch (error) {
      console.error(`Error fetching option chain for ${symbol} from Interactive Brokers:`, error);
      throw error;
    }
  }
}
