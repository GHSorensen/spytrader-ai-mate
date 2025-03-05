
import { useState, useCallback } from 'react';
import { ConnectionHistoryEvent } from './types';

/**
 * Hook to track connection history and events
 */
export function useConnectionHistory() {
  const [connectionHistory, setConnectionHistory] = useState<ConnectionHistoryEvent[]>([]);
  const [connectionLostTime, setConnectionLostTime] = useState<Date | null>(null);
  
  /**
   * Handle connection status change
   */
  const handleConnectionChange = useCallback((
    isConnected: boolean,
    wasReconnect: boolean = false
  ) => {
    const now = new Date();
    let event: ConnectionHistoryEvent['event'];
    
    if (isConnected) {
      event = wasReconnect ? 'reconnect_success' : 'connected';
      setConnectionLostTime(null);
    } else {
      event = 'disconnected';
      setConnectionLostTime(now);
    }
    
    const historyEvent: ConnectionHistoryEvent = {
      timestamp: now,
      event
    };
    
    setConnectionHistory(prev => [...prev, historyEvent]);
  }, []);
  
  /**
   * Record a reconnection attempt
   */
  const recordReconnectAttempt = useCallback((
    attempt: number,
    maxAttempts: number,
    isAttempt: boolean = true
  ) => {
    const now = new Date();
    let event: ConnectionHistoryEvent['event'] = 'reconnect_attempt';
    let details = `Attempt ${attempt} of ${maxAttempts}`;
    
    if (!isAttempt) {
      event = 'reconnect_failure';
      details = `Failed after ${attempt} attempt${attempt !== 1 ? 's' : ''}`;
    }
    
    const historyEvent: ConnectionHistoryEvent = {
      timestamp: now,
      event,
      details
    };
    
    setConnectionHistory(prev => [...prev, historyEvent]);
  }, []);
  
  return {
    connectionHistory,
    connectionLostTime,
    handleConnectionChange,
    recordReconnectAttempt
  };
}
