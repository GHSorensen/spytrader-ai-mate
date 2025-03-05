
import { useState, useCallback, useEffect } from 'react';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { toast } from 'sonner';
import { useIBKRConnectionMonitor } from '@/hooks/ibkr/connection-status/useIBKRConnectionMonitor';

export interface ConnectionTestResult {
  success: boolean;
  latency?: number;
  timestamp: Date;
  error?: string;
  provider?: string;
  details?: Record<string, any>;
}

export type TestType = 'connection' | 'authentication' | 'market-data' | 'reconnect';

/**
 * Hook for testing IBKR connections and providing detailed diagnostics
 */
export const useIBKRConnectionTest = () => {
  const [testResults, setTestResults] = useState<Record<TestType, ConnectionTestResult[]>>({
    'connection': [],
    'authentication': [],
    'market-data': [],
    'reconnect': []
  });
  const [isTestRunning, setIsTestRunning] = useState<Record<TestType, boolean>>({
    'connection': false,
    'authentication': false,
    'market-data': false,
    'reconnect': false
  });

  // Use the connection monitor for status info
  const { 
    isConnected, 
    dataSource, 
    handleManualReconnect,
    getDetailedDiagnostics 
  } = useIBKRConnectionMonitor();

  /**
   * Run a test with timing and error handling
   */
  const runTest = useCallback(async <T>(
    testType: TestType, 
    testFn: () => Promise<T>,
    successCheck: (result: T) => boolean = () => true,
    getDetails: (result: T) => Record<string, any> = () => ({})
  ): Promise<ConnectionTestResult> => {
    setIsTestRunning(prev => ({ ...prev, [testType]: true }));
    
    const startTime = performance.now();
    const timestamp = new Date();
    const provider = getDataProvider();
    const providerName = provider?.constructor?.name || 'Unknown';
    
    try {
      const result = await testFn();
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      const success = successCheck(result);
      const details = getDetails(result);
      
      const testResult: ConnectionTestResult = {
        success,
        latency,
        timestamp,
        provider: providerName,
        details
      };
      
      setTestResults(prev => ({
        ...prev,
        [testType]: [...(prev[testType] || []), testResult]
      }));
      
      return testResult;
    } catch (error) {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      const testResult: ConnectionTestResult = {
        success: false,
        latency,
        timestamp,
        provider: providerName,
        error: error instanceof Error ? error.message : String(error)
      };
      
      setTestResults(prev => ({
        ...prev,
        [testType]: [...(prev[testType] || []), testResult]
      }));
      
      return testResult;
    } finally {
      setIsTestRunning(prev => ({ ...prev, [testType]: false }));
    }
  }, []);

  /**
   * Test simple connection status
   */
  const testConnection = useCallback(async () => {
    return runTest(
      'connection',
      async () => {
        const provider = getDataProvider();
        
        if (!provider) {
          throw new Error('No data provider available');
        }
        
        if (typeof provider.isConnected !== 'function') {
          throw new Error('Provider has no isConnected method');
        }
        
        return provider.isConnected();
      },
      (result) => !!result,
      (result) => ({ isConnected: result })
    );
  }, [runTest]);

  /**
   * Test provider authentication
   */
  const testAuthentication = useCallback(async () => {
    return runTest(
      'authentication',
      async () => {
        const provider = getDataProvider();
        
        if (!provider) {
          throw new Error('No data provider available');
        }
        
        // Check if authentication methods exist
        const hasAuth = typeof (provider as any).isAuthenticated === 'function';
        
        if (!hasAuth) {
          // Try to infer from status
          const connected = typeof provider.isConnected === 'function' 
            ? provider.isConnected()
            : false;
            
          return { authenticated: connected, method: 'inferred' };
        }
        
        // Use direct authentication check
        const authenticated = await (provider as any).isAuthenticated();
        return { authenticated, method: 'direct' };
      },
      (result) => result.authenticated,
      (result) => result
    );
  }, [runTest]);

  /**
   * Test market data retrieval
   */
  const testMarketData = useCallback(async () => {
    return runTest(
      'market-data',
      async () => {
        const provider = getDataProvider();
        
        if (!provider) {
          throw new Error('No data provider available');
        }
        
        if (typeof provider.getMarketData !== 'function') {
          throw new Error('Provider has no getMarketData method');
        }
        
        return provider.getMarketData();
      },
      (result) => !!result && typeof result === 'object',
      (result) => ({ dataReceived: !!result, dataFields: Object.keys(result || {}) })
    );
  }, [runTest]);

  /**
   * Test reconnection capability
   */
  const testReconnect = useCallback(async () => {
    return runTest(
      'reconnect',
      async () => {
        // Try manual reconnection
        const reconnectResult = await handleManualReconnect();
        
        // Wait a moment for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the latest connection state
        const provider = getDataProvider();
        const isNowConnected = provider && typeof provider.isConnected === 'function'
          ? provider.isConnected()
          : false;
          
        return {
          reconnectExecuted: true,
          reconnectSucceeded: !!reconnectResult,
          currentlyConnected: isNowConnected
        };
      },
      (result) => result.currentlyConnected,
      (result) => result
    );
  }, [runTest, handleManualReconnect]);

  /**
   * Run a comprehensive test suite
   */
  const runComprehensiveTest = useCallback(async () => {
    toast.info("Running comprehensive IBKR connection tests...");
    
    const results = {
      connection: await testConnection(),
      authentication: await testAuthentication(),
      marketData: await testMarketData()
    };
    
    const allSuccessful = Object.values(results).every(r => r.success);
    
    if (allSuccessful) {
      toast.success("All IBKR connection tests passed");
    } else {
      toast.error("Some IBKR connection tests failed", {
        description: "Check the test results for details"
      });
    }
    
    return results;
  }, [testConnection, testAuthentication, testMarketData]);

  /**
   * Get full diagnostic information
   */
  const getDiagnostics = useCallback(() => {
    const provider = getDataProvider();
    
    return {
      monitoringDiagnostics: getDetailedDiagnostics(),
      testResults,
      provider: {
        type: provider?.constructor.name,
        methods: provider ? Object.getOwnPropertyNames(
          Object.getPrototypeOf(provider)
        ).filter(m => m !== 'constructor') : [],
        connectionMethod: (provider as any)?.config?.connectionMethod,
        paperTrading: (provider as any)?.config?.paperTrading
      },
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString()
      }
    };
  }, [testResults, getDetailedDiagnostics]);

  return {
    // Test functions
    testConnection,
    testAuthentication,
    testMarketData,
    testReconnect,
    runComprehensiveTest,
    
    // Test state
    testResults,
    isTestRunning,
    
    // Connection state
    isConnected,
    dataSource,
    
    // Utilities
    getDiagnostics,
    clearTestResults: () => setTestResults({
      'connection': [],
      'authentication': [],
      'market-data': [],
      'reconnect': []
    })
  };
};
