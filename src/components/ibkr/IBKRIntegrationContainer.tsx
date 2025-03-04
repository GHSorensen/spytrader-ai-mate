
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { IBKRAuth } from '@/services/dataProviders/interactiveBrokers/auth';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import IBKRIntegrationView from './IBKRIntegrationView';

const IBKRIntegrationContainer: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiMethod, setApiMethod] = useState<'webapi' | 'tws'>('webapi');
  const [apiKey, setApiKey] = useState('');
  const [callbackUrl, setCallbackUrl] = useState(`${window.location.origin}/auth/ibkr/callback`);
  const [twsHost, setTwsHost] = useState('localhost');
  const [twsPort, setTwsPort] = useState('7496');
  const [isPaperTrading, setIsPaperTrading] = useState(false);
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
          setTwsPort(config.twsPort || '7496');
          if (config.connectionMethod === 'tws') {
            setApiMethod('tws');
          }
          if (config.paperTrading) {
            setIsPaperTrading(true);
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
  }, [isPaperTrading]);
  
  const handleStartAuth = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      if (!apiKey) {
        toast.error("Please enter your API Key");
        setIsConnecting(false);
        setConnectionStatus('error');
        return;
      }
      
      // Save config to local storage
      const config: DataProviderConfig = {
        type: 'interactive-brokers',
        apiKey,
        callbackUrl
      };
      
      localStorage.setItem('ibkr-config', JSON.stringify(config));
      
      // Initialize auth handler
      const ibkrAuth = new IBKRAuth(config);
      
      // Get authorization URL
      const authUrl = ibkrAuth.getAuthorizationUrl();
      
      // Redirect to IBKR auth page
      console.log("Redirecting to IBKR auth URL:", authUrl);
      window.location.href = authUrl;
      
    } catch (error) {
      console.error("Error starting IBKR auth process:", error);
      toast.error("Failed to connect to Interactive Brokers. Please try again.");
      setIsConnecting(false);
      setConnectionStatus('error');
    }
  };
  
  const handleTwsConnect = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      if (!twsHost || !twsPort) {
        toast.error("Please enter TWS host and port");
        setIsConnecting(false);
        setConnectionStatus('error');
        return;
      }
      
      // Save TWS config to local storage
      const config: DataProviderConfig = {
        type: 'interactive-brokers',
        twsHost,
        twsPort,
        connectionMethod: 'tws',
        paperTrading: isPaperTrading
      };
      
      localStorage.setItem('ibkr-config', JSON.stringify(config));
      
      // Get data provider instance
      const ibkrProvider = getDataProvider(config);
      
      // Test connection
      const connected = await ibkrProvider.connect();
      
      if (connected) {
        toast.success("Successfully connected to TWS!");
        setConnectionStatus('connected');
        setIsConfigured(true);
      } else {
        toast.error("Failed to connect to TWS. Please check if TWS is running and API connections are enabled.");
        setConnectionStatus('error');
      }
      
      setIsConnecting(false);
      
    } catch (error) {
      console.error("Error configuring TWS connection:", error);
      toast.error("Failed to configure TWS connection. Please try again.");
      setIsConnecting(false);
      setConnectionStatus('error');
    }
  };
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleTestConnection = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      // Get saved config
      const savedConfig = localStorage.getItem('ibkr-config');
      if (!savedConfig) {
        toast.error("No IBKR configuration found. Please connect first.");
        setIsConnecting(false);
        setConnectionStatus('error');
        return;
      }
      
      const config = JSON.parse(savedConfig);
      
      // Initialize data provider
      const ibkrProvider = getDataProvider(config);
      
      // Test connection
      const connected = await ibkrProvider.connect();
      
      if (connected) {
        toast.success("Successfully connected to IBKR!");
        setConnectionStatus('connected');
      } else {
        toast.error("Failed to connect to IBKR. Please check your settings and try again.");
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error("Error testing IBKR connection:", error);
      toast.error("Connection test failed. Please try again.");
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <IBKRIntegrationView
      isConnecting={isConnecting}
      isConfigured={isConfigured}
      apiMethod={apiMethod}
      setApiMethod={setApiMethod}
      apiKey={apiKey}
      setApiKey={setApiKey}
      callbackUrl={callbackUrl}
      setCallbackUrl={setCallbackUrl}
      twsHost={twsHost}
      setTwsHost={setTwsHost}
      twsPort={twsPort}
      setTwsPort={setTwsPort}
      isPaperTrading={isPaperTrading}
      setIsPaperTrading={setIsPaperTrading}
      connectionStatus={connectionStatus}
      onBackToDashboard={handleBackToDashboard}
      onTestConnection={handleTestConnection}
      onStartAuth={handleStartAuth}
      onTwsConnect={handleTwsConnect}
    />
  );
};

export default IBKRIntegrationContainer;
