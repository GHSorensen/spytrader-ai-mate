
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { SpyOption } from "@/lib/types/spy";
import { TwsDataService } from "../tws/TwsDataService";
import { WebApiDataService } from "../webapi/WebApiDataService";
import { logError } from "@/lib/errorMonitoring/core/logger";

/**
 * Service for handling options data from Interactive Brokers
 */
export class IBKROptionsService {
  private config: DataProviderConfig;
  private twsDataService: TwsDataService;
  private webApiDataService: WebApiDataService;
  private connectionMethod: 'webapi' | 'tws';
  private lastFetchTime: Date | null = null;
  private lastError: Error | null = null;
  
  constructor(
    config: DataProviderConfig,
    twsDataService: TwsDataService,
    webApiDataService: WebApiDataService
  ) {
    this.config = config;
    this.connectionMethod = config.connectionMethod || 'webapi';
    this.twsDataService = twsDataService;
    this.webApiDataService = webApiDataService;
    
    console.log("[IBKROptionsService] Initialized with connection method:", this.connectionMethod);
  }
  
  /**
   * Get all available options from Interactive Brokers
   * @returns Promise resolving to an array of options
   */
  async getOptions(): Promise<SpyOption[]> {
    try {
      console.log("[IBKROptionsService] Fetching options via:", this.connectionMethod);
      this.lastFetchTime = new Date();
      
      if (this.connectionMethod === 'tws') {
        console.log("[IBKROptionsService] Requesting options from TWS");
        const options = await this.twsDataService.getOptions();
        console.log(`[IBKROptionsService] Received ${options.length} options from TWS`);
        this.lastError = null;
        return options;
      }
      
      console.log("[IBKROptionsService] Requesting options from WebAPI");
      const options = await this.webApiDataService.getOptions();
      console.log(`[IBKROptionsService] Received ${options.length} options from WebAPI`);
      this.lastError = null;
      return options;
    } catch (error) {
      console.error("[IBKROptionsService] Error fetching options from Interactive Brokers:", error);
      if (error instanceof Error) {
        this.lastError = error;
        // Log the error to our monitoring system
        logError(error, { 
          service: 'IBKROptionsService', 
          method: 'getOptions',
          connectionMethod: this.connectionMethod 
        });
      }
      
      // Return empty array instead of failing to be consistent with getOptionChain
      return [];
    }
  }
  
  /**
   * Get option chain for a specific symbol from Interactive Brokers
   * @param symbol Stock symbol to get options for (e.g., "SPY")
   * @returns Promise resolving to an array of options for the specified symbol
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    try {
      console.log(`[IBKROptionsService] Fetching option chain for ${symbol} via:`, this.connectionMethod);
      this.lastFetchTime = new Date();
      
      if (this.connectionMethod === 'tws') {
        console.log(`[IBKROptionsService] Requesting option chain for ${symbol} from TWS`);
        const options = await this.twsDataService.getOptionChain(symbol);
        console.log(`[IBKROptionsService] Received ${options.length} options in chain from TWS`);
        this.lastError = null;
        return options;
      }
      
      console.log(`[IBKROptionsService] Requesting option chain for ${symbol} from WebAPI`);
      const options = await this.webApiDataService.getOptionChain(symbol);
      console.log(`[IBKROptionsService] Received ${options.length} options in chain from WebAPI`);
      this.lastError = null;
      return options;
    } catch (error) {
      console.error(`[IBKROptionsService] Error fetching option chain for ${symbol} from Interactive Brokers:`, error);
      if (error instanceof Error) {
        this.lastError = error;
        // Log the error to our monitoring system
        logError(error, { 
          service: 'IBKROptionsService', 
          method: 'getOptionChain',
          symbol,
          connectionMethod: this.connectionMethod 
        });
      }
      
      // Return empty array and log error instead of failing completely
      console.log(`[IBKROptionsService] Returning empty option chain due to error`);
      return [];
    }
  }
  
  /**
   * Get diagnostics information about the options service
   * @returns Diagnostic information including connection method, last fetch time, and error state
   */
  getDiagnostics(): {
    connectionMethod: 'webapi' | 'tws';
    lastFetchTime: Date | null;
    lastErrorMessage: string | null;
  } {
    return {
      connectionMethod: this.connectionMethod,
      lastFetchTime: this.lastFetchTime,
      lastErrorMessage: this.lastError ? this.lastError.message : null
    };
  }
}
