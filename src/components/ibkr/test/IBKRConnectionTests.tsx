
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { useIBKRConnectionTest } from '@/hooks/ibkr/test';
import { TestType, ConnectionTestResult, TestResultsGrouped } from '@/hooks/ibkr/connection-status/types';

// Helper function to group test results by test type
const groupTestResults = (results: ConnectionTestResult[]): TestResultsGrouped => {
  const grouped: TestResultsGrouped = {};
  
  results.forEach(result => {
    const key = result.testType as unknown as keyof TestResultsGrouped;
    grouped[key] = result;
  });
  
  return grouped;
};

const IBKRConnectionTests: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [groupedResults, setGroupedResults] = useState<TestResultsGrouped>({});
  
  const {
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
  } = useIBKRConnectionTest();
  
  // Update grouped results when test results change
  useEffect(() => {
    setGroupedResults(groupTestResults(testResults));
  }, [testResults]);
  
  // Status Badge component
  const StatusBadge = ({ status }: { status: ConnectionTestResult['status'] }) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case 'failure':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'running':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            Not Run
          </Badge>
        );
    }
  };
  
  // Test Result Item component
  const TestResultItem = ({ result }: { result: ConnectionTestResult }) => {
    if (!result) return null;
    
    return (
      <Alert className="mb-2" variant={result.status === 'success' ? 'default' : 'destructive'}>
        <div className="flex justify-between items-start">
          <div>
            <AlertTitle className="flex items-center">
              {result.status === 'success' ? (
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-1" />
              )}
              {result.message}
            </AlertTitle>
            <AlertDescription className="mt-1">
              {result.durationMs && <span className="block text-xs">Duration: {result.durationMs}ms</span>}
              {result.timestamp && (
                <span className="block text-xs">
                  Time: {result.timestamp.toLocaleTimeString()}
                </span>
              )}
              {result.error && (
                <span className="block text-xs mt-1 text-red-600">
                  Error: {result.error.message}
                </span>
              )}
            </AlertDescription>
          </div>
          <StatusBadge status={result.status} />
        </div>
      </Alert>
    );
  };
  
  // Run the basic connection test
  const handleBasicTest = async () => {
    await testConnection();
  };
  
  // Run all tests
  const handleComprehensiveTest = async () => {
    await runComprehensiveTest();
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Connection Tests</h3>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={isConnected ? "default" : "outline"} 
              className={isConnected ? "bg-green-500" : ""}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            {isConnected && (
              <Badge variant="outline" className="capitalize">
                {dataSource} Data
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="basic">Basic Tests</TabsTrigger>
          <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Connection Test</h4>
                  <p className="text-sm text-gray-500">Test basic connectivity</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBasicTest}
                  disabled={isTestRunning}
                >
                  Run Test
                </Button>
              </div>
              
              {groupedResults.connection && (
                <TestResultItem result={groupedResults.connection} />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Authentication Test</h4>
                  <p className="text-sm text-gray-500">Verify authentication status</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testAuthentication}
                  disabled={isTestRunning || !isConnected}
                >
                  Run Test
                </Button>
              </div>
              
              {groupedResults.authentication && (
                <TestResultItem result={groupedResults.authentication} />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Market Data Test</h4>
                  <p className="text-sm text-gray-500">Test market data retrieval</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testMarketData}
                  disabled={isTestRunning || !isConnected}
                >
                  Run Test
                </Button>
              </div>
              
              {groupedResults['market-data'] && (
                <TestResultItem result={groupedResults['market-data']} />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Reconnect Test</h4>
                  <p className="text-sm text-gray-500">Test reconnection capability</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testReconnect}
                  disabled={isTestRunning}
                >
                  Run Test
                </Button>
              </div>
              
              {groupedResults.reconnect && (
                <TestResultItem result={groupedResults.reconnect} />
              )}
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="comprehensive">
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Comprehensive Test Suite</h4>
                <p className="text-sm text-gray-500">
                  Run all tests in sequence to validate connection status, authentication, 
                  market data retrieval, and reconnection capabilities.
                </p>
              </div>
              
              {testResults.length > 0 && (
                <Alert className="mb-4" variant={
                  testResults.every(r => r.status === 'success') ? 'default' : 'destructive'
                }>
                  <AlertTitle className="flex items-center">
                    {testResults.every(r => r.status === 'success') ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                        All tests passed
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Some tests failed
                      </>
                    )}
                  </AlertTitle>
                  <AlertDescription>
                    {testResults.length} test{testResults.length !== 1 ? 's' : ''} run
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-col space-y-2">
                {groupedResults.connection && (
                  <TestResultItem result={groupedResults.connection} />
                )}
                {groupedResults.authentication && (
                  <TestResultItem result={groupedResults.authentication} />
                )}
                {groupedResults['market-data'] && (
                  <TestResultItem result={groupedResults['market-data']} />
                )}
                {groupedResults.reconnect && (
                  <TestResultItem result={groupedResults.reconnect} />
                )}
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <div className="flex justify-end w-full gap-2">
              <Button 
                variant="outline"
                onClick={clearTestResults}
                disabled={testResults.length === 0 || isTestRunning}
              >
                Clear Results
              </Button>
              <Button 
                onClick={handleComprehensiveTest}
                disabled={isTestRunning}
              >
                {isTestRunning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : 'Run All Tests'}
              </Button>
            </div>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="results">
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Test Results</h4>
                <p className="text-sm text-gray-500">
                  History of test runs and their outcomes
                </p>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {testResults.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    No test results available
                  </p>
                ) : (
                  testResults.map((result, index) => (
                    <TestResultItem key={index} result={result} />
                  ))
                )}
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <div className="flex justify-end w-full">
              <Button 
                variant="outline"
                onClick={clearTestResults}
                disabled={testResults.length === 0}
              >
                Clear All Results
              </Button>
            </div>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default IBKRConnectionTests;
