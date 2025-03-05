
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { useIBKRConnectionMonitor } from '@/hooks/ibkr/useIBKRConnectionMonitor';

interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: string;
  timestamp: Date;
}

interface ConnectionTestState {
  isRunningTests: boolean;
  testResults: ConnectionTestResult[];
  lastTestRun: Date | null;
}

export function useIBKRConnectionTest() {
  const [testState, setTestState] = useState<ConnectionTestState>({
    isRunningTests: false,
    testResults: [],
    lastTestRun: null
  });

  const {
    isConnected,
    dataSource,
    handleManualReconnect,
    getDetailedDiagnostics
  } = useIBKRConnectionMonitor();

  // Add a test result to the list
  const addTestResult = useCallback((result: Omit<ConnectionTestResult, 'timestamp'>) => {
    setTestState(prev => ({
      ...prev,
      testResults: [
        ...prev.testResults,
        {
          ...result,
          timestamp: new Date()
        }
      ]
    }));
  }, []);

  // Clear test results
  const clearTestResults = useCallback(() => {
    setTestState(prev => ({
      ...prev,
      testResults: []
    }));
  }, []);

  // Run a basic connection test
  const testBasicConnection = useCallback(async (): Promise<boolean> => {
    try {
      const provider = getDataProvider();
      
      if (!provider) {
        addTestResult({
          success: false,
          message: "Data provider not found",
          details: "The IBKR data provider could not be instantiated"
        });
        return false;
      }

      // Check if isConnected method exists and call it
      if (typeof provider.isConnected !== 'function') {
        addTestResult({
          success: false,
          message: "Invalid provider implementation",
          details: "The data provider is missing the isConnected method"
        });
        return false;
      }

      const connected = provider.isConnected();
      
      addTestResult({
        success: connected,
        message: connected ? "Successfully connected to IBKR" : "Not connected to IBKR",
        details: `Connection verified through provider.isConnected()`
      });
      
      return connected;
    } catch (error) {
      addTestResult({
        success: false,
        message: "Connection test failed with error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    }
  }, [addTestResult]);

  // Test data retrieval
  const testDataRetrieval = useCallback(async (): Promise<boolean> => {
    try {
      const provider = getDataProvider();
      
      if (!provider) {
        addTestResult({
          success: false,
          message: "Data provider not found",
          details: "The IBKR data provider could not be instantiated"
        });
        return false;
      }

      // Check if getMarketData method exists
      if (typeof provider.getMarketData !== 'function') {
        addTestResult({
          success: false,
          message: "Invalid provider implementation",
          details: "The data provider is missing the getMarketData method"
        });
        return false;
      }

      // Try to get market data
      const startTime = Date.now();
      const marketData = await provider.getMarketData();
      const endTime = Date.now();
      
      const success = !!marketData && typeof marketData === 'object';
      
      addTestResult({
        success,
        message: success ? "Successfully retrieved market data" : "Failed to retrieve market data",
        details: success 
          ? `Market data retrieved in ${endTime - startTime}ms` 
          : "Market data request returned null or invalid response"
      });
      
      return success;
    } catch (error) {
      addTestResult({
        success: false,
        message: "Data retrieval test failed with error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    }
  }, [addTestResult]);

  // Test authentication status
  const testAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      const provider = getDataProvider();
      
      if (!provider) {
        addTestResult({
          success: false,
          message: "Data provider not found",
          details: "The IBKR data provider could not be instantiated"
        });
        return false;
      }

      // Check for authentication method or property
      if (typeof provider.isAuthenticated === 'function') {
        const authenticated = provider.isAuthenticated();
        
        addTestResult({
          success: authenticated,
          message: authenticated ? "Successfully authenticated with IBKR" : "Not authenticated with IBKR",
          details: `Authentication verified through provider.isAuthenticated()`
        });
        
        return authenticated;
      }
      
      // If no direct auth method, check connection as proxy for auth
      const connected = typeof provider.isConnected === 'function' && provider.isConnected();
      
      addTestResult({
        success: connected,
        message: connected ? "Connected to IBKR (auth assumed)" : "Not connected to IBKR",
        details: `No direct authentication method found, using connection status as proxy`
      });
      
      return connected;
    } catch (error) {
      addTestResult({
        success: false,
        message: "Authentication test failed with error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    }
  }, [addTestResult]);

  // Test reconnection
  const testReconnection = useCallback(async (): Promise<boolean> => {
    try {
      addTestResult({
        success: true,
        message: "Starting reconnection test",
        details: "Attempting to reconnect to IBKR"
      });
      
      // Call the reconnect function
      await handleManualReconnect();
      
      // Check if reconnect was successful
      const provider = getDataProvider();
      
      if (!provider || typeof provider.isConnected !== 'function') {
        addTestResult({
          success: false,
          message: "Reconnection test inconclusive",
          details: "Cannot verify reconnection result due to missing provider or methods"
        });
        return false;
      }
      
      const connected = provider.isConnected();
      
      addTestResult({
        success: connected,
        message: connected ? "Reconnection successful" : "Reconnection failed",
        details: `Connection status after reconnection attempt: ${connected ? "Connected" : "Disconnected"}`
      });
      
      return connected;
    } catch (error) {
      addTestResult({
        success: false,
        message: "Reconnection test failed with error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    }
  }, [addTestResult, handleManualReconnect]);

  // Run comprehensive test suite
  const runComprehensiveTests = useCallback(async () => {
    setTestState(prev => ({
      ...prev,
      isRunningTests: true,
      lastTestRun: new Date()
    }));
    
    try {
      toast.info("Running IBKR connection tests", {
        description: "Testing connection, authentication, and data retrieval"
      });
      
      // Start with a clean slate
      clearTestResults();
      
      // Get current diagnostics
      const diagnostics = getDetailedDiagnostics();
      addTestResult({
        success: true,
        message: "Collected connection diagnostics",
        details: JSON.stringify(diagnostics, null, 2).substring(0, 500) + "..."
      });
      
      // Run test sequence
      await testBasicConnection();
      await testAuthentication();
      await testDataRetrieval();
      
      // Evaluate overall success
      const allTests = testState.testResults;
      const failedTests = allTests.filter(test => !test.success);
      
      if (failedTests.length === 0) {
        toast.success("All IBKR connection tests passed", {
          description: "Connection, authentication, and data retrieval tests successful"
        });
      } else {
        toast.error("Some IBKR connection tests failed", {
          description: `${failedTests.length} of ${allTests.length} tests failed`
        });
      }
    } catch (error) {
      toast.error("Error running tests", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      
      addTestResult({
        success: false,
        message: "Test suite execution failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setTestState(prev => ({
        ...prev,
        isRunningTests: false
      }));
    }
  }, [
    clearTestResults,
    testBasicConnection,
    testAuthentication,
    testDataRetrieval,
    addTestResult,
    getDetailedDiagnostics,
    testState.testResults
  ]);

  return {
    ...testState,
    isConnected,
    dataSource,
    runConnectionTest: testBasicConnection,
    runAuthenticationTest: testAuthentication,
    runDataRetrievalTest: testDataRetrieval,
    runReconnectionTest: testReconnection,
    runComprehensiveTests,
    clearTestResults,
    getDiagnostics: getDetailedDiagnostics
  };
}
