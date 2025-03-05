
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { useIBKRConnectionMonitor } from '@/hooks/ibkr/useIBKRConnectionMonitor';
import { DataProviderInterface } from '@/lib/types/spy/dataProvider';

// Export the types needed by the component
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: string;
  latency?: number;
  provider?: string;
  error?: string;
  timestamp: Date;
}

export type TestType = 'connection' | 'authentication' | 'market-data' | 'reconnect';

interface ConnectionTestState {
  isRunningTests: boolean;
  testResults: {
    connection: ConnectionTestResult[];
    authentication: ConnectionTestResult[];
    'market-data': ConnectionTestResult[];
    reconnect: ConnectionTestResult[];
  };
  lastTestRun: Date | null;
}

export function useIBKRConnectionTest() {
  const [testState, setTestState] = useState<ConnectionTestState>({
    isRunningTests: false,
    testResults: {
      connection: [],
      authentication: [],
      'market-data': [],
      reconnect: []
    },
    lastTestRun: null
  });

  // Track individual test running states
  const [isTestRunning, setIsTestRunning] = useState({
    connection: false,
    authentication: false,
    'market-data': false,
    reconnect: false,
    comprehensive: false
  });

  const {
    isConnected,
    dataSource,
    handleManualReconnect,
    getDetailedDiagnostics
  } = useIBKRConnectionMonitor();

  // Add a test result to the list
  const addTestResult = useCallback((testType: TestType, result: Omit<ConnectionTestResult, 'timestamp'>) => {
    setTestState(prev => ({
      ...prev,
      testResults: {
        ...prev.testResults,
        [testType]: [
          ...prev.testResults[testType],
          {
            ...result,
            timestamp: new Date()
          }
        ]
      }
    }));
  }, []);

  // Clear test results
  const clearTestResults = useCallback(() => {
    setTestState(prev => ({
      ...prev,
      testResults: {
        connection: [],
        authentication: [],
        'market-data': [],
        reconnect: []
      }
    }));
  }, []);

  // Run a basic connection test
  const testConnection = useCallback(async (): Promise<boolean> => {
    setIsTestRunning(prev => ({ ...prev, connection: true }));
    try {
      const provider = getDataProvider();
      
      if (!provider) {
        addTestResult('connection', {
          success: false,
          message: "Data provider not found",
          details: "The IBKR data provider could not be instantiated",
          latency: 0,
          provider: 'N/A'
        });
        return false;
      }

      // Check if isConnected method exists and call it
      if (typeof provider.isConnected !== 'function') {
        addTestResult('connection', {
          success: false,
          message: "Invalid provider implementation",
          details: "The data provider is missing the isConnected method",
          latency: 0,
          provider: provider.constructor.name
        });
        return false;
      }

      const startTime = Date.now();
      const connected = provider.isConnected();
      const endTime = Date.now();
      
      addTestResult('connection', {
        success: connected,
        message: connected ? "Successfully connected to IBKR" : "Not connected to IBKR",
        details: `Connection verified through provider.isConnected()`,
        latency: endTime - startTime,
        provider: provider.constructor.name
      });
      
      return connected;
    } catch (error) {
      addTestResult('connection', {
        success: false,
        message: "Connection test failed with error",
        details: error instanceof Error ? error.message : "Unknown error",
        latency: 0,
        provider: 'N/A',
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    } finally {
      setIsTestRunning(prev => ({ ...prev, connection: false }));
    }
  }, [addTestResult]);

  // Test authentication status
  const testAuthentication = useCallback(async (): Promise<boolean> => {
    setIsTestRunning(prev => ({ ...prev, authentication: true }));
    try {
      const provider = getDataProvider();
      
      if (!provider) {
        addTestResult('authentication', {
          success: false,
          message: "Data provider not found",
          details: "The IBKR data provider could not be instantiated",
          latency: 0,
          provider: 'N/A'
        });
        return false;
      }

      // Check for connection as proxy for auth since isAuthenticated isn't in the interface
      const startTime = Date.now();
      const connected = typeof provider.isConnected === 'function' && provider.isConnected();
      const endTime = Date.now();
      
      addTestResult('authentication', {
        success: connected,
        message: connected ? "Connected to IBKR (auth assumed)" : "Not connected to IBKR",
        details: `Using connection status as proxy for authentication`,
        latency: endTime - startTime,
        provider: provider.constructor.name
      });
      
      return connected;
    } catch (error) {
      addTestResult('authentication', {
        success: false,
        message: "Authentication test failed with error",
        details: error instanceof Error ? error.message : "Unknown error",
        latency: 0,
        provider: 'N/A',
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    } finally {
      setIsTestRunning(prev => ({ ...prev, authentication: false }));
    }
  }, [addTestResult]);

  // Test data retrieval
  const testMarketData = useCallback(async (): Promise<boolean> => {
    setIsTestRunning(prev => ({ ...prev, 'market-data': true }));
    try {
      const provider = getDataProvider();
      
      if (!provider) {
        addTestResult('market-data', {
          success: false,
          message: "Data provider not found",
          details: "The IBKR data provider could not be instantiated",
          latency: 0,
          provider: 'N/A'
        });
        return false;
      }

      // Check if getMarketData method exists
      if (typeof provider.getMarketData !== 'function') {
        addTestResult('market-data', {
          success: false,
          message: "Invalid provider implementation",
          details: "The data provider is missing the getMarketData method",
          latency: 0,
          provider: provider.constructor.name
        });
        return false;
      }

      // Try to get market data
      const startTime = Date.now();
      const marketData = await provider.getMarketData();
      const endTime = Date.now();
      
      const success = !!marketData && typeof marketData === 'object';
      
      addTestResult('market-data', {
        success,
        message: success ? "Successfully retrieved market data" : "Failed to retrieve market data",
        details: success 
          ? `Market data retrieved in ${endTime - startTime}ms` 
          : "Market data request returned null or invalid response",
        latency: endTime - startTime,
        provider: provider.constructor.name
      });
      
      return success;
    } catch (error) {
      addTestResult('market-data', {
        success: false,
        message: "Data retrieval test failed with error",
        details: error instanceof Error ? error.message : "Unknown error",
        latency: 0,
        provider: 'N/A',
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    } finally {
      setIsTestRunning(prev => ({ ...prev, 'market-data': false }));
    }
  }, [addTestResult]);

  // Test reconnection
  const testReconnect = useCallback(async (): Promise<boolean> => {
    setIsTestRunning(prev => ({ ...prev, reconnect: true }));
    try {
      addTestResult('reconnect', {
        success: true,
        message: "Starting reconnection test",
        details: "Attempting to reconnect to IBKR",
        latency: 0,
        provider: 'IBKR'
      });
      
      // Call the reconnect function
      const startTime = Date.now();
      await handleManualReconnect();
      const endTime = Date.now();
      
      // Check if reconnect was successful
      const provider = getDataProvider();
      
      if (!provider || typeof provider.isConnected !== 'function') {
        addTestResult('reconnect', {
          success: false,
          message: "Reconnection test inconclusive",
          details: "Cannot verify reconnection result due to missing provider or methods",
          latency: endTime - startTime,
          provider: provider ? provider.constructor.name : 'N/A'
        });
        return false;
      }
      
      const connected = provider.isConnected();
      
      addTestResult('reconnect', {
        success: connected,
        message: connected ? "Reconnection successful" : "Reconnection failed",
        details: `Connection status after reconnection attempt: ${connected ? "Connected" : "Disconnected"}`,
        latency: endTime - startTime,
        provider: provider.constructor.name
      });
      
      return connected;
    } catch (error) {
      addTestResult('reconnect', {
        success: false,
        message: "Reconnection test failed with error",
        details: error instanceof Error ? error.message : "Unknown error",
        latency: 0,
        provider: 'N/A',
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    } finally {
      setIsTestRunning(prev => ({ ...prev, reconnect: false }));
    }
  }, [addTestResult, handleManualReconnect]);

  // Run comprehensive test suite
  const runComprehensiveTest = useCallback(async () => {
    setIsTestRunning(prev => ({ ...prev, comprehensive: true }));
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
      addTestResult('connection', {
        success: true,
        message: "Collected connection diagnostics",
        details: JSON.stringify(diagnostics, null, 2).substring(0, 500) + "...",
        latency: 0,
        provider: 'N/A'
      });
      
      // Run test sequence
      await testConnection();
      await testAuthentication();
      await testMarketData();
      
      // Evaluate overall success
      const allTests = [
        ...testState.testResults.connection,
        ...testState.testResults.authentication,
        ...testState.testResults['market-data']
      ];
      const failedTests = allTests.filter(test => !test.success);
      
      if (allTests.length > 0 && failedTests.length === 0) {
        toast.success("All IBKR connection tests passed", {
          description: "Connection, authentication, and data retrieval tests successful"
        });
      } else if (allTests.length > 0) {
        toast.error("Some IBKR connection tests failed", {
          description: `${failedTests.length} of ${allTests.length} tests failed`
        });
      }
    } catch (error) {
      toast.error("Error running tests", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      
      addTestResult('connection', {
        success: false,
        message: "Test suite execution failed",
        details: error instanceof Error ? error.message : "Unknown error",
        latency: 0,
        provider: 'N/A',
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setTestState(prev => ({
        ...prev,
        isRunningTests: false
      }));
      setIsTestRunning(prev => ({ ...prev, comprehensive: false }));
    }
  }, [
    clearTestResults,
    testConnection,
    testAuthentication,
    testMarketData,
    addTestResult,
    getDetailedDiagnostics,
    testState.testResults
  ]);

  return {
    ...testState,
    isConnected,
    dataSource,
    testConnection,
    testAuthentication,
    testMarketData,
    testReconnect,
    runComprehensiveTest,
    isTestRunning,
    clearTestResults,
    getDiagnostics: getDetailedDiagnostics
  };
}
