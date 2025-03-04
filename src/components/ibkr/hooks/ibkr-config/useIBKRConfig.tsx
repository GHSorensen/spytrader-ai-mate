
import { useState, useEffect } from 'react';

interface UseIBKRConfigReturn {
  // API method
  apiMethod: 'webapi' | 'tws';
  setApiMethod: (value: 'webapi' | 'tws') => void;
  
  // API credentials
  apiKey: string;
  setApiKey: (value: string) => void;
  callbackUrl: string;
  setCallbackUrl: (value: string) => void;
  
  // TWS settings
  twsHost: string;
  setTwsHost: (value: string) => void;
  twsPort: string; 
  setTwsPort: (value: string) => void;
  isPaperTrading: boolean;
  setIsPaperTrading: (value: boolean) => void;
  
  // Configuration state
  isConfigured: boolean;
  setIsConfigured: (value: boolean) => void;
}

export const useIBKRConfig = (): UseIBKRConfigReturn => {
  // API method
  const [apiMethod, setApiMethod] = useState<'webapi' | 'tws'>('webapi');
  
  // API credentials
  const [apiKey, setApiKey] = useState('');
  const [callbackUrl, setCallbackUrl] = useState(window.location.origin + '/auth/ibkr/callback');
  
  // TWS settings
  const [twsHost, setTwsHost] = useState('127.0.0.1');
  const [twsPort, setTwsPort] = useState('7496');
  const [isPaperTrading, setIsPaperTrading] = useState(false);
  
  // Configuration state
  const [isConfigured, setIsConfigured] = useState(false);

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('ibkr-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        
        if (config.connectionMethod === 'tws') {
          setApiMethod('tws');
          if (config.twsHost) setTwsHost(config.twsHost);
          if (config.twsPort) setTwsPort(config.twsPort);
          if (config.hasOwnProperty('paperTrading')) setIsPaperTrading(config.paperTrading);
        } else {
          setApiMethod('webapi');
          if (config.apiKey) setApiKey(config.apiKey);
          if (config.callbackUrl) setCallbackUrl(config.callbackUrl);
        }
        
        setIsConfigured(true);
      } catch (e) {
        console.error('Failed to parse saved IBKR config:', e);
      }
    }
  }, []);

  return {
    apiMethod,
    setApiMethod,
    apiKey,
    setApiKey,
    callbackUrl,
    setCallbackUrl,
    twsHost,
    setTwsHost,
    twsPort,
    setTwsPort,
    isPaperTrading,
    setIsPaperTrading,
    isConfigured,
    setIsConfigured
  };
};
