
import React from 'react';
import IBKRIntegrationView from './IBKRIntegrationView';
import { useIBKRIntegration } from './hooks/useIBKRIntegration';
import { useIBKRHandlers } from './hooks/useIBKRHandlers';

const IBKRIntegrationContainer: React.FC = () => {
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
    setConnectionStatus,
    navigate
  } = useIBKRIntegration();
  
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
