
/**
 * Interactive Brokers Options Service
 * 
 * This service provides a unified interface for fetching options data from Interactive Brokers
 * regardless of whether the TWS desktop application or the WebAPI is being used.
 * 
 * The service handles:
 * - Routing requests to the appropriate data source (TWS or WebAPI)
 * - Standardized error handling across all methods
 * - Diagnostic information collection
 */

import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { SpyOption } from "@/lib/types/spy";
import { TwsDataService } from "../tws/TwsDataService";
import { WebApiDataService } from "../webapi/WebApiDataService";
import { logError } from "@/lib/errorMonitoring/core/logger";

export class IBKROptionsService {
  private config: DataProviderConfig;
  private twsDataService: TwsDataService;
  private webApiDataService: WebApiDataService;
  private connectionMethod: 'webapi' | 'tws';
  private lastFetchTime: Date | null = null;
  private lastError: Error | null = null;
  private fetchInProgress: boolean = false;
  private lastFetchDuration: number = 0;
  private fetchCount: number = 0;
  
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
   * 
   * @returns Promise resolving to an array of options, empty array if error occurs
   */
  async getOptions(): Promise<SpyOption[]> {
    try {
      // Set fetch tracking metrics
      this.fetchInProgress = true;
      this.fetchCount++;
      const startTime = Date.now();
      
      console.log("[IBKROptionsService] Fetching options via:", this.connectionMethod);
      this.lastFetchTime = new Date();
      
      let options: SpyOption[] = [];
      
      if (this.connectionMethod === 'tws') {
        console.log("[IBKROptionsService] Requesting options from TWS");
        options = await this.twsDataService.getOptions();
        console.log(`[IBKROptionsService] Received ${options.length} options from TWS`);
      } else {
        console.log("[IBKROptionsService] Requesting options from WebAPI");
        options = await this.webApiDataService.getOptions();
        console.log(`[IBKROptionsService] Received ${options.length} options from WebAPI`);
      }
      
      // Calculate fetch duration
      const endTime = Date.now();
      this.lastFetchDuration = endTime - startTime;
      console.log(`[IBKROptionsService] Fetch completed in ${this.lastFetchDuration}ms`);
      
      // Clear any previous errors
      this.lastError = null;
      this.fetchInProgress = false;
      
      return options;
    } catch (error) {
      // Update fetch status
      this.fetchInProgress = false;
      
      console.error("[IBKROptionsService] Error fetching options from Interactive Brokers:", error);
      if (error instanceof Error) {
        this.lastError = error;
        // Log the error to our monitoring system with context
        logError(error, { 
          service: 'IBKROptionsService', 
          method: 'getOptions',
          connectionMethod: this.connectionMethod 
        });
      }
      
      // Always return empty array on error for consistent behavior
      return [];
    }
  }
  
  /**
   * Get option chain for a specific symbol from Interactive Brokers
   * 
   * @param symbol Stock symbol to get options for (e.g., "SPY")
   * @returns Promise resolving to an array of options for the specified symbol, empty array if error occurs
   */
  async getOptionChain(symbol: string): Promise<SpyOption[]> {
    try {
      // Set fetch tracking metrics
      this.fetchInProgress = true;
      this.fetchCount++;
      const startTime = Date.now();
      
      console.log(`[IBKROptionsService] Fetching option chain for ${symbol} via:`, this.connectionMethod);
      this.lastFetchTime = new Date();
      
      let options: SpyOption[] = [];
      
      if (this.connectionMethod === 'tws') {
        console.log(`[IBKROptionsService] Requesting option chain for ${symbol} from TWS`);
        options = await this.twsDataService.getOptionChain(symbol);
        console.log(`[IBKROptionsService] Received ${options.length} options in chain from TWS`);
      } else {
        console.log(`[IBKROptionsService] Requesting option chain for ${symbol} from WebAPI`);
        options = await this.webApiDataService.getOptionChain(symbol);
        console.log(`[IBKROptionsService] Received ${options.length} options in chain from WebAPI`);
      }
      
      // Calculate fetch duration
      const endTime = Date.now();
      this.lastFetchDuration = endTime - startTime;
      console.log(`[IBKROptionsService] Fetch completed in ${this.lastFetchDuration}ms`);
      
      // Clear any previous errors
      this.lastError = null;
      this.fetchInProgress = false;
      
      return options;
    } catch (error) {
      // Update fetch status
      this.fetchInProgress = false;
      
      console.error(`[IBKROptionsService] Error fetching option chain for ${symbol} from Interactive Brokers:`, error);
      if (error instanceof Error) {
        this.lastError = error;
        // Log the error to our monitoring system with context
        logError(error, { 
          service: 'IBKROptionsService', 
          method: 'getOptionChain',
          symbol,
          connectionMethod: this.connectionMethod 
        });
      }
      
      // Always return empty array on error for consistent behavior
      return [];
    }
  }
  
  /**
   * Get diagnostics information about the options service
   * 
   * @returns Diagnostic information including connection method, last fetch time, and error state
   */
  getDiagnostics(): {
    connectionMethod: 'webapi' | 'tws';
    lastFetchTime: Date | null;
    lastErrorMessage: string | null;
    fetchInProgress: boolean;
    lastFetchDuration: number;
    fetchCount: number;
  } {
    return {
      connectionMethod: this.connectionMethod,
      lastFetchTime: this.lastFetchTime,
      lastErrorMessage: this.lastError ? this.lastError.message : null,
      fetchInProgress: this.fetchInProgress,
      lastFetchDuration: this.lastFetchDuration,
      fetchCount: this.fetchCount
    };
  }
}
