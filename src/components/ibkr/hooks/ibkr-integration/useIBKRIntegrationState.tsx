
import { useState } from 'react';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';

/**
 * Hook to manage IBKR integration state
 */
export const useIBKRIntegrationState = () => {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<IBKRConnectionStatus>('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  
  return {
    connectionStatus,
    setConnectionStatus,
    isConnecting,
    setIsConnecting
  };
};
