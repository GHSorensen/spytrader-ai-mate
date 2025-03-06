
import { ConnectionDiagnostics } from './types';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';

// Connection check interval in milliseconds (30 seconds)
export const CONNECTION_CHECK_INTERVAL = 30000;

/**
 * Get the data provider with diagnostics support
 */
export function getProviderWithDiagnostics() {
  try {
    const provider = getDataProvider();
    if (!provider) {
      console.warn("[getProviderWithDiagnostics] No data provider available");
      return null;
    }
    return provider;
  } catch (error) {
    console.error("[getProviderWithDiagnostics] Error getting data provider:", error);
    return null;
  }
}

/**
 * Create connection diagnostics object with current browser info
 */
export function createConnectionDiagnostics(
  providerType: string,
  error?: Error
): ConnectionDiagnostics {
  const diagnostics: ConnectionDiagnostics = {
    timestamp: new Date().toISOString(),
    providerType,
    browserInfo: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  };
  
  if (error) {
    diagnostics.error = error.message;
    diagnostics.stack = error.stack;
  }
  
  return diagnostics;
}

/**
 * Log connection error with contextual information
 */
export function logConnectionError(error: unknown, context: { service: string; method: string }) {
  console.error(`[${context.service}.${context.method}] Connection error:`, error);
  
  if (error instanceof Error) {
    console.error(`[${context.service}.${context.method}] Stack trace:`, error.stack);
  }
  
  // Additional diagnostic info
  console.error(`[${context.service}.${context.method}] Browser info:`, {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    time: new Date().toISOString()
  });
}

/**
 * Determine data source based on connection status
 */
export function getDataSource(connected: boolean, quotesDelayed?: boolean): 'live' | 'delayed' | 'mock' {
  if (!connected) return 'mock';
  return quotesDelayed ? 'delayed' : 'live';
}

/**
 * Debug IBKR connection by capturing detailed logs
 */
export function debugIBKRConnection() {
  console.group("IBKR Connection Debug");
  try {
    const provider = getProviderWithDiagnostics();
    
    console.log("Provider info:", {
      name: provider?.constructor.name,
      exists: !!provider,
      hasIsConnected: typeof provider?.isConnected === 'function',
      hasConnect: typeof provider?.connect === 'function',
    });
    
    if (provider) {
      if (typeof provider.isConnected === 'function') {
        console.log("isConnected():", provider.isConnected());
      }
      
      if ((provider as any).status) {
        console.log("Provider status:", (provider as any).status);
      }
      
      if ((provider as any).getDiagnostics && typeof (provider as any).getDiagnostics === 'function') {
        try {
          console.log("Provider diagnostics:", (provider as any).getDiagnostics());
        } catch (err) {
          console.error("Error getting provider diagnostics:", err);
        }
      }
    }
  } catch (error) {
    console.error("Error in debugIBKRConnection:", error);
  } finally {
    console.groupEnd();
  }
}

/**
 * Enhanced logging for connection transitions
 */
export function logConnectionTransition(
  from: boolean, 
  to: boolean,
  dataSource: 'live' | 'delayed' | 'mock',
  context: string
) {
  if (from !== to) {
    console.group(`[${context}] Connection state transition: ${from} → ${to}`);
    console.log("Time:", new Date().toISOString());
    console.log("Data source:", dataSource);
    debugIBKRConnection();
    console.groupEnd();
  }
}
