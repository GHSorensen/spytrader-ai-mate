
import { useState, useCallback } from 'react';
import { getProviderWithDiagnostics, createConnectionDiagnostics, logConnectionError } from './utils';
import { ConnectionDiagnostics } from './types';

/**
 * Hook for checking connection status with detailed diagnostics
 */
export function useConnectionCheck() {
  const [connectionDiagnostics, setConnectionDiagnostics] = useState<ConnectionDiagnostics | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      console.log("[useConnectionCheck] Checking IBKR connection status...");
      const provider = getProviderWithDiagnostics();
      
      // Create base diagnostics
      const diagnostics = createConnectionDiagnostics(
        provider?.constructor.name
      );
      
      // Test if provider exists and has required methods
      if (!provider) {
        console.error("[useConnectionCheck] No data provider available");
        diagnostics.error = "No data provider available";
        setConnectionDiagnostics(diagnostics);
        return { connected: false, quotesDelayed: true };
      }
      
      // Check if isConnected method exists
      if (typeof provider.isConnected !== 'function') {
        console.error("[useConnectionCheck] Provider missing isConnected method");
        diagnostics.error = "Provider missing isConnected method";
        setConnectionDiagnostics(diagnostics);
        return { connected: false, quotesDelayed: true };
      }
      
      const connected = provider.isConnected();
      console.log("[useConnectionCheck] Provider connected:", connected);
      diagnostics.connected = connected;
      
      let quotesDelayed = true;
      
      if (connected) {
        // Check if data is live or delayed
        const status = (provider as any).status || { quotesDelayed: true };
        console.log("[useConnectionCheck] Provider status:", JSON.stringify(status, null, 2));
        diagnostics.status = status;
        quotesDelayed = status.quotesDelayed;
        diagnostics.dataSource = quotesDelayed ? 'delayed' : 'live';
      } else {
        console.log("[useConnectionCheck] Provider not connected");
        diagnostics.dataSource = 'mock';
      }
      
      setConnectionDiagnostics(diagnostics);
      return { connected, quotesDelayed };
    } catch (error) {
      logConnectionError(error, { 
        service: 'useConnectionCheck', 
        method: 'checkConnection'
      });
      
      const diagnostics = createConnectionDiagnostics('Unknown', error instanceof Error ? error : new Error('Unknown error'));
      setConnectionDiagnostics(diagnostics);
      
      return { connected: false, quotesDelayed: true };
    }
  }, []);

  return {
    checkConnection,
    connectionDiagnostics
  };
}
