
import React, { useEffect } from 'react';
import IBKRIntegrationView from './IBKRIntegrationView';
import { useIBKRIntegration } from './hooks/useIBKRIntegration';
import { useIBKRHandlers } from './hooks/useIBKRHandlers';
import { useNavigate } from 'react-router-dom';
import { useIBKRRealTimeData } from '@/hooks/useIBKRRealTimeData';

const IBKRIntegrationContainer: React.FC = () => {
  const navigate = useNavigate();
  
  // Use the refactored hook
  const {
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
    setConnectionStatus
  } = useIBKRIntegration();
  
  // Real-time data integration
  const { isConnected, dataSource, refreshAllData } = useIBKRRealTimeData();
  
  // No change needed to useIBKRHandlers
  const {
    handleStartAuth,
    handleTwsConnect,
    handleBackToDashboard,
    handleTestConnection
  } = useIBKRHandlers({
    apiKey,
    callbackUrl,
    twsHost,
    twsPort,
    isPaperTrading,
    setIsConnecting,
    setConnectionStatus,
    setIsConfigured,
    navigate
  });

  // Add diagnostics on mount
  useEffect(() => {
    console.log("[IBKRIntegrationContainer] Component mounted");
    console.log("[IBKRIntegrationContainer] Initial state:", {
      isConnecting,
      apiMethod,
      apiKey: apiKey ? `${apiKey.substring(0, 3)}...` : 'not set',
      twsHost,
      twsPort,
      isPaperTrading,
      isConfigured,
      connectionStatus,
      isConnected,
      dataSource
    });
    
    // Check for configuration in localStorage
    const savedConfig = localStorage.getItem('ibkr-config');
    console.log("[IBKRIntegrationContainer] Saved config in localStorage:", savedConfig ? "Found" : "Not found");
    
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        console.log("[IBKRIntegrationContainer] Parsed config:", JSON.stringify(parsedConfig, null, 2));
      } catch (e) {
        console.error("[IBKRIntegrationContainer] Error parsing saved config:", e);
      }
    }
  }, [isConnecting, apiMethod, apiKey, twsHost, twsPort, isPaperTrading, isConfigured, connectionStatus, isConnected, dataSource]);

  // No change needed to the component render
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
      dataStatus={{ isConnected, dataSource, refreshData: refreshAllData }}
      onBackToDashboard={handleBackToDashboard}
      onTestConnection={handleTestConnection}
      onStartAuth={handleStartAuth}
      onTwsConnect={handleTwsConnect}
    />
  );
};

export default IBKRIntegrationContainer;
