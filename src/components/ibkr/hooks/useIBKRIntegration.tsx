import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { IBKRAuth } from '@/services/dataProviders/interactiveBrokers/auth';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';

export const useIBKRIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiMethod, setApiMethod] = useState<'webapi' | 'tws'>('webapi');
  const [apiKey, setApiKey] = useState('');
  const [callbackUrl, setCallbackUrl] = useState(`${window.location.origin}/auth/ibkr/callback`);
  const [twsHost, setTwsHost] = useState('localhost');
  const [twsPort, setTwsPort] = useState('7497'); // Default to paper trading port
  const [isPaperTrading, setIsPaperTrading] = useState(true); // Default to paper trading
  const [isConfigured, setIsConfigured] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastConnected, setLastConnected] = useState<Date | null>(null);
  const [autoReconnectEnabled, setAutoReconnectEnabled] = useState(true);
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
        
        if (config.autoReconnect !== undefined) {
          setAutoReconnectEnabled(config.autoReconnect);
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
  
  // Auto reconnect logic
  useEffect(() => {
    // Only attempt reconnection if previously connected and autoReconnect is enabled
    if (autoReconnectEnabled && lastConnected && connectionStatus === 'disconnected') {
      const reconnectInterval = setInterval(() => {
        console.log("Attempting to reconnect to TWS...");
        setIsConnecting(true);
        setConnectionStatus('connecting');
        
        // This would trigger a reconnection attempt
        toast.info("Attempting to reconnect to TWS...");
        
        // Reset the connecting state after a timeout if no connection established
        setTimeout(() => {
          if (connectionStatus === 'connecting') { // Fixed comparison here
            setIsConnecting(false);
          }
        }, 5000);
      }, 30000); // Try every 30 seconds
      
      return () => clearInterval(reconnectInterval);
    }
  }, [autoReconnectEnabled, lastConnected, connectionStatus]);
  
  // Function to save config with auto reconnect preference
  const saveConfiguration = useCallback((config: DataProviderConfig) => {
    const configToSave = {
      ...config,
      autoReconnect: autoReconnectEnabled
    };
    localStorage.setItem('ibkr-config', JSON.stringify(configToSave));
    setIsConfigured(true);
  }, [autoReconnectEnabled]);
  
  // When connection is established
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setLastConnected(new Date());
    }
  }, [connectionStatus]);
  
  const connectToBrokerage = useCallback(async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      // This would trigger a reconnection attempt
      toast.info("Attempting to reconnect to TWS...");
      
      // Reset the connecting state after a timeout if no connection established
      setTimeout(() => {
        if (connectionStatus === 'connecting') { // This needs to match exactly
          setConnectionStatus('disconnected');
          setIsConnecting(false);
        }
      }, 5000);
    } catch (error) {
      // Error handling
    }
  }, [connectionStatus, setIsConnecting, setConnectionStatus]);
  
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
    autoReconnectEnabled,
    setAutoReconnectEnabled,
    saveConfiguration,
    navigate,
    lastConnected,
    connectToBrokerage
  };
}
