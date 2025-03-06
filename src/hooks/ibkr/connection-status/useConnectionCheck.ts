
import { useState, useCallback } from 'react';
import { getProviderWithDiagnostics, createConnectionDiagnostics, logConnectionError, debugIBKRConnection } from './utils';
import { ConnectionDiagnostics } from './types';

/**
 * Hook for checking connection status with detailed diagnostics
 */
export function useConnectionCheck() {
  const [connectionDiagnostics, setConnectionDiagnostics] = useState<ConnectionDiagnostics | null>(null);

  const checkConnection = useCallback(async () => {
    console.group("[useConnectionCheck] Checking IBKR connection status");
    try {
      const provider = getProviderWithDiagnostics();
      
      // Log more details for debugging
      console.log("[useConnectionCheck] Checking connection at:", new Date().toISOString());
      
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
        console.groupEnd();
        return { connected: false, quotesDelayed: true };
      }
      
      // Check if isConnected method exists
      if (typeof provider.isConnected !== 'function') {
        console.error("[useConnectionCheck] Provider missing isConnected method");
        diagnostics.error = "Provider missing isConnected method";
        setConnectionDiagnostics(diagnostics);
        console.groupEnd();
        return { connected: false, quotesDelayed: true };
      }
      
      const connected = provider.isConnected();
      console.log("[useConnectionCheck] Provider isConnected() returned:", connected);
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
        
        // Check if there's a stored config but provider isn't connected
        if (localStorage.getItem('ibkr-config')) {
          console.warn("[useConnectionCheck] IBKR config exists in localStorage but provider is not connected");
          console.log("[useConnectionCheck] Stored config:", localStorage.getItem('ibkr-config'));
          diagnostics.error = "Config exists but provider not connected";
        }
        
        // Additional debugging
        debugIBKRConnection();
      }
      
      setConnectionDiagnostics(diagnostics);
      console.groupEnd();
      return { connected, quotesDelayed };
    } catch (error) {
      console.error("[useConnectionCheck] Error checking connection:", error);
      
      logConnectionError(error, { 
        service: 'useConnectionCheck', 
        method: 'checkConnection'
      });
      
      const diagnostics = createConnectionDiagnostics('Unknown', error instanceof Error ? error : new Error('Unknown error'));
      setConnectionDiagnostics(diagnostics);
      
      console.groupEnd();
      return { connected: false, quotesDelayed: true };
    }
  }, []);

  return {
    checkConnection,
    connectionDiagnostics
  };
}
