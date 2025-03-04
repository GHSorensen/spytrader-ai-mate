
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';

export class InteractiveBrokersService {
  private config: DataProviderConfig;
  private connected: boolean = false;
  private lastError: Error | null = null;

  constructor(config: DataProviderConfig) {
    this.config = config;
  }

  async connect(): Promise<boolean> {
    // This is a simulated connection - in a real app, this would connect to the actual IBKR API
    try {
      console.log('Connecting to Interactive Brokers with config:', this.config);
      
      // Simulate successful connection
      this.connected = true;
      return true;
    } catch (error) {
      console.error('Error connecting to Interactive Brokers:', error);
      this.lastError = error instanceof Error ? error : new Error(String(error));
      this.connected = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getDiagnostics(): any {
    return {
      connected: this.connected,
      config: {
        ...this.config,
        // No need to mask password since it's not in the config anymore
      },
      lastError: this.lastError,
      timestamp: new Date().toISOString()
    };
  }

  disconnect(): void {
    this.connected = false;
  }
}
