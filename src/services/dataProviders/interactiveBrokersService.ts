
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { logError } from '@/lib/errorMonitoring/core/logger';

/**
 * Service class for Interactive Brokers integration
 */
export class InteractiveBrokersService {
  private config: DataProviderConfig;
  private connected: boolean = false;
  private connectionAttempts: number = 0;
  private lastError: Error | null = null;
  private connectionStartTime: number = 0;

  constructor(config: DataProviderConfig) {
    this.config = config;
    console.log('[IBKR Service] Service initialized with config:', {
      type: config.type,
      connectionMethod: config.connectionMethod,
      paperTrading: config.paperTrading,
      twsHost: config.twsHost ? `${config.twsHost}` : 'not provided',
      twsPort: config.twsPort ? `${config.twsPort}` : 'not provided',
      hasApiKey: config.apiKey ? 'yes' : 'no'
    });
  }

  /**
   * Connect to Interactive Brokers
   * @returns Promise<boolean> - true if connection was successful
   */
  async connect(): Promise<boolean> {
    this.connectionAttempts++;
    this.connectionStartTime = Date.now();
    this.lastError = null;
    
    try {
      console.log('[IBKR Service] Connection attempt #' + this.connectionAttempts);
      console.log('[IBKR Service] Connecting to Interactive Brokers with config:', {
        type: this.config.type,
        connectionMethod: this.config.connectionMethod,
        paperTrading: this.config.paperTrading,
        twsHost: this.config.twsHost ? `${this.config.twsHost}` : 'not provided',
        twsPort: this.config.twsPort ? `${this.config.twsPort}` : 'not provided',
        hasApiKey: this.config.apiKey ? 'yes' : 'no'
      });
      
      // Connection method determines how we connect
      if (this.config.connectionMethod === 'tws') {
        return await this.connectToTws();
      } else {
        return await this.connectToWebApi();
      }
    } catch (error) {
      const connectionError = error instanceof Error ? error : new Error('Unknown error connecting to IBKR');
      this.lastError = connectionError;
      logError(connectionError);
      
      console.error('[IBKR Service] Connection failed:', {
        error: connectionError.message,
        stack: connectionError.stack,
        connectionTime: `${Date.now() - this.connectionStartTime}ms`,
        attempt: this.connectionAttempts
      });
      
      return false;
    }
  }

  /**
   * Connect to TWS (Trader Workstation)
   */
  private async connectToTws(): Promise<boolean> {
    console.log(`[IBKR Service] Connecting to TWS at ${this.config.twsHost}:${this.config.twsPort}`);
    
    // Validate required TWS connection parameters
    if (!this.config.twsHost || !this.config.twsPort) {
      const error = new Error('[IBKR Service] Missing TWS host or port');
      this.lastError = error;
      console.error(error);
      return false;
    }
    
    try {
      // Simulate connection with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we would:
      // 1. Create a socket connection to the TWS API
      // 2. Send authentication commands
      // 3. Wait for confirmation
      
      // Simple socket test to see if port is open (simulated here)
      const portIsOpen = await this.testTwsPortConnection(this.config.twsHost, this.config.twsPort);
      
      if (!portIsOpen) {
        const error = new Error(`TWS port ${this.config.twsPort} is not open or accessible on host ${this.config.twsHost}`);
        this.lastError = error;
        console.error('[IBKR Service]', error.message);
        return false;
      }
      
      this.connected = true;
      console.log('[IBKR Service] Connected to TWS successfully');
      console.log('[IBKR Service] Connection time:', `${Date.now() - this.connectionStartTime}ms`);
      return true;
    } catch (error) {
      const connectionError = error instanceof Error ? error : new Error('Unknown TWS connection error');
      this.lastError = connectionError;
      console.error('[IBKR Service] TWS connection error:', connectionError);
      return false;
    }
  }
  
  /**
   * Test if TWS port is open and accessible
   * This is a simulated implementation - in a real app, you would use actual socket testing
   */
  private async testTwsPortConnection(host: string, portStr: string): Promise<boolean> {
    try {
      console.log(`[IBKR Service] Testing connection to ${host}:${portStr}`);
      
      // In a real implementation, you would:
      // - Create a socket connection
      // - Set a short timeout
      // - Try to connect
      // - Return true if connected, false if failed
      
      // For simulation, we'll assume TWS is running on localhost:7496 or 7497
      const port = parseInt(portStr, 10);
      
      // Most common TWS ports
      const commonPorts = [7496, 7497];
      
      // For demo/testing - connection succeeds on common ports on localhost
      const isCommonPortOnLocalhost = 
        (host === 'localhost' || host === '127.0.0.1') && 
        commonPorts.includes(port);
      
      console.log(`[IBKR Service] Port test result: ${isCommonPortOnLocalhost ? 'OPEN' : 'CLOSED'}`);
      
      return isCommonPortOnLocalhost;
    } catch (error) {
      console.error('[IBKR Service] Port test error:', error);
      return false;
    }
  }

  /**
   * Connect to Web API
   */
  private async connectToWebApi(): Promise<boolean> {
    console.log('[IBKR Service] Connecting to IBKR Web API');
    
    // Validate required Web API connection parameters
    if (!this.config.apiKey) {
      const error = new Error('[IBKR Service] Missing API key for Web API connection');
      this.lastError = error;
      console.error(error);
      return false;
    }
    
    try {
      // Simulate connection with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, we would:
      // 1. Make an API request to authenticate
      // 2. Store session tokens
      // 3. Return connection status
      
      this.connected = true;
      console.log('[IBKR Service] Connected to Web API successfully');
      console.log('[IBKR Service] Connection time:', `${Date.now() - this.connectionStartTime}ms`);
      return true;
    } catch (error) {
      const connectionError = error instanceof Error ? error : new Error('Unknown Web API connection error');
      this.lastError = connectionError;
      console.error('[IBKR Service] Web API connection error:', connectionError);
      return false;
    }
  }

  /**
   * Disconnect from Interactive Brokers
   */
  async disconnect(): Promise<boolean> {
    console.log('[IBKR Service] Disconnecting from Interactive Brokers');
    this.connected = false;
    return true;
  }

  /**
   * Check if connected to Interactive Brokers
   */
  isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Get connection diagnostics information
   */
  getDiagnostics(): Record<string, any> {
    return {
      connected: this.connected,
      connectionAttempts: this.connectionAttempts,
      lastError: this.lastError ? {
        message: this.lastError.message,
        stack: this.lastError.stack
      } : null,
      config: {
        type: this.config.type,
        connectionMethod: this.config.connectionMethod,
        paperTrading: this.config.paperTrading,
        twsHost: this.config.twsHost,
        twsPort: this.config.twsPort,
        hasApiKey: !!this.config.apiKey
      }
    };
  }
  
  /**
   * Test connection by sending a simple request
   * @returns Object with test results
   */
  async testConnection(): Promise<Record<string, any>> {
    if (!this.connected) {
      return {
        success: false,
        message: 'Not connected to IBKR. Connect first before testing.',
        timestamp: new Date().toISOString()
      };
    }
    
    try {
      console.log('[IBKR Service] Running connection test');
      
      // Simulate API request with delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real implementation, this would send an actual API request
      // like getting account info or a simple market data point
      
      return {
        success: true,
        message: 'Connection test successful',
        timestamp: new Date().toISOString(),
        connectionMethod: this.config.connectionMethod,
        responseTime: '800ms'
      };
    } catch (error) {
      const testError = error instanceof Error ? error : new Error('Unknown test error');
      console.error('[IBKR Service] Test connection error:', testError);
      
      return {
        success: false,
        message: `Test failed: ${testError.message}`,
        timestamp: new Date().toISOString(),
        error: testError.message
      };
    }
  }
}
