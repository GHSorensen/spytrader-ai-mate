
import { useState, useEffect, useRef, useCallback } from 'react';

interface ReconnectOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  onAttempt?: (attempt: number, maxAttempts: number) => void;
  onFailure?: (attempt: number) => void;
}

/**
 * Hook for IBKR reconnection logic with improved logging
 */
export function useReconnectLogic(
  isConnected: boolean,
  connectionLostTime: Date | null,
  reconnectFn: () => Promise<boolean>,
  options: ReconnectOptions = {}
) {
  const {
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 30000,
    onAttempt,
    onFailure
  } = options;
  
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wasConnected = useRef(isConnected);
  
  // Reset reconnect attempts
  const resetReconnectAttempts = useCallback(() => {
    setReconnectAttempts(0);
    
    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsReconnecting(false);
    console.log("[useReconnectLogic] Reset reconnect attempts");
  }, []);
  
  // Handle auto reconnect logic
  useEffect(() => {
    // Check if connection status changed
    if (wasConnected.current !== isConnected) {
      console.log(`[useReconnectLogic] Connection status changed: ${wasConnected.current} → ${isConnected}`);
      wasConnected.current = isConnected;
      
      // If we reconnected successfully, reset attempts
      if (isConnected) {
        resetReconnectAttempts();
      }
    }
    
    // Only attempt reconnect if we're disconnected, auto-reconnect is enabled,
    // and we haven't exceeded max attempts
    if (!isConnected && autoReconnect && reconnectAttempts < maxReconnectAttempts) {
      console.log(`[useReconnectLogic] Connection lost, will attempt reconnect in ${reconnectInterval/1000}s (attempt ${reconnectAttempts + 1} of ${maxReconnectAttempts})`);
      
      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Set timeout for next reconnect attempt
      reconnectTimeoutRef.current = setTimeout(async () => {
        if (!isConnected) {
          setIsReconnecting(true);
          const nextAttempt = reconnectAttempts + 1;
          setReconnectAttempts(nextAttempt);
          
          console.log(`[useReconnectLogic] Attempting reconnect (attempt ${nextAttempt} of ${maxReconnectAttempts})`);
          if (onAttempt) {
            onAttempt(nextAttempt, maxReconnectAttempts);
          }
          
          try {
            const success = await reconnectFn();
            console.log(`[useReconnectLogic] Reconnect attempt ${nextAttempt} result: ${success ? 'SUCCESS' : 'FAILED'}`);
            
            // If reconnect failed and we've hit max attempts, call onFailure
            if (!success && nextAttempt >= maxReconnectAttempts) {
              console.log(`[useReconnectLogic] Max reconnect attempts (${maxReconnectAttempts}) reached`);
              if (onFailure) {
                onFailure(nextAttempt);
              }
            }
            
            // Reset reconnecting flag regardless of outcome
            setIsReconnecting(false);
          } catch (error) {
            console.error(`[useReconnectLogic] Error during reconnect attempt ${nextAttempt}:`, error);
            setIsReconnecting(false);
            
            // If we've hit max attempts, call onFailure
            if (nextAttempt >= maxReconnectAttempts) {
              if (onFailure) {
                onFailure(nextAttempt);
              }
            }
          }
        }
      }, reconnectInterval);
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [
    isConnected, 
    autoReconnect, 
    reconnectAttempts, 
    maxReconnectAttempts,
    reconnectInterval,
    reconnectFn,
    resetReconnectAttempts,
    onAttempt,
    onFailure
  ]);
  
  return {
    isReconnecting,
    reconnectAttempts,
    resetReconnectAttempts
  };
}
