
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useIBKRConnectionStatus } from './useIBKRConnectionStatus';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { ErrorType } from '@/lib/errorMonitoring/types/errorClassification';
import { logError } from '@/lib/errorMonitoring/core/logger';

interface UseIBKRConnectionMonitorOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number; // in milliseconds
  onStatusChange?: (status: { isConnected: boolean; dataSource: 'live' | 'delayed' | 'mock' }) => void;
}

/**
 * Enhanced connection monitoring hook for IBKR integration
 * Provides automatic reconnection and detailed connection diagnostics
 */
export const useIBKRConnectionMonitor = (options: UseIBKRConnectionMonitorOptions = {}) => {
  const {
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 30000, // 30 seconds
    onStatusChange
  } = options;

  const { 
    isConnected, 
    dataSource, 
    connectionDiagnostics, 
    checkConnection, 
    reconnect 
  } = useIBKRConnectionStatus();
  
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionLostTime, setConnectionLostTime] = useState<Date | null>(null);
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    timestamp: Date;
    event: 'connected' | 'disconnected' | 'reconnect_attempt' | 'reconnect_success' | 'reconnect_failure';
    details?: string;
  }>>([]);

  // Track connection status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({ isConnected, dataSource });
    }
    
    // Add to connection history
    const timestamp = new Date();
    if (isConnected) {
      // Connection established
      setConnectionHistory(prev => [
        ...prev, 
        { 
          timestamp, 
          event: reconnectAttempts > 0 ? 'reconnect_success' : 'connected',
          details: `Connected to ${dataSource} data source` 
        }
      ]);
      setConnectionLostTime(null);
      setReconnectAttempts(0);
    } else if (!isConnected && connectionLostTime === null) {
      // Connection lost for the first time
      setConnectionHistory(prev => [
        ...prev, 
        { 
          timestamp, 
          event: 'disconnected',
          details: `Disconnected from ${dataSource} data source` 
        }
      ]);
      setConnectionLostTime(timestamp);
    }
  }, [isConnected, dataSource, onStatusChange, reconnectAttempts, connectionLostTime]);

  // Auto-reconnect logic
  useEffect(() => {
    let reconnectTimer: number | null = null;
    
    const attemptReconnect = async () => {
      if (isConnected || !autoReconnect || reconnectAttempts >= maxReconnectAttempts) {
        return;
      }
      
      setIsReconnecting(true);
      setConnectionHistory(prev => [
        ...prev, 
        { 
          timestamp: new Date(), 
          event: 'reconnect_attempt',
          details: `Reconnect attempt ${reconnectAttempts + 1} of ${maxReconnectAttempts}` 
        }
      ]);
      
      try {
        console.log(`[useIBKRConnectionMonitor] Attempting reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        const success = await reconnect();
        
        if (success) {
          console.log('[useIBKRConnectionMonitor] Reconnect successful');
          setReconnectAttempts(0);
        } else {
          setReconnectAttempts(prev => prev + 1);
          console.log(`[useIBKRConnectionMonitor] Reconnect failed, attempts: ${reconnectAttempts + 1}`);
          
          // Add to connection history
          setConnectionHistory(prev => [
            ...prev, 
            { 
              timestamp: new Date(), 
              event: 'reconnect_failure',
              details: `Reconnect attempt ${reconnectAttempts + 1} failed` 
            }
          ]);
          
          if (reconnectAttempts + 1 >= maxReconnectAttempts) {
            toast.error("Reconnection Failed", {
              description: `Failed to reconnect after ${maxReconnectAttempts} attempts. Please try manually reconnecting.`,
            });
          }
        }
      } catch (error) {
        console.error('[useIBKRConnectionMonitor] Error during reconnect:', error);
        setReconnectAttempts(prev => prev + 1);
        
        logError(error instanceof Error ? error : new Error('Unknown error during reconnect'), {
          service: 'useIBKRConnectionMonitor',
          method: 'attemptReconnect',
          reconnectAttempt: reconnectAttempts + 1
        });
      } finally {
        setIsReconnecting(false);
      }
    };
    
    if (!isConnected && connectionLostTime && autoReconnect && reconnectAttempts < maxReconnectAttempts) {
      reconnectTimer = window.setTimeout(attemptReconnect, reconnectInterval);
    }
    
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [
    isConnected, 
    autoReconnect, 
    reconnectAttempts, 
    maxReconnectAttempts, 
    reconnectInterval, 
    connectionLostTime, 
    reconnect
  ]);

  // Manual reconnect handler - reset attempt counter and try immediately
  const handleManualReconnect = useCallback(async () => {
    setIsReconnecting(true);
    setConnectionHistory(prev => [
      ...prev, 
      { 
        timestamp: new Date(), 
        event: 'reconnect_attempt',
        details: 'Manual reconnect attempt' 
      }
    ]);
    
    try {
      console.log('[useIBKRConnectionMonitor] Manual reconnect attempt');
      toast.info("Attempting to reconnect...");
      
      const success = await reconnect();
      
      if (success) {
        console.log('[useIBKRConnectionMonitor] Manual reconnect successful');
        toast.success("Successfully reconnected");
        setReconnectAttempts(0);
      } else {
        console.log('[useIBKRConnectionMonitor] Manual reconnect failed');
        toast.error("Reconnection Failed", {
          description: "Could not establish connection. Please check your network and IBKR credentials.",
        });
        
        // Add to connection history
        setConnectionHistory(prev => [
          ...prev, 
          { 
            timestamp: new Date(), 
            event: 'reconnect_failure',
            details: 'Manual reconnect attempt failed' 
          }
        ]);
      }
    } catch (error) {
      console.error('[useIBKRConnectionMonitor] Error during manual reconnect:', error);
      
      toast.error("Reconnection Error", {
        description: error instanceof Error ? error.message : "Unknown error during reconnection",
      });
      
      logError(error instanceof Error ? error : new Error('Unknown error during manual reconnect'), {
        service: 'useIBKRConnectionMonitor',
        method: 'handleManualReconnect'
      });
    } finally {
      setIsReconnecting(false);
    }
  }, [reconnect]);

  // Force a check of the connection status
  const forceConnectionCheck = useCallback(() => {
    console.log('[useIBKRConnectionMonitor] Forcing connection check');
    checkConnection();
  }, [checkConnection]);

  // Get detailed connection diagnostics
  const getDetailedDiagnostics = useCallback(() => {
    try {
      const provider = getDataProvider();
      const providerDiagnostics = provider && typeof (provider as any).getDiagnostics === 'function' 
        ? (provider as any).getDiagnostics() 
        : { status: 'unknown', type: provider?.constructor.name };
      
      return {
        isConnected,
        dataSource,
        connectionDiagnostics,
        reconnectAttempts,
        isReconnecting,
        connectionLostTime,
        connectionHistory: connectionHistory.slice(-10), // Last 10 events
        provider: providerDiagnostics,
        browser: {
          userAgent: navigator.userAgent,
          online: navigator.onLine,
          language: navigator.language,
          platform: navigator.platform,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
    } catch (error) {
      console.error('[useIBKRConnectionMonitor] Error getting diagnostics:', error);
      return {
        error: 'Failed to get diagnostics',
        isConnected,
        dataSource
      };
    }
  }, [
    isConnected, 
    dataSource, 
    connectionDiagnostics, 
    reconnectAttempts, 
    isReconnecting, 
    connectionLostTime, 
    connectionHistory
  ]);

  return {
    isConnected,
    dataSource,
    isReconnecting,
    reconnectAttempts,
    connectionLostTime,
    connectionHistory,
    handleManualReconnect,
    forceConnectionCheck,
    getDetailedDiagnostics
  };
};
