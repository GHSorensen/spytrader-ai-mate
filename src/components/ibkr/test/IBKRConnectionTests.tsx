
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, WifiOff, Activity, RefreshCw, Share2, Copy, Database, Key, Lock } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { useIBKRConnectionTest, ConnectionTestResult, TestType } from '@/hooks/ibkr/test/useIBKRConnectionTest';

interface TestCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onRunTest: () => Promise<any>;
  results: ConnectionTestResult[];
  isRunning: boolean;
}

// Component to show test results
const TestCard: React.FC<TestCardProps> = ({ 
  title, 
  description, 
  icon, 
  onRunTest, 
  results, 
  isRunning 
}) => {
  const latestResult = results.length > 0 ? results[results.length - 1] : null;
  
  const handleRunTest = async () => {
    try {
      await onRunTest();
    } catch (error) {
      console.error(`Error running ${title} test:`, error);
      toast.error(`Error running ${title} test`, {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {latestResult && (
            <Badge 
              variant={latestResult.success ? "default" : "destructive"}
              className="gap-1"
            >
              {latestResult.success ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              {latestResult.success ? 'Success' : 'Failed'}
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {latestResult ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Time:</span>
              <span>{latestResult.timestamp.toLocaleTimeString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Latency:</span>
              <span>{latestResult.latency}ms</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Provider:</span>
              <span>{latestResult.provider}</span>
            </div>
            
            {latestResult.error && (
              <div className="pt-1">
                <div className="text-muted-foreground mb-1">Error:</div>
                <div className="text-xs text-destructive border border-destructive/30 rounded p-1.5 bg-destructive/10">
                  {latestResult.error}
                </div>
              </div>
            )}
            
            {latestResult.details && Object.keys(latestResult.details).length > 0 && (
              <div className="pt-1">
                <div className="text-muted-foreground mb-1">Details:</div>
                <div className="text-xs border border-border rounded p-1.5 bg-muted/30 font-mono">
                  {JSON.stringify(latestResult.details, null, 2)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground text-sm">
            No test results yet
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="sm"
          onClick={handleRunTest}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              {icon}
              Run Test
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Results timeline component
const TestResultsTimeline: React.FC<{
  results: ConnectionTestResult[];
  testType: TestType;
}> = ({ results, testType }) => {
  if (results.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        No test history available
      </div>
    );
  }
  
  return (
    <div className="space-y-3 my-2 max-h-[300px] overflow-y-auto pr-2">
      {results.slice().reverse().map((result, index) => (
        <div key={index} className={`border-l-2 pl-3 py-1 ${
          result.success ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5">
              {result.success ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className="font-medium text-sm">
                {testType === 'connection' && 'Connection Test'}
                {testType === 'authentication' && 'Authentication Test'}
                {testType === 'market-data' && 'Market Data Test'}
                {testType === 'reconnect' && 'Reconnection Test'}
              </span>
            </div>
            <Badge variant="outline" className="text-xs gap-1">
              <Clock className="h-3 w-3" />
              {result.latency}ms
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground mb-1">
            {result.timestamp.toLocaleString()}
          </div>
          
          {result.error && (
            <div className="mt-1 p-1.5 text-xs bg-red-50 border border-red-200 rounded text-red-800">
              {result.error}
            </div>
          )}
          
          {result.details && Object.keys(result.details).length > 0 && (
            <div className="mt-1 p-1.5 text-xs bg-gray-50 border border-gray-200 rounded font-mono">
              {JSON.stringify(result.details, null, 2)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Main component
const IBKRConnectionTests: React.FC = () => {
  const {
    testConnection,
    testAuthentication,
    testMarketData,
    testReconnect,
    runComprehensiveTest,
    testResults,
    isTestRunning,
    isConnected,
    dataSource,
    getDiagnostics,
    clearTestResults
  } = useIBKRConnectionTest();
  
  const [activeTab, setActiveTab] = useState<'tests' | 'history' | 'diagnostics'>('tests');
  
  const handleCopyDiagnostics = () => {
    const diagnostics = getDiagnostics();
    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2))
      .then(() => {
        toast.success("Diagnostics copied to clipboard");
      })
      .catch((error) => {
        console.error("Failed to copy diagnostics:", error);
        toast.error("Failed to copy diagnostics");
      });
  };
  
  const handleRunAll = async () => {
    try {
      await runComprehensiveTest();
    } catch (error) {
      console.error("Failed to run comprehensive test:", error);
      toast.error("Failed to run all tests", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  
  const handleClearResults = () => {
    clearTestResults();
    toast.success("Test results cleared");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">IBKR Connection Tests</h2>
          <p className="text-muted-foreground">
            Diagnostic tools for monitoring and testing IBKR connectivity
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className="gap-1 px-2 py-1"
          >
            {isConnected ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            {isConnected ? 
              dataSource === 'live' ? 'Live' : 
              dataSource === 'delayed' ? 'Delayed' : 'Connected' : 
              'Disconnected'
            }
          </Badge>
          
          <Button 
            variant="outline"
            size="sm" 
            onClick={handleRunAll}
            disabled={Object.values(isTestRunning).some(v => v)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Run All Tests
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyDiagnostics}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Diagnostics
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tests" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TestCard
              title="Basic Connection"
              description="Tests basic connectivity to Interactive Brokers"
              icon={<WifiOff className="h-4 w-4 mr-1" />}
              onRunTest={testConnection}
              results={testResults.connection}
              isRunning={isTestRunning.connection}
            />
            
            <TestCard
              title="Authentication"
              description="Verifies authentication with Interactive Brokers"
              icon={<Key className="h-4 w-4 mr-1" />}
              onRunTest={testAuthentication}
              results={testResults.authentication}
              isRunning={isTestRunning.authentication}
            />
            
            <TestCard
              title="Market Data"
              description="Tests retrieval of market data from IBKR"
              icon={<Database className="h-4 w-4 mr-1" />}
              onRunTest={testMarketData}
              results={testResults['market-data']}
              isRunning={isTestRunning['market-data']}
            />
            
            <TestCard
              title="Reconnection"
              description="Tests the ability to reconnect to IBKR"
              icon={<RefreshCw className="h-4 w-4 mr-1" />}
              onRunTest={testReconnect}
              results={testResults.reconnect}
              isRunning={isTestRunning.reconnect}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Test History</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearResults}
                  disabled={Object.values(testResults).every(r => r.length === 0)}
                >
                  Clear History
                </Button>
              </div>
              <CardDescription>
                History of all connection tests and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="connection">
                <TabsList>
                  <TabsTrigger value="connection">Connection</TabsTrigger>
                  <TabsTrigger value="authentication">Authentication</TabsTrigger>
                  <TabsTrigger value="market-data">Market Data</TabsTrigger>
                  <TabsTrigger value="reconnect">Reconnection</TabsTrigger>
                </TabsList>
                
                <TabsContent value="connection">
                  <TestResultsTimeline 
                    results={testResults.connection} 
                    testType="connection" 
                  />
                </TabsContent>
                
                <TabsContent value="authentication">
                  <TestResultsTimeline 
                    results={testResults.authentication} 
                    testType="authentication" 
                  />
                </TabsContent>
                
                <TabsContent value="market-data">
                  <TestResultsTimeline 
                    results={testResults['market-data']} 
                    testType="market-data" 
                  />
                </TabsContent>
                
                <TabsContent value="reconnect">
                  <TestResultsTimeline 
                    results={testResults.reconnect} 
                    testType="reconnect" 
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="diagnostics" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Diagnostic Information</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyDiagnostics}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              </div>
              <CardDescription>
                Detailed diagnostics for troubleshooting connection issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Connection Status</h3>
                  <div className="bg-muted rounded-md p-3">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Connected:</div>
                      <div className="font-mono">{isConnected ? 'Yes' : 'No'}</div>
                      
                      <div className="text-muted-foreground">Data Source:</div>
                      <div className="font-mono">{dataSource}</div>
                      
                      <div className="text-muted-foreground">Provider:</div>
                      <div className="font-mono">{getDiagnostics().provider.type}</div>
                      
                      <div className="text-muted-foreground">Connection Method:</div>
                      <div className="font-mono">{getDiagnostics().provider.connectionMethod || 'Unknown'}</div>
                      
                      <div className="text-muted-foreground">Paper Trading:</div>
                      <div className="font-mono">{getDiagnostics().provider.paperTrading ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Browser & Environment</h3>
                  <div className="bg-muted rounded-md p-3">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Timezone:</div>
                      <div className="font-mono">{getDiagnostics().browser.timezone}</div>
                      
                      <div className="text-muted-foreground">Time:</div>
                      <div className="font-mono">{new Date().toLocaleString()}</div>
                      
                      <div className="text-muted-foreground">Language:</div>
                      <div className="font-mono">{getDiagnostics().browser.language}</div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Full Diagnostics</h3>
                  <div className="bg-muted rounded-md p-3 max-h-[300px] overflow-auto">
                    <pre className="text-xs whitespace-pre-wrap break-all font-mono">
                      {JSON.stringify(getDiagnostics(), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IBKRConnectionTests;
