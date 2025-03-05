
import { ClassifiedError, ErrorType } from '@/lib/errorMonitoring/types/errorClassification';

/**
 * Gets the error context from a data provider
 * Used to provide additional context for error handling and monitoring
 */
export function getProviderErrorContext(provider: any): {
  connectionMethod: 'webapi' | 'tws' | undefined;
  paperTrading: boolean | undefined;
  quotesDelayed: boolean | undefined;
  host?: string;
  port?: string;
} {
  if (!provider) {
    return { connectionMethod: undefined, paperTrading: undefined, quotesDelayed: undefined };
  }
  
  try {
    // Try to extract config from provider
    const config = provider.config || {};
    const status = provider.status || {};
    
    return {
      connectionMethod: config.connectionMethod || undefined,
      paperTrading: config.paperTrading !== undefined ? config.paperTrading : undefined,
      quotesDelayed: status.quotesDelayed !== undefined ? status.quotesDelayed : undefined,
      host: config.twsHost || config.host,
      port: config.twsPort || config.port
    };
  } catch (error) {
    console.error("Error extracting provider context:", error);
    return { connectionMethod: undefined, paperTrading: undefined, quotesDelayed: undefined };
  }
}

/**
 * Gets a detailed provider diagnostics object
 */
export function getProviderDiagnostics(provider: any): Record<string, any> {
  if (!provider) {
    return { available: false, reason: 'No provider available' };
  }
  
  try {
    // Type of provider
    const type = provider.constructor.name;
    
    // Try to extract diagnostic method directly
    if (typeof provider.getDiagnostics === 'function') {
      return {
        available: true,
        type,
        ...provider.getDiagnostics()
      };
    }
    
    // Try to access properties manually
    const context = getProviderErrorContext(provider);
    const isConnected = typeof provider.isConnected === 'function' ? provider.isConnected() : undefined;
    
    return {
      available: true,
      type,
      isConnected,
      ...context,
      hasConnectMethod: typeof provider.connect === 'function',
      config: provider.config ? { 
        ...provider.config,
        // Redact sensitive data
        apiKey: provider.config.apiKey ? '***' : undefined,
        refreshToken: provider.config.refreshToken ? '***' : undefined
      } : undefined,
      status: provider.status
    };
  } catch (error) {
    console.error("Error getting provider diagnostics:", error);
    return { 
      available: false, 
      type: provider.constructor?.name,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Creates a properly formatted IBKR error for testing
 */
export function createIBKRTestError(
  message: string, 
  errorType: ErrorType, 
  context: { service: string; method: string; [key: string]: any }
): ClassifiedError {
  const error = new Error(message) as ClassifiedError;
  error.errorType = errorType;
  // Add context properties
  Object.entries(context).forEach(([key, value]) => {
    (error as any)[key] = value;
  });
  return error;
}
