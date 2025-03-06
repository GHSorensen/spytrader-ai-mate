
import { useState, useCallback } from 'react';
import { TestType, ConnectionTestResult, UseIBKRConnectionTestReturn } from '../connection-status/types';
import { getProviderWithDiagnostics } from '../connection-status/utils';
import { useIBKRConnectionStatus } from '../connection-status/useIBKRConnectionStatus';

/**
 * Hook for testing IBKR connection functionality
 */
export function useIBKRConnectionTest(): UseIBKRConnectionTestReturn {
  const [testResults, setTestResults] = useState<ConnectionTestResult[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  
  // Get the base connection status from the connection status hook
  const { isConnected, dataSource } = useIBKRConnectionStatus();

  // Test basic connection
  const testConnection = useCallback(async (): Promise<ConnectionTestResult> => {
    setIsTestRunning(true);
    const startTime = Date.now();
    
    const result: ConnectionTestResult = {
      testType: TestType.CONNECTION,
      status: 'running',
      message: 'Testing connection...',
      timestamp: new Date(),
      error: null
    };
    
    try {
      const provider = getProviderWithDiagnostics();
      if (!provider) {
        throw new Error('No data provider available');
      }
      
      // Check if provider has isConnected method
      if (typeof provider.isConnected !== 'function') {
        throw new Error('Provider missing isConnected method');
      }
      
      const connected = await provider.isConnected();
      
      if (!connected) {
        throw new Error('Not connected to IBKR');
      }
      
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      
      const successResult: ConnectionTestResult = {
        ...result,
        status: 'success',
        message: `Connection successful in ${durationMs}ms`,
        durationMs,
        timestamp: new Date()
      };
      
      setTestResults(prev => [successResult, ...prev]);
      setIsTestRunning(false);
      return successResult;
    } catch (error) {
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      
      const errorResult: ConnectionTestResult = {
        ...result,
        status: 'failure',
        message: error instanceof Error ? error.message : 'Connection test failed',
        error: error instanceof Error ? error : new Error('Unknown error'),
        durationMs,
        timestamp: new Date()
      };
      
      setTestResults(prev => [errorResult, ...prev]);
      setIsTestRunning(false);
      return errorResult;
    }
  }, []);

  // Test authentication
  const testAuthentication = useCallback(async (): Promise<ConnectionTestResult> => {
    setIsTestRunning(true);
    const startTime = Date.now();
    
    const result: ConnectionTestResult = {
      testType: TestType.AUTHENTICATION,
      status: 'running',
      message: 'Testing authentication...',
      timestamp: new Date(),
      error: null
    };
    
    try {
      // Simulated auth test for now
      const authSuccessful = localStorage.getItem('ibkr-config') !== null;
      
      if (!authSuccessful) {
        throw new Error('No IBKR configuration found');
      }
      
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      
      const successResult: ConnectionTestResult = {
        ...result,
        status: 'success',
        message: `Authentication successful in ${durationMs}ms`,
        durationMs,
        timestamp: new Date()
      };
      
      setTestResults(prev => [successResult, ...prev]);
      setIsTestRunning(false);
      return successResult;
    } catch (error) {
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      
      const errorResult: ConnectionTestResult = {
        ...result,
        status: 'failure',
        message: error instanceof Error ? error.message : 'Authentication test failed',
        error: error instanceof Error ? error : new Error('Unknown error'),
        durationMs,
        timestamp: new Date()
      };
      
      setTestResults(prev => [errorResult, ...prev]);
      setIsTestRunning(false);
      return errorResult;
    }
  }, []);

  // Test market data
  const testMarketData = useCallback(async (): Promise<ConnectionTestResult> => {
    setIsTestRunning(true);
    const startTime = Date.now();
    
    const result: ConnectionTestResult = {
      testType: TestType.MARKET_DATA,
      status: 'running',
      message: 'Testing market data retrieval...',
      timestamp: new Date(),
      error: null
    };
    
    try {
      const provider = getProviderWithDiagnostics();
      if (!provider) {
        throw new Error('No data provider available');
      }
      
      // Check if provider has getQuote method
      if (typeof (provider as any).getQuote !== 'function') {
        throw new Error('Provider missing getQuote method');
      }
      
      // Attempt to get a test quote
      const testSymbol = 'SPY';
      const quoteData = await (provider as any).getQuote(testSymbol);
      
      if (!quoteData) {
        throw new Error(`Failed to get quote data for ${testSymbol}`);
      }
      
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      
      const successResult: ConnectionTestResult = {
        ...result,
        status: 'success',
        message: `Market data retrieval successful in ${durationMs}ms`,
        durationMs,
        details: { quoteData },
        timestamp: new Date()
      };
      
      setTestResults(prev => [successResult, ...prev]);
      setIsTestRunning(false);
      return successResult;
    } catch (error) {
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      
      const errorResult: ConnectionTestResult = {
        ...result,
        status: 'failure',
        message: error instanceof Error ? error.message : 'Market data test failed',
        error: error instanceof Error ? error : new Error('Unknown error'),
        durationMs,
        timestamp: new Date()
      };
      
      setTestResults(prev => [errorResult, ...prev]);
      setIsTestRunning(false);
      return errorResult;
    }
  }, []);

  // Test reconnection
  const testReconnect = useCallback(async (): Promise<ConnectionTestResult> => {
    setIsTestRunning(true);
    const startTime = Date.now();
    
    const result: ConnectionTestResult = {
      testType: TestType.RECONNECT,
      status: 'running',
      message: 'Testing reconnection capability...',
      timestamp: new Date(),
      error: null
    };
    
    try {
      const provider = getProviderWithDiagnostics();
      if (!provider) {
        throw new Error('No data provider available');
      }
      
      // Check if provider has connect method
      if (typeof provider.connect !== 'function') {
        throw new Error('Provider missing connect method');
      }
      
      // Attempt to reconnect
      const reconnectSuccessful = await provider.connect();
      
      if (!reconnectSuccessful) {
        throw new Error('Reconnection failed');
      }
      
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      
      const successResult: ConnectionTestResult = {
        ...result,
        status: 'success',
        message: `Reconnection successful in ${durationMs}ms`,
        durationMs,
        timestamp: new Date()
      };
      
      setTestResults(prev => [successResult, ...prev]);
      setIsTestRunning(false);
      return successResult;
    } catch (error) {
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      
      const errorResult: ConnectionTestResult = {
        ...result,
        status: 'failure',
        message: error instanceof Error ? error.message : 'Reconnection test failed',
        error: error instanceof Error ? error : new Error('Unknown error'),
        durationMs,
        timestamp: new Date()
      };
      
      setTestResults(prev => [errorResult, ...prev]);
      setIsTestRunning(false);
      return errorResult;
    }
  }, []);

  // Run all tests
  const runComprehensiveTest = useCallback(async (): Promise<ConnectionTestResult[]> => {
    setIsTestRunning(true);
    
    const connectionResult = await testConnection();
    
    // Only continue if connection test passed
    if (connectionResult.status === 'success') {
      const authResult = await testAuthentication();
      const dataResult = await testMarketData();
      const reconnectResult = await testReconnect();
      
      setIsTestRunning(false);
      return [connectionResult, authResult, dataResult, reconnectResult];
    }
    
    // If connection failed, don't run other tests
    setIsTestRunning(false);
    return [connectionResult];
  }, [testConnection, testAuthentication, testMarketData, testReconnect]);

  // Get diagnostics
  const getDiagnostics = useCallback(() => {
    const provider = getProviderWithDiagnostics();
    return {
      provider: provider?.constructor.name || 'Unknown',
      hasProvider: !!provider,
      testResults: testResults.length,
      lastTestTimestamp: testResults[0]?.timestamp || null,
      lastTestStatus: testResults[0]?.status || 'not-run',
      configPresent: !!localStorage.getItem('ibkr-config')
    };
  }, [testResults]);

  // Clear test results
  const clearTestResults = useCallback(() => {
    setTestResults([]);
  }, []);

  return {
    isConnected,
    dataSource,
    testConnection,
    testAuthentication,
    testMarketData,
    testReconnect,
    runComprehensiveTest,
    isTestRunning,
    testResults,
    getDiagnostics,
    clearTestResults
  };
}
