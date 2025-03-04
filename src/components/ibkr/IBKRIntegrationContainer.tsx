
import React, { useEffect, useState } from 'react';
import IBKRIntegrationView from './IBKRIntegrationView';
import { useIBKRIntegration } from './hooks/useIBKRIntegration';
import { useIBKRHandlers } from './hooks/useIBKRHandlers';
import { useNavigate } from 'react-router-dom';
import { useIBKRRealTimeData } from '@/hooks/useIBKRRealTimeData';
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
    
    // Run initial diagnostics
    runConnectionDiagnostics();
  }, [isConnecting, apiMethod, apiKey, twsHost, twsPort, isPaperTrading, isConfigured, connectionStatus, isConnected, dataSource]);

  // Run comprehensive diagnostics
  const runConnectionDiagnostics = async () => {
    try {
      setDiagnosticsRunning(true);
      console.log("[IBKRIntegrationContainer] Running comprehensive connection diagnostics");
      
      // Check browser capabilities
      console.log("[IBKRIntegrationContainer] Browser capabilities:", {
        userAgent: navigator.userAgent,
        language: navigator.language,
        online: navigator.onLine,
        platform: navigator.platform,
        serviceWorker: 'serviceWorker' in navigator,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        localStorage: typeof localStorage !== 'undefined'
      });
      
      // Check localStorage access
      try {
        localStorage.setItem('ibkr-test', 'test');
        localStorage.removeItem('ibkr-test');
        console.log("[IBKRIntegrationContainer] localStorage: Working correctly");
      } catch (e) {
        console.error("[IBKRIntegrationContainer] localStorage error:", e);
      }
      
      // Check if we're running in a secure context
      console.log("[IBKRIntegrationContainer] Secure context:", window.isSecureContext);
      
      // Run a connection check
      console.log("[IBKRIntegrationContainer] Forcing connection check...");
      forceConnectionCheck();
      
      // Test if TWS ports are likely to work
      if (apiMethod === 'tws') {
        console.log("[IBKRIntegrationContainer] TWS port configuration:", {
          host: twsHost,
          port: twsPort,
          isPaperTrading,
          correctPort: isPaperTrading ? twsPort === '7497' : twsPort === '7496'
        });
      }
      
      // Log saved connection details if available
      try {
        const savedToken = localStorage.getItem('ibkr-token');
        console.log("[IBKRIntegrationContainer] Saved token exists:", !!savedToken);
        
        if (savedToken) {
          const tokenData = JSON.parse(savedToken);
          console.log("[IBKRIntegrationContainer] Token expiry:", tokenData.expires ? new Date(tokenData.expires).toISOString() : 'unknown');
          console.log("[IBKRIntegrationContainer] Token expired:", tokenData.expires ? new Date(tokenData.expires) < new Date() : 'unknown');
        }
      } catch (e) {
        console.error("[IBKRIntegrationContainer] Error checking saved token:", e);
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

  // No change needed to the component render
  return (
    <IBKRIntegrationView
      isConnecting={isConnecting || diagnosticsRunning}
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
    />
  );
};

export default IBKRIntegrationContainer;
