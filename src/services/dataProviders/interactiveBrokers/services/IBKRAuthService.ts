
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { TwsDataService } from "../tws/TwsDataService";
import { WebApiDataService } from "../webapi/WebApiDataService";

/**
 * Service for handling authentication with Interactive Brokers
 */
export class IBKRConnectionService {
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
   * Set access token for Web API connections
   */
  setAccessToken(token: string): void {
    this.webApiDataService.setAccessToken(token);
  }
  
  /**
   * Connect to appropriate IBKR service
   */
  async connect(): Promise<boolean> {
    try {
      if (this.connectionMethod === 'tws') {
        return await this.twsDataService.connect();
      }
      
      // WebAPI doesn't have a direct connect method, as it's handled
      // via authentication and tokens, so we'll return true
      return true;
    } catch (error) {
      console.error("Error connecting to Interactive Brokers:", error);
      return false;
    }
  }
}
