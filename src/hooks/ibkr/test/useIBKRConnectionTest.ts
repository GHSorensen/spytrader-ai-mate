
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { DataProviderInterface } from '@/lib/types/spy/dataProvider';
import { handleIBKRError } from '@/services/dataProviders/interactiveBrokers/utils/errorHandler';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';

// Test types for different connection tests
export enum TestType {
  CONNECTION = 'connection',
  AUTHENTICATION = 'authentication',
  MARKET_DATA = 'market_data',
  OPTIONS_DATA = 'options_data',
  RECONNECT = 'reconnect',
  COMPREHENSIVE = 'comprehensive'
}

// Interface for test results
export interface ConnectionTestResult {
  type: TestType;
  success: boolean;
  message: string;
  timestamp: Date;
  duration: number; // in ms
  error?: ClassifiedError | Error;
  details?: any;
  provider?: string;
  latency?: number;
}

interface UseIBKRConnectionTestReturn {
  isConnected: boolean;
  dataSource: 'live' | 'delayed' | 'mock';
  
  // Individual tests
  runConnectionTest: () => Promise<boolean>;
  runAuthenticationTest: () => Promise<boolean>;
  runDataRetrievalTest: () => Promise<boolean>;
  runOptionsTest: () => Promise<boolean>;
  runReconnectionTest: () => Promise<boolean>;
  runAllTests: () => Promise<boolean>;
  
  // Test results
  testResults: ConnectionTestResult[];
  clearTestResults: () => void;
  
  // Test status
  isRunningTests: boolean;
  lastTestRun: Date | null;
  currentTest: TestType | null;
}

/**
 * Hook for testing IBKR connections and data retrieval
 */
export function useIBKRConnectionTest(): UseIBKRConnectionTestReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'delayed' | 'mock'>('mock');
  const [testResults, setTestResults] = useState<ConnectionTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [lastTestRun, setLastTestRun] = useState<Date | null>(null);
  const [currentTest, setCurrentTest] = useState<TestType | null>(null);
  
  // Check initial connection on mount
  useEffect(() => {
    const checkInitialConnection = async () => {
      const provider = getDataProvider();
      if (provider && typeof provider.isConnected === 'function') {
        const connected = provider.isConnected();
        setIsConnected(connected);
        
        // Determine data source (if available)
        const quotesDelayed = (provider as any).status?.quotesDelayed;
        if (connected) {
          setDataSource(quotesDelayed ? 'delayed' : 'live');
        } else {
          setDataSource('mock');
        }
      }
    };
    
    checkInitialConnection();
  }, []);
  
  // Helper to record test results
  const recordTestResult = useCallback((
    type: TestType,
    success: boolean,
    message: string,
    startTime: number,
    error?: Error | ClassifiedError,
    details?: any
  ) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const provider = getDataProvider()?.constructor.name || 'Unknown';
    
    const result: ConnectionTestResult = {
      type,
      success,
      message,
      timestamp: new Date(),
      duration,
      provider,
      latency: duration,
      details
    };
    
    if (error) {
      result.error = error;
    }
    
    setTestResults(prev => [result, ...prev]);
    setLastTestRun(new Date());
    
    return result;
  }, []);
  
  // Test basic connection
  const runConnectionTest = useCallback(async (): Promise<boolean> => {
    setCurrentTest(TestType.CONNECTION);
    setIsRunningTests(true);
    const startTime = Date.now();
    
    try {
      console.log("[useIBKRConnectionTest] Running connection test");
      const provider = getDataProvider();
      
      if (!provider) {
        recordTestResult(
          TestType.CONNECTION,
          false,
          "No data provider available",
          startTime
        );
        setCurrentTest(null);
        setIsRunningTests(false);
        return false;
      }
      
      // Check if provider has the required isConnected method
      if (typeof provider.isConnected !== 'function') {
        recordTestResult(
          TestType.CONNECTION,
          false,
          "Provider missing isConnected method",
          startTime
        );
        setCurrentTest(null);
        setIsRunningTests(false);
        return false;
      }
      
      // Test connection
      console.log("[useIBKRConnectionTest] Checking isConnected()");
      const connected = provider.isConnected();
      setIsConnected(connected);
      
      // Determine data source
      const quotesDelayed = (provider as any).status?.quotesDelayed;
      if (connected) {
        setDataSource(quotesDelayed ? 'delayed' : 'live');
      } else {
        setDataSource('mock');
      }
      
      // Record result
      recordTestResult(
        TestType.CONNECTION, 
        connected,
        connected ? "Successfully connected to IBKR" : "Not connected to IBKR",
        startTime,
        undefined,
        {
          provider: provider.constructor.name,
          quotesDelayed,
          dataSource: connected ? (quotesDelayed ? 'delayed' : 'live') : 'mock',
          status: (provider as any).status || {}
        }
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return connected;
    } catch (error) {
      console.error("[useIBKRConnectionTest] Connection test error:", error);
      
      // Classify and handle error
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRConnectionTest',
        method: 'runConnectionTest'
      });
      
      recordTestResult(
        TestType.CONNECTION,
        false,
        classifiedError.message,
        startTime,
        classifiedError
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return false;
    }
  }, [recordTestResult]);
  
  // Test authentication
  const runAuthenticationTest = useCallback(async (): Promise<boolean> => {
    setCurrentTest(TestType.AUTHENTICATION);
    setIsRunningTests(true);
    const startTime = Date.now();
    
    try {
      console.log("[useIBKRConnectionTest] Running authentication test");
      const provider = getDataProvider();
      
      if (!provider) {
        recordTestResult(
          TestType.AUTHENTICATION,
          false,
          "No data provider available",
          startTime
        );
        setCurrentTest(null);
        setIsRunningTests(false);
        return false;
      }
      
      // First check if we're connected
      const connected = provider.isConnected();
      if (!connected) {
        recordTestResult(
          TestType.AUTHENTICATION,
          false,
          "Not connected to IBKR, can't test authentication",
          startTime
        );
        setCurrentTest(null);
        setIsRunningTests(false);
        return false;
      }
      
      // For providers that have authentication status
      // Note: Not all providers have this method, so we need to handle both cases
      let isAuth = true;
      if (typeof (provider as any).getAuthStatus === 'function') {
        isAuth = await (provider as any).getAuthStatus();
      }
      
      recordTestResult(
        TestType.AUTHENTICATION,
        isAuth,
        isAuth ? "Successfully authenticated with IBKR" : "Not authenticated with IBKR",
        startTime,
        undefined,
        {
          provider: provider.constructor.name,
          accessToken: (provider as any).accessToken ? "Present" : "Missing",
          tokenExpiry: (provider as any).tokenExpiry
        }
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return isAuth;
    } catch (error) {
      console.error("[useIBKRConnectionTest] Authentication test error:", error);
      
      // Classify and handle error
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRConnectionTest',
        method: 'runAuthenticationTest'
      });
      
      recordTestResult(
        TestType.AUTHENTICATION,
        false,
        classifiedError.message,
        startTime,
        classifiedError
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return false;
    }
  }, [recordTestResult]);
  
  // Test market data retrieval
  const runDataRetrievalTest = useCallback(async (): Promise<boolean> => {
    setCurrentTest(TestType.MARKET_DATA);
    setIsRunningTests(true);
    const startTime = Date.now();
    
    try {
      console.log("[useIBKRConnectionTest] Running market data test");
      const provider = getDataProvider();
      
      if (!provider) {
        recordTestResult(
          TestType.MARKET_DATA,
          false,
          "No data provider available",
          startTime
        );
        setCurrentTest(null);
        setIsRunningTests(false);
        return false;
      }
      
      // Test getting market data
      if (typeof provider.getMarketData !== 'function') {
        recordTestResult(
          TestType.MARKET_DATA,
          false,
          "Provider missing getMarketData method",
          startTime
        );
        setCurrentTest(null);
        setIsRunningTests(false);
        return false;
      }
      
      // Get actual market data
      console.log("[useIBKRConnectionTest] Calling getMarketData()");
      const marketData = await provider.getMarketData();
      
      const success = !!marketData && typeof marketData === 'object';
      
      recordTestResult(
        TestType.MARKET_DATA,
        success,
        success ? "Successfully retrieved market data" : "Failed to get valid market data",
        startTime,
        undefined,
        { marketData }
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return success;
    } catch (error) {
      console.error("[useIBKRConnectionTest] Market data test error:", error);
      
      // Classify and handle error
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRConnectionTest',
        method: 'runDataRetrievalTest'
      });
      
      recordTestResult(
        TestType.MARKET_DATA,
        false,
        classifiedError.message,
        startTime,
        classifiedError
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return false;
    }
  }, [recordTestResult]);
  
  // Test options data retrieval
  const runOptionsTest = useCallback(async (): Promise<boolean> => {
    setCurrentTest(TestType.OPTIONS_DATA);
    setIsRunningTests(true);
    const startTime = Date.now();
    
    try {
      console.log("[useIBKRConnectionTest] Running options data test");
      const provider = getDataProvider();
      
      if (!provider) {
        recordTestResult(
          TestType.OPTIONS_DATA,
          false,
          "No data provider available",
          startTime
        );
        setCurrentTest(null);
        setIsRunningTests(false);
        return false;
      }
      
      // Test getting options data
      if (typeof provider.getOptionChain !== 'function') {
        recordTestResult(
          TestType.OPTIONS_DATA,
          false,
          "Provider missing getOptionChain method",
          startTime
        );
        setCurrentTest(null);
        setIsRunningTests(false);
        return false;
      }
      
      // Get option chain for SPY
      console.log("[useIBKRConnectionTest] Calling getOptionChain('SPY')");
      const optionsData = await provider.getOptionChain('SPY');
      
      const success = Array.isArray(optionsData) && optionsData.length > 0;
      
      recordTestResult(
        TestType.OPTIONS_DATA,
        success,
        success ? `Successfully retrieved ${optionsData.length} options` : "Failed to get options data",
        startTime,
        undefined,
        { 
          optionsCount: Array.isArray(optionsData) ? optionsData.length : 0,
          optionsSample: Array.isArray(optionsData) && optionsData.length > 0 ? optionsData.slice(0, 3) : null 
        }
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return success;
    } catch (error) {
      console.error("[useIBKRConnectionTest] Options data test error:", error);
      
      // Classify and handle error
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRConnectionTest',
        method: 'runOptionsTest'
      });
      
      recordTestResult(
        TestType.OPTIONS_DATA,
        false,
        classifiedError.message,
        startTime,
        classifiedError
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return false;
    }
  }, [recordTestResult]);
  
  // Test reconnection
  const runReconnectionTest = useCallback(async (): Promise<boolean> => {
    setCurrentTest(TestType.RECONNECT);
    setIsRunningTests(true);
    const startTime = Date.now();
    
    try {
      console.log("[useIBKRConnectionTest] Running reconnection test");
      const provider = getDataProvider();
      
      if (!provider) {
        recordTestResult(
          TestType.RECONNECT,
          false,
          "No data provider available",
          startTime
        );
        setCurrentTest(null);
        setIsRunningTests(false);
        return false;
      }
      
      // Test reconnection
      if (typeof provider.connect !== 'function') {
        recordTestResult(
          TestType.RECONNECT,
          false,
          "Provider missing connect method",
          startTime
        );
        setCurrentTest(null);
        setIsRunningTests(false);
        return false;
      }
      
      // Perform reconnection
      console.log("[useIBKRConnectionTest] Calling provider.connect()");
      const reconnectResult = await provider.connect();
      
      // Update connection state
      const connected = provider.isConnected();
      setIsConnected(connected);
      
      // Determine data source
      const quotesDelayed = (provider as any).status?.quotesDelayed;
      if (connected) {
        setDataSource(quotesDelayed ? 'delayed' : 'live');
      } else {
        setDataSource('mock');
      }
      
      recordTestResult(
        TestType.RECONNECT,
        reconnectResult,
        reconnectResult ? "Successfully reconnected to IBKR" : "Failed to reconnect to IBKR",
        startTime,
        undefined,
        {
          provider: provider.constructor.name,
          quotesDelayed,
          dataSource: connected ? (quotesDelayed ? 'delayed' : 'live') : 'mock'
        }
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return reconnectResult;
    } catch (error) {
      console.error("[useIBKRConnectionTest] Reconnection test error:", error);
      
      // Classify and handle error
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRConnectionTest',
        method: 'runReconnectionTest'
      });
      
      recordTestResult(
        TestType.RECONNECT,
        false,
        classifiedError.message,
        startTime,
        classifiedError
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return false;
    }
  }, [recordTestResult]);
  
  // Run all tests in sequence
  const runAllTests = useCallback(async (): Promise<boolean> => {
    setCurrentTest(TestType.COMPREHENSIVE);
    setIsRunningTests(true);
    const startTime = Date.now();
    
    try {
      console.log("[useIBKRConnectionTest] Running comprehensive test suite");
      
      // Run each test in sequence
      const connectionResult = await runConnectionTest();
      if (!connectionResult) {
        // If connection fails, try reconnection before giving up
        console.log("[useIBKRConnectionTest] Connection failed, attempting reconnection");
        const reconnectResult = await runReconnectionTest();
        
        if (!reconnectResult) {
          // If reconnection also fails, stop tests
          recordTestResult(
            TestType.COMPREHENSIVE,
            false,
            "Comprehensive test failed: Could not establish connection",
            startTime
          );
          setCurrentTest(null);
          setIsRunningTests(false);
          return false;
        }
      }
      
      // Continue with other tests
      const authResult = await runAuthenticationTest();
      const marketDataResult = await runDataRetrievalTest();
      const optionsResult = await runOptionsTest();
      
      const allSuccess = authResult && marketDataResult && optionsResult;
      
      recordTestResult(
        TestType.COMPREHENSIVE,
        allSuccess,
        allSuccess ? "All tests passed successfully" : "Some tests failed",
        startTime,
        undefined,
        {
          connectionResult,
          authResult,
          marketDataResult,
          optionsResult
        }
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return allSuccess;
    } catch (error) {
      console.error("[useIBKRConnectionTest] Comprehensive test error:", error);
      
      // Classify and handle error
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRConnectionTest',
        method: 'runAllTests'
      });
      
      recordTestResult(
        TestType.COMPREHENSIVE,
        false,
        classifiedError.message,
        startTime,
        classifiedError
      );
      
      setCurrentTest(null);
      setIsRunningTests(false);
      return false;
    }
  }, [
    runConnectionTest,
    runReconnectionTest,
    runAuthenticationTest,
    runDataRetrievalTest,
    runOptionsTest,
    recordTestResult
  ]);
  
  // Clear test results
  const clearTestResults = useCallback(() => {
    setTestResults([]);
  }, []);
  
  return {
    isConnected,
    dataSource,
    runConnectionTest,
    runAuthenticationTest,
    runDataRetrievalTest,
    runOptionsTest,
    runReconnectionTest,
    runAllTests,
    testResults,
    clearTestResults,
    isRunningTests,
    lastTestRun,
    currentTest
  };
}
