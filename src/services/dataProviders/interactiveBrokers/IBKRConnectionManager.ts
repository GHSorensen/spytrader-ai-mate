
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { IBKRAuthService } from "./IBKRAuthService";
import { TwsConnectionManager } from "./tws/TwsConnectionManager";
import { toast } from "sonner";

/**
 * Manages connections to Interactive Brokers
 */
export class IBKRConnectionManager {
  private config: DataProviderConfig;
  private twsConnectionManager: TwsConnectionManager;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
    this.twsConnectionManager = new TwsConnectionManager(config);
  }
  
  /**
   * Connect to Interactive Brokers
   */
  async connect(authService: IBKRAuthService): Promise<boolean> {
    const connectionMethod = this.config.connectionMethod || 'webapi';
    
    if (connectionMethod === 'tws') {
      return this.connectViaTws();
    } else {
      return this.connectViaWebApi(authService);
    }
  }
  
  /**
   * Connect via TWS
   */
  private async connectViaTws(): Promise<boolean> {
    const connected = await this.twsConnectionManager.connect();
    return connected;
  }
  
  /**
   * Connect via Web API
   */
  private async connectViaWebApi(authService: IBKRAuthService): Promise<boolean> {
    try {
      const authenticated = await authService.authenticate();
      return authenticated;
    } catch (error) {
      console.error("Error in Web API connection:", error);
      return false;
    }
  }
}
