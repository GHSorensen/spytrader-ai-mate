
import { useIBKRConfigManager } from './handlers/useIBKRConfigManager';
import { useIBKRAuthHandlers } from './handlers/useIBKRAuthHandlers';
import { useIBKRTwsHandlers } from './handlers/useIBKRTwsHandlers';
import { useIBKRTestHandlers } from './handlers/useIBKRTestHandlers';
import { NavigateFunction } from 'react-router-dom';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';

interface UseIBKRHandlersProps {
  apiKey: string;
  callbackUrl: string;
  twsHost: string;
  twsPort: string;
  isPaperTrading: boolean;
  setIsConnecting: (value: boolean) => void;
  setConnectionStatus: (status: IBKRConnectionStatus) => void;
  setIsConfigured: (value: boolean) => void;
  navigate: NavigateFunction;
}

export const useIBKRHandlers = ({
  apiKey,
  callbackUrl,
  twsHost,
  twsPort,
  isPaperTrading,
  setIsConnecting,
  setConnectionStatus,
  setIsConfigured,
  navigate
}: UseIBKRHandlersProps) => {
  
  const { saveIBKRConfig } = useIBKRConfigManager();
  
  const { handleStartAuth, handleBackToDashboard } = useIBKRAuthHandlers({
    apiKey,
    callbackUrl,
    isPaperTrading,
    setIsConnecting,
    setConnectionStatus,
    setIsConfigured,
    saveIBKRConfig,
    navigate
  });
  
  const { handleTwsConnect } = useIBKRTwsHandlers({
    twsHost,
    twsPort,
    isPaperTrading,
    setIsConnecting,
    setConnectionStatus,
    setIsConfigured,
    saveIBKRConfig,
    navigate
  });
  
  const { handleTestConnection } = useIBKRTestHandlers({
    apiKey,
    callbackUrl,
    twsHost,
    twsPort,
    isPaperTrading,
    setConnectionStatus,
    setIsConfigured
  });
  
  return {
    handleStartAuth,
    handleTwsConnect,
    handleBackToDashboard,
    handleTestConnection
  };
};
