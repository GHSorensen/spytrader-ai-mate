
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useIBKRConnectionTest, TestType, ConnectionTestResult } from '@/hooks/ibkr/test/useIBKRConnectionTest';
import { useIBKRConnectionMonitor } from '@/hooks/ibkr/useIBKRConnectionMonitor';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';

const IBKRTestPage: React.FC = () => {
  const {
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
    currentTest
  } = useIBKRConnectionTest();

  const {
    isReconnecting,
    reconnectAttempts,
    handleManualReconnect,
    getDetailedDiagnostics
  } = useIBKRConnectionMonitor();

  // Group test results by type
  const connectionTests = testResults.filter(test => test.type === TestType.CONNECTION);
  const authTests = testResults.filter(test => test.type === TestType.AUTHENTICATION);
  const marketDataTests = testResults.filter(test => test.type === TestType.MARKET_DATA);
  const optionsTests = testResults.filter(test => test.type === TestType.OPTIONS_DATA);
  const reconnectTests = testResults.filter(test => test.type === TestType.RECONNECT);
  const comprehensiveTests = testResults.filter(test => test.type === TestType.COMPREHENSIVE);

  // Show detailed diagnostics in console
  const showDiagnostics = () => {
    const diagnostics = getDetailedDiagnostics();
    console.log('Detailed IBKR Connection Diagnostics:', diagnostics);
  };

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">IBKR Connection Test Suite</h1>
      <p className="text-muted-foreground mb-6">
        Test and diagnose Interactive Brokers connection issues
      </p>

      {/* Connection Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Connection Status</span>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "success" : "destructive"} className="ml-2">
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant={dataSource === 'live' ? "success" : dataSource === 'delayed' ? "warning" : "outline"}>
                {dataSource === 'live' ? "Live Data" : dataSource === 'delayed' ? "Delayed Data" : "Mock Data"}
              </Badge>
              {isReconnecting && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Reconnecting...
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={runConnectionTest} 
              disabled={isRunningTests}
              variant="outline"
              className="flex items-center justify-between"
            >
              Test Connection
              {currentTest === TestType.CONNECTION && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
            <Button 
              onClick={runAuthenticationTest}  
              disabled={isRunningTests || !isConnected}
              variant="outline"
              className="flex items-center justify-between"
            >
              Test Authentication
              {currentTest === TestType.AUTHENTICATION && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
            <Button 
              onClick={runDataRetrievalTest} 
              disabled={isRunningTests || !isConnected}
              variant="outline"
              className="flex items-center justify-between"
            >
              Test Market Data
              {currentTest === TestType.MARKET_DATA && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
            <Button 
              onClick={runOptionsTest} 
              disabled={isRunningTests || !isConnected}
              variant="outline"
              className="flex items-center justify-between"
            >
              Test Options Data
              {currentTest === TestType.OPTIONS_DATA && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
            <Button 
              onClick={runReconnectionTest} 
              disabled={isRunningTests}
              variant="outline"
              className="flex items-center justify-between"
            >
              Test Reconnection
              {currentTest === TestType.RECONNECT && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
            <Button 
              onClick={handleManualReconnect} 
              disabled={isRunningTests || isReconnecting}
              variant={isReconnecting ? "outline" : "secondary"}
              className="flex items-center justify-between"
            >
              {isReconnecting ? (
                <>
                  Reconnecting... {reconnectAttempts > 0 && `(${reconnectAttempts})`}
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>Force Reconnect</>
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunningTests}
              variant="default"
              className="flex items-center"
            >
              Run All Tests
              {currentTest === TestType.COMPREHENSIVE && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
            
            <div className="space-x-2">
              <Button 
                onClick={showDiagnostics} 
                variant="outline"
                size="sm"
              >
                <Info className="mr-2 h-4 w-4" />
                Diagnostics
              </Button>
              
              <Button 
                onClick={clearTestResults} 
                variant="outline"
                size="sm"
              >
                Clear Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Tests */}
        {connectionTests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connection Tests</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {connectionTests.map((test, index) => (
                <div key={`conn-${index}`} className="mb-4 p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {test.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={test.success ? "text-green-600" : "text-red-600"}>
                        {test.success ? "Success" : "Failed"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {test.timestamp.toLocaleTimeString()} ({test.duration}ms)
                    </span>
                  </div>
                  <p className="text-sm">{test.message}</p>
                  {test.details && (
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                      <p><strong>Provider:</strong> {test.provider}</p>
                      {test.details.dataSource && (
                        <p><strong>Data Source:</strong> {test.details.dataSource}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Authentication Tests */}
        {authTests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authentication Tests</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {authTests.map((test, index) => (
                <div key={`auth-${index}`} className="mb-4 p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {test.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={test.success ? "text-green-600" : "text-red-600"}>
                        {test.success ? "Success" : "Failed"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {test.timestamp.toLocaleTimeString()} ({test.duration}ms)
                    </span>
                  </div>
                  <p className="text-sm">{test.message}</p>
                  {test.details && (
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                      <p><strong>Provider:</strong> {test.provider}</p>
                      {test.details.accessToken && (
                        <p><strong>Access Token:</strong> {test.details.accessToken}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Market Data Tests */}
        {marketDataTests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Data Tests</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {marketDataTests.map((test, index) => (
                <div key={`data-${index}`} className="mb-4 p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {test.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={test.success ? "text-green-600" : "text-red-600"}>
                        {test.success ? "Success" : "Failed"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {test.timestamp.toLocaleTimeString()} ({test.duration}ms)
                    </span>
                  </div>
                  <p className="text-sm">{test.message}</p>
                  {test.details?.marketData && (
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      <pre>{JSON.stringify(test.details.marketData, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Options Data Tests */}
        {optionsTests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Options Data Tests</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {optionsTests.map((test, index) => (
                <div key={`opts-${index}`} className="mb-4 p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {test.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={test.success ? "text-green-600" : "text-red-600"}>
                        {test.success ? "Success" : "Failed"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {test.timestamp.toLocaleTimeString()} ({test.duration}ms)
                    </span>
                  </div>
                  <p className="text-sm">{test.message}</p>
                  {test.details && (
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                      <p><strong>Options Count:</strong> {test.details.optionsCount}</p>
                      {test.details.optionsSample && (
                        <div className="mt-1 overflow-x-auto">
                          <strong>Sample:</strong>
                          <pre>{JSON.stringify(test.details.optionsSample, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Reconnect Tests */}
        {reconnectTests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reconnection Tests</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {reconnectTests.map((test, index) => (
                <div key={`reconn-${index}`} className="mb-4 p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {test.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={test.success ? "text-green-600" : "text-red-600"}>
                        {test.success ? "Success" : "Failed"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {test.timestamp.toLocaleTimeString()} ({test.duration}ms)
                    </span>
                  </div>
                  <p className="text-sm">{test.message}</p>
                  {test.details && (
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                      <p><strong>Provider:</strong> {test.provider}</p>
                      {test.details.dataSource && (
                        <p><strong>Data Source:</strong> {test.details.dataSource}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Comprehensive Tests */}
        {comprehensiveTests.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Comprehensive Tests</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {comprehensiveTests.map((test, index) => (
                <div key={`comp-${index}`} className="mb-4 p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {test.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={test.success ? "text-green-600" : "text-red-600"}>
                        {test.success ? "Success" : "Failed"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {test.timestamp.toLocaleTimeString()} ({test.duration}ms)
                    </span>
                  </div>
                  <p className="text-sm">{test.message}</p>
                  {test.details && (
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <strong>Connection:</strong> 
                          <span className={test.details.connectionResult ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                            {test.details.connectionResult ? "Success" : "Failed"}
                          </span>
                        </div>
                        <div>
                          <strong>Authentication:</strong> 
                          <span className={test.details.authResult ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                            {test.details.authResult ? "Success" : "Failed"}
                          </span>
                        </div>
                        <div>
                          <strong>Market Data:</strong> 
                          <span className={test.details.marketDataResult ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                            {test.details.marketDataResult ? "Success" : "Failed"}
                          </span>
                        </div>
                        <div>
                          <strong>Options Data:</strong> 
                          <span className={test.details.optionsResult ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                            {test.details.optionsResult ? "Success" : "Failed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configuration Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Configuration Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium">IBKR TWS Settings</h3>
            <p className="text-sm text-muted-foreground">
              Make sure your Interactive Brokers Trader Workstation (TWS) has the following settings:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-2">
              <li>In TWS, go to <strong>Edit → Global Configuration → API → Settings</strong></li>
              <li>Enable <strong>ActiveX and Socket Clients</strong></li>
              <li>Set the <strong>Socket port</strong> to <span className="font-mono bg-gray-100 px-1">7497</span> for paper trading or <span className="font-mono bg-gray-100 px-1">7496</span> for live trading</li>
              <li>Ensure <strong>Allow connections from localhost only</strong> is checked (unless connecting from a different machine)</li>
              <li>Uncheck <strong>Read-Only API</strong> if you need to place trades</li>
              <li>Make sure TWS is running and you are logged in when testing the connection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IBKRTestPage;
