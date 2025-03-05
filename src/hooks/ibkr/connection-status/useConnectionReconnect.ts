
import { useCallback } from 'react';
import { toast } from 'sonner';
import { getProviderWithDiagnostics, logConnectionError } from './utils';

/**
 * Hook for reconnection functionality to IBKR
 */
export function useConnectionReconnect() {
  const reconnect = useCallback(async () => {
    try {
      console.log("[useConnectionReconnect] Attempting to reconnect to IBKR");
      toast.info("Reconnecting to Interactive Brokers...");
      
      const provider = getProviderWithDiagnostics();
      
      if (!provider) {
        console.error("[useConnectionReconnect] No data provider available for reconnection");
        toast.error("No data provider available for reconnection");
        return false;
      }
      
      if (typeof provider.connect !== 'function') {
        console.error("[useConnectionReconnect] Provider missing connect method");
        toast.error("Provider is missing connect method");
        return false;
      }
      
      console.log("[useConnectionReconnect] Calling provider.connect()");
      const startTime = Date.now();
      const connected = await provider.connect();
      const endTime = Date.now();
      
      console.log(`[useConnectionReconnect] Connect call took ${endTime - startTime}ms, result:`, connected);
      
      if (connected) {
        const status = (provider as any).status || { quotesDelayed: true };
        console.log("[useConnectionReconnect] Provider status after reconnect:", JSON.stringify(status, null, 2));
        
        toast.success("Successfully reconnected to Interactive Brokers");
        return true;
      } else {
        console.log("[useConnectionReconnect] Failed to reconnect");
        toast.error("Failed to reconnect to Interactive Brokers");
        return false;
      }
    } catch (error) {
      logConnectionError(error, { 
        service: 'useConnectionReconnect', 
        method: 'reconnect'
      });
      
      toast.error(`Reconnection error: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    }
  }, []);

  return { reconnect };
}
