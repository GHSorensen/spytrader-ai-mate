
import { useState, useCallback } from 'react';
import { ConnectionHistoryEvent } from './types';

/**
 * Hook for tracking connection history events
 */
export function useConnectionHistory() {
  const [connectionHistory, setConnectionHistory] = useState<ConnectionHistoryEvent[]>([]);
  const [connectionLostTime, setConnectionLostTime] = useState<Date | null>(null);
  
  // Handle connection status changes
  const handleConnectionChange = useCallback((isConnected: boolean, wasReconnect: boolean = false) => {
    const now = new Date();
    
    if (isConnected) {
      // If we were previously disconnected and now connected
      if (connectionLostTime) {
        const event: ConnectionHistoryEvent = {
          timestamp: now,
          event: wasReconnect ? 'reconnect_success' : 'connected',
          details: wasReconnect ? 'Connection restored after reconnect' : 'Connection established'
        };
        
        setConnectionHistory(prev => [...prev, event]);
        setConnectionLostTime(null); // Reset connection lost time
        
        // Detailed logging
        console.log(`[useConnectionHistory] Connection ${wasReconnect ? 'restored' : 'established'} at ${now.toISOString()}`);
        if (connectionLostTime) {
          const downtime = (now.getTime() - connectionLostTime.getTime()) / 1000;
          console.log(`[useConnectionHistory] Connection was down for ${downtime.toFixed(1)} seconds`);
        }
      } 
      // If this is the first connection event, log it
      else if (connectionHistory.length === 0) {
        const event: ConnectionHistoryEvent = {
          timestamp: now,
          event: 'connected',
          details: 'Initial connection established'
        };
        
        setConnectionHistory(prev => [...prev, event]);
        console.log(`[useConnectionHistory] Initial connection established at ${now.toISOString()}`);
      }
    } else {
      // If we just disconnected
      if (!connectionLostTime) {
        const event: ConnectionHistoryEvent = {
          timestamp: now,
          event: 'disconnected',
          details: 'Connection lost'
        };
        
        setConnectionHistory(prev => [...prev, event]);
        setConnectionLostTime(now);
        
        // Detailed logging
        console.log(`[useConnectionHistory] Connection lost at ${now.toISOString()}`);
        console.log(`[useConnectionHistory] Connection history:`, connectionHistory);
      }
    }
  }, [connectionHistory, connectionLostTime]);
  
  // Record reconnect attempts
  const recordReconnectAttempt = useCallback((
    attempt: number, 
    maxAttempts: number, 
    success?: boolean
  ) => {
    const now = new Date();
    let event: ConnectionHistoryEvent;
    
    if (success === undefined) {
      // This is just an attempt
      event = {
        timestamp: now,
        event: 'reconnect_attempt',
        details: `Attempt ${attempt} of ${maxAttempts}`
      };
    } else if (success) {
      // This is a successful reconnect
      event = {
        timestamp: now,
        event: 'reconnect_success',
        details: `Successful after ${attempt} attempt(s)`
      };
    } else {
      // This is a failed reconnect
      event = {
        timestamp: now,
        event: 'reconnect_failure',
        details: `Failed after ${attempt} attempt(s)`
      };
    }
    
    setConnectionHistory(prev => [...prev, event]);
    console.log(`[useConnectionHistory] ${event.event}: ${event.details} at ${now.toISOString()}`);
  }, []);
  
  return {
    connectionHistory,
    connectionLostTime,
    handleConnectionChange,
    recordReconnectAttempt
  };
}
