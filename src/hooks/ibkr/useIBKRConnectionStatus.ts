
import { useState, useEffect, useCallback } from 'react';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { toast } from 'sonner';
import { logError } from '@/lib/errorMonitoring/core/logger';

// Check connection status interval (30 seconds)
const CONNECTION_CHECK_INTERVAL = 30000;

export interface ConnectionDiagnostics {
  timestamp: string;
  providerType: string;
  browserInfo: {
    userAgent: string;
    language: string;
    platform: string;
    timeZone: string;
  };
  connected?: boolean;
  status?: any;
  dataSource?: 'live' | 'delayed' | 'mock';
  error?: string;
  stack?: string;
}

export const useIBKRConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'delayed' | 'mock'>('mock');
  const [connectionDiagnostics, setConnectionDiagnostics] = useState<ConnectionDiagnostics | null>(null);

  // Check connection status and set appropriate flags
  const checkConnection = useCallback(async () => {
    try {
      console.log("[useIBKRConnectionStatus] Checking IBKR connection status...");
      const provider = getDataProvider();
      console.log("[useIBKRConnectionStatus] Data provider:", provider?.constructor.name);
      
      // Capture diagnostics info
      const diagnostics: ConnectionDiagnostics = {
        timestamp: new Date().toISOString(),
        providerType: provider?.constructor.name || 'Unknown',
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
      
      // Test if provider exists and has required methods
      if (!provider) {
        console.error("[useIBKRConnectionStatus] No data provider available");
        diagnostics.error = "No data provider available";
        setConnectionDiagnostics(diagnostics);
        setIsConnected(false);
        setDataSource('mock');
        return;
      }
      
      // Check if isConnected method exists
      if (typeof provider.isConnected !== 'function') {
        console.error("[useIBKRConnectionStatus] Provider missing isConnected method");
        diagnostics.error = "Provider missing isConnected method";
        setConnectionDiagnostics(diagnostics);
        setIsConnected(false);
        setDataSource('mock');
        return;
      }
      
      const connected = provider.isConnected();
      console.log("[useIBKRConnectionStatus] Provider connected:", connected);
      diagnostics.connected = connected;
      
      if (connected) {
        setIsConnected(true);
        // Check if data is live or delayed
        const status = (provider as any).status || { quotesDelayed: true };
        console.log("[useIBKRConnectionStatus] Provider status:", JSON.stringify(status, null, 2));
        diagnostics.status = status;
        
        setDataSource(status.quotesDelayed ? 'delayed' : 'live');
        console.log("[useIBKRConnectionStatus] Data source set to:", status.quotesDelayed ? 'delayed' : 'live');
        diagnostics.dataSource = status.quotesDelayed ? 'delayed' : 'live';
      } else {
        console.log("[useIBKRConnectionStatus] Provider not connected");
        setIsConnected(false);
        setDataSource('mock');
        diagnostics.dataSource = 'mock';
      }
      
      setConnectionDiagnostics(diagnostics);
    } catch (error) {
      console.error("[useIBKRConnectionStatus] Error checking IBKR connection:", error);
      console.error("[useIBKRConnectionStatus] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      
      const diagnostics: ConnectionDiagnostics = {
        timestamp: new Date().toISOString(),
        providerType: 'Unknown',
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace"
      };
      
      setConnectionDiagnostics(diagnostics);
      setIsConnected(false);
      setDataSource('mock');
      
      // Log the error to monitoring system
      if (error instanceof Error) {
        logError(error, { 
          service: 'useIBKRConnectionStatus', 
          method: 'checkConnection'
        });
      }
    }
  }, []);

  // Reconnect to IBKR if connection was lost
  const reconnect = useCallback(async () => {
    try {
      console.log("[useIBKRConnectionStatus] Attempting to reconnect to IBKR");
      toast.info("Reconnecting to Interactive Brokers...");
      
      const provider = getDataProvider();
      console.log("[useIBKRConnectionStatus] Using provider:", provider?.constructor.name);
      
      if (!provider) {
        console.error("[useIBKRConnectionStatus] No data provider available for reconnection");
        toast.error("No data provider available for reconnection");
        return false;
      }
      
      if (typeof provider.connect !== 'function') {
        console.error("[useIBKRConnectionStatus] Provider missing connect method");
        toast.error("Provider is missing connect method");
        return false;
      }
      
      console.log("[useIBKRConnectionStatus] Calling provider.connect()");
      const startTime = Date.now();
      const connected = await provider.connect();
      const endTime = Date.now();
      
      console.log(`[useIBKRConnectionStatus] Connect call took ${endTime - startTime}ms, result:`, connected);
      
      if (connected) {
        setIsConnected(true);
        const status = (provider as any).status || { quotesDelayed: true };
        console.log("[useIBKRConnectionStatus] Provider status after reconnect:", JSON.stringify(status, null, 2));
        
        setDataSource(status.quotesDelayed ? 'delayed' : 'live');
        toast.success("Successfully reconnected to Interactive Brokers");
        return true;
      } else {
        console.log("[useIBKRConnectionStatus] Failed to reconnect");
        setIsConnected(false);
        setDataSource('mock');
        toast.error("Failed to reconnect to Interactive Brokers");
        return false;
      }
    } catch (error) {
      console.error("[useIBKRConnectionStatus] Error reconnecting to IBKR:", error);
      console.error("[useIBKRConnectionStatus] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      setIsConnected(false);
      setDataSource('mock');
      toast.error(`Reconnection error: ${error instanceof Error ? error.message : "Unknown error"}`);
      
      // Log the error to monitoring system
      if (error instanceof Error) {
        logError(error, { 
          service: 'useIBKRConnectionStatus', 
          method: 'reconnect'
        });
      }
      
      return false;
    }
  }, []);

  // Effect to check connection on mount
  useEffect(() => {
    console.log("[useIBKRConnectionStatus] Hook mounted, checking connection");
    checkConnection();
    
    // Set up interval to periodically check connection
    const checkInterval = setInterval(() => {
      console.log("[useIBKRConnectionStatus] Periodic connection check running");
      checkConnection();
    }, CONNECTION_CHECK_INTERVAL);
    
    return () => {
      console.log("[useIBKRConnectionStatus] Clearing connection check interval");
      clearInterval(checkInterval);
    };
  }, [checkConnection]);

  return {
    isConnected,
    dataSource,
    connectionDiagnostics,
    checkConnection,
    reconnect
  };
};
