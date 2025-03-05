
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { ConnectionDiagnostics } from './types';
import { logError } from '@/lib/errorMonitoring/core/logger';

// Check connection status interval (30 seconds)
export const CONNECTION_CHECK_INTERVAL = 30000;

/**
 * Creates connection diagnostics with browser information
 */
export function createConnectionDiagnostics(
  providerType: string = 'Unknown',
  error?: Error
): ConnectionDiagnostics {
  return {
    timestamp: new Date().toISOString(),
    providerType,
    browserInfo: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    error: error?.message,
    stack: error?.stack
  };
}

/**
 * Gets the data provider and logs diagnostics information
 */
export function getProviderWithDiagnostics() {
  const provider = getDataProvider();
  console.log("[ConnectionUtils] Data provider:", provider?.constructor.name);
  return provider;
}

/**
 * Logs a connection error with detailed information
 */
export function logConnectionError(
  error: unknown, 
  context: { service: string; method: string; [key: string]: any }
) {
  console.error(`[${context.service}] Error in ${context.method}:`, error);
  console.error(`[${context.service}] Stack trace:`, error instanceof Error ? error.stack : "No stack trace");
  
  // Log the error to monitoring system
  if (error instanceof Error) {
    logError(error, context);
  }
}

/**
 * Gets data source based on provider status
 */
export function getDataSource(isConnected: boolean, quotesDelayed: boolean): 'live' | 'delayed' | 'mock' {
  if (!isConnected) return 'mock';
  return quotesDelayed ? 'delayed' : 'live';
}
