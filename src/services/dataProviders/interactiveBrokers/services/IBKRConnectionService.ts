
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
    console.log("[IBKRConnectionService] Initialized with method:", this.connectionMethod, "Config:", JSON.stringify(this.config));
  }

  /**
   * Set access token for Web API connections
   */
  setAccessToken(token: string): void {
    console.log("[IBKRConnectionService] Setting access token:", token ? `${token.substring(0, 5)}...` : 'null');
    this.webApiDataService.setAccessToken(token);
  }
  
  /**
   * Connect to appropriate IBKR service
   */
  async connect(): Promise<boolean> {
    try {
      console.log("[IBKRConnectionService] Attempting to connect via:", this.connectionMethod);
      
      if (this.connectionMethod === 'tws') {
        console.log("[IBKRConnectionService] Connecting to TWS at:", this.config.twsHost, "port:", this.config.twsPort);
        const result = await this.twsDataService.connect();
        console.log("[IBKRConnectionService] TWS connection result:", result);
        return result;
      }
      
      // Debug WebAPI connection details
      console.log("[IBKRConnectionService] Using Web API connection. API Key present:", !!this.config.apiKey);
      console.log("[IBKRConnectionService] Callback URL:", this.config.callbackUrl);
      
      // WebAPI doesn't have a direct connect method, as it's handled
      // via authentication and tokens, so we'll return true
      return true;
    } catch (error) {
      console.error("[IBKRConnectionService] Error connecting to Interactive Brokers:", error);
      return false;
    }
  }
}
