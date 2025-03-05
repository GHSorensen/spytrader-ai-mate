
import { useState, useCallback } from 'react';
import { ConnectionHistoryEvent } from './types';

/**
 * Hook to track connection history events
 */
export function useConnectionHistory() {
  const [connectionHistory, setConnectionHistory] = useState<ConnectionHistoryEvent[]>([]);
  const [connectionLostTime, setConnectionLostTime] = useState<Date | null>(null);

  const addHistoryEvent = useCallback((event: ConnectionHistoryEvent) => {
    setConnectionHistory(prev => [...prev, event]);
  }, []);

  const handleConnectionChange = useCallback((isConnected: boolean, wasReconnectAttempt = false) => {
    const timestamp = new Date();
    
    if (isConnected) {
      // Connection established
      addHistoryEvent({ 
        timestamp, 
        event: wasReconnectAttempt ? 'reconnect_success' : 'connected',
        details: `Connected successfully${wasReconnectAttempt ? ' after reconnect' : ''}` 
      });
      setConnectionLostTime(null);
    } else if (!isConnected && connectionLostTime === null) {
      // Connection lost for the first time
      addHistoryEvent({ 
        timestamp, 
        event: 'disconnected',
        details: 'Connection lost' 
      });
      setConnectionLostTime(timestamp);
    }
  }, [connectionLostTime, addHistoryEvent]);

  const recordReconnectAttempt = useCallback((attempt: number, maxAttempts: number, success?: boolean) => {
    const timestamp = new Date();
    
    if (success === undefined) {
      // Just recording an attempt
      addHistoryEvent({ 
        timestamp, 
        event: 'reconnect_attempt',
        details: `Reconnect attempt ${attempt} of ${maxAttempts}` 
      });
    } else if (success === false) {
      // Recording a failure
      addHistoryEvent({ 
        timestamp, 
        event: 'reconnect_failure',
        details: `Reconnect attempt ${attempt} failed` 
      });
    }
    // Success is handled by handleConnectionChange
  }, [addHistoryEvent]);

  return {
    connectionHistory,
    connectionLostTime,
    handleConnectionChange,
    recordReconnectAttempt,
    addHistoryEvent
  };
}
