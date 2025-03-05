
import React, { useEffect, useState } from 'react';
import IBKRIntegrationView from './IBKRIntegrationView';
import { useIBKRIntegration } from './hooks/useIBKRIntegration';
import { useIBKRHandlers } from './hooks/useIBKRHandlers';
import { useNavigate } from 'react-router-dom';
import { useIBKRRealTimeData } from '@/hooks/useIBKRRealTimeData';
import { useIBKRConnectionMonitor } from '@/hooks/ibkr/useIBKRConnectionMonitor';
import ConnectionMonitor from './ConnectionMonitor';
import { toast } from 'sonner';

const IBKRIntegrationContainer: React.FC = () => {
  const navigate = useNavigate();
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  
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
  const { 
    isConnected, 
    dataSource, 
    refreshAllData, 
    reconnect,
    forceConnectionCheck,
    connectionDiagnostics
  } = useIBKRRealTimeData();
  
  // Enhanced connection monitoring
  const {
    isReconnecting,
    reconnectAttempts,
    handleManualReconnect,
    getDetailedDiagnostics
  } = useIBKRConnectionMonitor({
    onStatusChange: ({ isConnected, dataSource }) => {
      // Update connection status based on monitor
      setConnectionStatus(isConnected ? 'connected' : isReconnecting ? 'connecting' : 'disconnected');
    }
  });
  
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
    
    // Run initial diagnostics
    runConnectionDiagnostics();
  }, []);

  // Run comprehensive diagnostics
  const runConnectionDiagnostics = async () => {
    try {
      setDiagnosticsRunning(true);
      console.log("[IBKRIntegrationContainer] Running comprehensive connection diagnostics");
      
      // Get detailed diagnostics from the connection monitor
      const detailedDiagnostics = getDetailedDiagnostics();
      console.log("[IBKRIntegrationContainer] Detailed diagnostics:", detailedDiagnostics);
      
      // Force a connection check
      console.log("[IBKRIntegrationContainer] Forcing connection check...");
      await forceConnectionCheck();
      
      // Test if TWS ports are likely to work
      if (apiMethod === 'tws') {
        console.log("[IBKRIntegrationContainer] TWS port configuration:", {
          host: twsHost,
          port: twsPort,
          isPaperTrading,
          correctPort: isPaperTrading ? twsPort === '7497' : twsPort === '7496'
        });
      }
      
      toast.info("Diagnostics Complete", {
        description: "Connection diagnostics have been logged to the console.",
      });
      
      setDiagnosticsRunning(false);
    } catch (error) {
      console.error("[IBKRIntegrationContainer] Error running diagnostics:", error);
      setDiagnosticsRunning(false);
    }
  };

  // Enhanced handler for test connection with full diagnostics
  const handleDiagnosticTest = async () => {
    runConnectionDiagnostics();
    await handleTestConnection();
  };

  return (
    <>
      <ConnectionMonitor 
        showDetails={false} 
        className="fixed top-4 right-4 z-50"
      />
      <IBKRIntegrationView
        isConnecting={isConnecting || diagnosticsRunning || isReconnecting}
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
        onTestConnection={handleDiagnosticTest}
        onStartAuth={handleStartAuth}
        onTwsConnect={handleTwsConnect}
        onManualReconnect={handleManualReconnect}
        reconnectAttempts={reconnectAttempts}
      />
    </>
  );
};

export default IBKRIntegrationContainer;
