
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
        provider?.constructor.name || "Unknown"
      );
      
      // Enhanced provider info logging
      console.log("[useConnectionCheck] Provider details:", {
        name: provider?.constructor.name,
        exists: !!provider,
        hasIsConnected: typeof provider?.isConnected === 'function',
        hasConnect: typeof provider?.connect === 'function'
      });
      
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
        
        // More detailed status information for debugging
        diagnostics.status = status;
        quotesDelayed = status.quotesDelayed;
        diagnostics.dataSource = quotesDelayed ? 'delayed' : 'live';
        
        console.log(`[useConnectionCheck] Data source: ${quotesDelayed ? 'delayed' : 'live'}`);
        console.log(`[useConnectionCheck] Connected to: ${provider.constructor.name}`);
        console.log(`[useConnectionCheck] Last updated: ${status.lastUpdated}`);
        
        // Additional provider-specific diagnostics
        if ((provider as any).getDiagnostics) {
          try {
            const providerDiagnostics = (provider as any).getDiagnostics();
            console.log("[useConnectionCheck] Provider diagnostics:", providerDiagnostics);
          } catch (err) {
            console.error("[useConnectionCheck] Error getting provider diagnostics:", err);
          }
        }
      } else {
        console.log("[useConnectionCheck] Provider not connected, using mock data");
        diagnostics.dataSource = 'mock';
      }
      
      setConnectionDiagnostics(diagnostics);
      return { connected, quotesDelayed };
    } catch (error) {
      console.error("[useConnectionCheck] Error checking connection:", error);
      
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
