
import { useState, useEffect } from 'react';
import { ConnectionHistoryEvent } from '../types';

/**
 * Hook to manage connection state internals
 */
export function useConnectionState() {
  // Connection duration tracking
  const [connectionDuration, setConnectionDuration] = useState<number | null>(null);
  const [connectionCheckCount, setConnectionCheckCount] = useState(0);

  // Update connection check count
  const incrementCheckCount = () => {
    setConnectionCheckCount(prev => prev + 1);
  };
  
  // Calculate and manage connection duration
  const updateConnectionDuration = (isConnected: boolean, lastSuccessfulConnection: Date | null) => {
    if (isConnected && lastSuccessfulConnection) {
      const now = new Date();
      const durationMs = now.getTime() - lastSuccessfulConnection.getTime();
      setConnectionDuration(durationMs / 1000); // in seconds
      return durationMs / 1000;
    } else {
      setConnectionDuration(null);
      return null;
    }
  };
  
  // Setup timer to update duration
  const setupDurationTimer = (isConnected: boolean, lastSuccessfulConnection: Date | null) => {
    if (isConnected && lastSuccessfulConnection) {
      const updateDuration = () => {
        updateConnectionDuration(isConnected, lastSuccessfulConnection);
      };
      
      updateDuration();
      const timer = setInterval(updateDuration, 1000);
      return () => clearInterval(timer);
    }
    
    return undefined;
  };
  
  return {
    connectionDuration,
    connectionCheckCount,
    incrementCheckCount,
    updateConnectionDuration,
    setupDurationTimer
  };
}
