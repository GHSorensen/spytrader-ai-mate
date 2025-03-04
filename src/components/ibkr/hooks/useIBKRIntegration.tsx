
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { IBKRAuth } from '@/services/dataProviders/interactiveBrokers/auth';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';

export function useIBKRIntegration() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiMethod, setApiMethod] = useState<'webapi' | 'tws'>('webapi');
  const [apiKey, setApiKey] = useState('');
  const [callbackUrl, setCallbackUrl] = useState(`${window.location.origin}/auth/ibkr/callback`);
  const [twsHost, setTwsHost] = useState('localhost');
  const [twsPort, setTwsPort] = useState('7497'); // Default to paper trading port
  const [isPaperTrading, setIsPaperTrading] = useState(true); // Default to paper trading
  const [isConfigured, setIsConfigured] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check local storage for existing IBKR config
    const savedConfig = localStorage.getItem('ibkr-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.apiKey) {
          setApiKey(config.apiKey);
          setCallbackUrl(config.callbackUrl || callbackUrl);
          setIsConfigured(true);
        }
        
        if (config.twsHost) {
          setTwsHost(config.twsHost);
          setTwsPort(config.twsPort || '7497'); // Default to paper trading port
          if (config.connectionMethod === 'tws') {
            setApiMethod('tws');
          }
          if (config.paperTrading !== undefined) {
            setIsPaperTrading(config.paperTrading);
          } else {
            // Default to paper trading if port is 7497
            setIsPaperTrading(config.twsPort === '7497');
          }
        }
      } catch (err) {
        console.error("Error parsing saved IBKR config:", err);
      }
    }
  }, []);

  // Set TWS port based on paper trading setting
  useEffect(() => {
    if (isPaperTrading && twsPort === '7496') {
      setTwsPort('7497');
    } else if (!isPaperTrading && twsPort === '7497') {
      setTwsPort('7496');
    }
  }, [isPaperTrading, twsPort]);
  
  return {
    // State
    isConnecting,
    setIsConnecting,
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
    setIsConfigured,
    connectionStatus,
    setConnectionStatus,
    navigate
  };
}
