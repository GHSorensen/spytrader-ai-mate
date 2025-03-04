
import React from 'react';
import IBKRIntegrationView from './IBKRIntegrationView';
import { useIBKRIntegration } from './hooks/useIBKRIntegration';
import { useIBKRHandlers } from './hooks/useIBKRHandlers';
import { useNavigate } from 'react-router-dom';
import { useIBKRRealTimeData } from '@/hooks/useIBKRRealTimeData';

const IBKRIntegrationContainer: React.FC = () => {
  const navigate = useNavigate();
  
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
      dataStatus={{ isConnected, dataSource, refreshData: refreshAllData }}
      onBackToDashboard={handleBackToDashboard}
      onTestConnection={handleTestConnection}
      onStartAuth={handleStartAuth}
      onTwsConnect={handleTwsConnect}
    />
  );
};

export default IBKRIntegrationContainer;
