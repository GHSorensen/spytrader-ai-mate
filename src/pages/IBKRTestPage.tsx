
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IBKRConnectionTests } from '@/components/ibkr/test/IBKRConnectionTests';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useIBKRConnectionMonitor } from '@/hooks/ibkr/connection-status/useIBKRConnectionMonitor';

const IBKRTestPage: React.FC = () => {
  const {
    isConnected,
    dataSource,
    isReconnecting,
    connectionLostTime,
    handleManualReconnect,
    forceConnectionCheck
  } = useIBKRConnectionMonitor({
    autoReconnect: true,
    maxReconnectAttempts: 3
  });

  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  
  const handleRefreshStatus = async () => {
    setLastCheckTime(new Date());
    await forceConnectionCheck();
  };

  useEffect(() => {
    handleRefreshStatus();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">IBKR Connection Testing Dashboard</h1>
      
      {/* Connection Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Connection Status
            {isReconnecting && <RefreshCw className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Current connection state with Interactive Brokers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <Alert variant={dataSource === 'live' ? 'default' : 'outline'} className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Connected to IBKR</AlertTitle>
              <AlertDescription className="text-green-600">
                Using {dataSource} market data.
                {lastCheckTime && <p className="text-xs mt-1">Last checked: {lastCheckTime.toLocaleTimeString()}</p>}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant={isReconnecting ? 'outline' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{isReconnecting ? 'Reconnecting...' : 'Not Connected'}</AlertTitle>
              <AlertDescription>
                {isReconnecting 
                  ? 'Attempting to re-establish connection with IBKR.'
                  : 'No active connection to Interactive Brokers.'}
                {connectionLostTime && <p className="text-xs mt-1">Connection lost at: {connectionLostTime.toLocaleTimeString()}</p>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleRefreshStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          {!isConnected && !isReconnecting && (
            <Button variant="default" onClick={handleManualReconnect}>
              Manual Reconnect
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Connection Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Tests</CardTitle>
          <CardDescription>
            Run tests to verify IBKR connection functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IBKRConnectionTests />
        </CardContent>
      </Card>
    </div>
  );
};

export default IBKRTestPage;
