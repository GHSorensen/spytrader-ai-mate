
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { logConnectionError } from './utils';

/**
 * Hook to manage automatic reconnection logic
 */
export function useReconnectLogic(
  isConnected: boolean,
  connectionLostTime: Date | null,
  reconnectFn: () => Promise<boolean>,
  options: {
    autoReconnect: boolean;
    maxReconnectAttempts: number;
    reconnectInterval: number;
    onAttempt: (attempt: number, max: number) => void;
    onFailure: (attempt: number) => void;
  }
) {
  const {
    autoReconnect,
    maxReconnectAttempts,
    reconnectInterval,
    onAttempt,
    onFailure
  } = options;
  
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Auto-reconnect logic
  useEffect(() => {
    let reconnectTimer: number | null = null;
    
    const attemptReconnect = async () => {
      if (isConnected || !autoReconnect || reconnectAttempts >= maxReconnectAttempts) {
        return;
      }
      
      setIsReconnecting(true);
      onAttempt(reconnectAttempts + 1, maxReconnectAttempts);
      
      try {
        console.log(`[useReconnectLogic] Attempting reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        const success = await reconnectFn();
        
        if (success) {
          console.log('[useReconnectLogic] Reconnect successful');
          setReconnectAttempts(0);
        } else {
          setReconnectAttempts(prev => prev + 1);
          console.log(`[useReconnectLogic] Reconnect failed, attempts: ${reconnectAttempts + 1}`);
          onFailure(reconnectAttempts + 1);
          
          if (reconnectAttempts + 1 >= maxReconnectAttempts) {
            toast.error("Reconnection Failed", {
              description: `Failed to reconnect after ${maxReconnectAttempts} attempts. Please try manually reconnecting.`,
            });
          }
        }
      } catch (error) {
        console.error('[useReconnectLogic] Error during reconnect:', error);
        setReconnectAttempts(prev => prev + 1);
        
        logConnectionError(error, {
          service: 'useReconnectLogic',
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
