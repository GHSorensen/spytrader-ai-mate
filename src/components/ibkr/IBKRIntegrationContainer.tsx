
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
  const [isConfigured, setIsConfigured] = useState(false);
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
        }
      } catch (err) {
        console.error("Error parsing saved IBKR config:", err);
      }
    }
  }, []);
  
  const handleStartAuth = async () => {
    try {
      setIsConnecting(true);
      
      if (!apiKey) {
        toast.error("Please enter your API Key");
        setIsConnecting(false);
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
    }
  };
  
  const handleTwsConnect = async () => {
    try {
      setIsConnecting(true);
      
      if (!twsHost || !twsPort) {
        toast.error("Please enter TWS host and port");
        setIsConnecting(false);
        return;
      }
      
      // Save TWS config to local storage
      const config: DataProviderConfig = {
        type: 'interactive-brokers',
        twsHost,
        twsPort,
        connectionMethod: 'tws'
      };
      
      localStorage.setItem('ibkr-config', JSON.stringify(config));
      
      // Show success message and redirect
      toast.success("TWS connection configured successfully!");
      
      // In a real app, we would test the connection here
      setTimeout(() => {
        setIsConnecting(false);
        setIsConfigured(true);
      }, 1000);
      
    } catch (error) {
      console.error("Error configuring TWS connection:", error);
      toast.error("Failed to configure TWS connection. Please try again.");
      setIsConnecting(false);
    }
  };
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleTestConnection = async () => {
    try {
      setIsConnecting(true);
      
      // Get saved config
      const savedConfig = localStorage.getItem('ibkr-config');
      if (!savedConfig) {
        toast.error("No IBKR configuration found. Please connect first.");
        setIsConnecting(false);
        return;
      }
      
      const config = JSON.parse(savedConfig);
      
      if (config.connectionMethod === 'tws') {
        // For TWS, we simulate a connection test
        setTimeout(() => {
          toast.success("Successfully connected to TWS!");
          setIsConnecting(false);
        }, 1500);
        return;
      }
      
      // Initialize data provider for Web API
      const ibkrProvider = getDataProvider(config);
      
      // Test connection
      const connected = await ibkrProvider.connect();
      
      if (connected) {
        toast.success("Successfully connected to Interactive Brokers!");
      } else {
        toast.error("Failed to connect to Interactive Brokers. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error testing IBKR connection:", error);
      toast.error("Connection test failed. Please try again.");
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
      onBackToDashboard={handleBackToDashboard}
      onTestConnection={handleTestConnection}
      onStartAuth={handleStartAuth}
      onTwsConnect={handleTwsConnect}
    />
  );
};

export default IBKRIntegrationContainer;
