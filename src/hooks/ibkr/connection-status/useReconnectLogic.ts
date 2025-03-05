
import { useState, useEffect, useCallback, useRef } from 'react';

interface ReconnectOptions {
  autoReconnect: boolean;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  onAttempt?: (attempt: number, max: number) => void;
  onFailure?: (attempt: number) => void;
}

/**
 * Hook for handling reconnection logic
 */
export function useReconnectLogic(
  isConnected: boolean,
  connectionLostTime: Date | null,
  reconnectFn: () => Promise<boolean>,
  options: ReconnectOptions
) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimerRef = useRef<number | null>(null);
  
  const {
    autoReconnect,
    maxReconnectAttempts,
    reconnectInterval,
    onAttempt,
    onFailure
  } = options;
  
  // Reset reconnect attempts when connected
  useEffect(() => {
    if (isConnected) {
      setReconnectAttempts(0);
    }
  }, [isConnected]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
    };
  }, []);
  
  // Handle auto-reconnect
  useEffect(() => {
    if (
      autoReconnect && 
      !isConnected && 
      connectionLostTime && 
      !isReconnecting && 
      reconnectAttempts < maxReconnectAttempts
    ) {
      const attemptReconnect = async () => {
        const nextAttempt = reconnectAttempts + 1;
        setReconnectAttempts(nextAttempt);
        setIsReconnecting(true);
        
        if (onAttempt) {
          onAttempt(nextAttempt, maxReconnectAttempts);
        }
        
        try {
          console.log(`[useReconnectLogic] Attempting reconnect ${nextAttempt}/${maxReconnectAttempts}`);
          const success = await reconnectFn();
          
          if (success) {
            console.log(`[useReconnectLogic] Reconnection successful on attempt ${nextAttempt}`);
          } else {
            console.log(`[useReconnectLogic] Reconnection attempt ${nextAttempt} failed`);
            
            if (nextAttempt >= maxReconnectAttempts) {
              console.log(`[useReconnectLogic] Maximum reconnection attempts reached`);
              if (onFailure) {
                onFailure(nextAttempt);
              }
            }
          }
        } catch (error) {
          console.error(`[useReconnectLogic] Error during reconnection attempt ${nextAttempt}:`, error);
          
          if (nextAttempt >= maxReconnectAttempts) {
            console.log(`[useReconnectLogic] Maximum reconnection attempts reached with error`);
            if (onFailure) {
              onFailure(nextAttempt);
            }
          }
        } finally {
          setIsReconnecting(false);
        }
      };
      
      // Schedule next reconnect attempt
      reconnectTimerRef.current = window.setTimeout(
        attemptReconnect,
        reconnectInterval
      );
    }
  }, [
    autoReconnect,
    isConnected,
    connectionLostTime,
    isReconnecting,
    reconnectAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    reconnectFn,
    onAttempt,
    onFailure
  ]);
  
  // Reset reconnect attempts
  const resetReconnectAttempts = useCallback(() => {
    setReconnectAttempts(0);
  }, []);
  
  return {
    isReconnecting,
    reconnectAttempts,
    resetReconnectAttempts
  };
}
