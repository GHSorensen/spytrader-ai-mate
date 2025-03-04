
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDataProvider, clearDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';

const IBKRConnectionDebugger: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);

  // Configure a data provider with IBKR settings
  const config: DataProviderConfig = {
    type: 'interactive-brokers',
    connectionMethod: 'webapi',
    twsHost: 'localhost',
    twsPort: '5000',
    paperTrading: true
  };

  // Get provider instance
  const provider = getDataProvider(config);

  useEffect(() => {
    // Check connection status
    setConnected(provider.isConnected());
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await provider.connect();
      setConnected(result);
      setResponseData({ action: 'connect', result });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await provider.disconnect();
      setConnected(!result);
      setResponseData({ action: 'disconnect', result });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const accountData = await provider.getAccountData();
      const marketData = await provider.getMarketData();
      setResponseData({
        action: 'test',
        accountData,
        marketData
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            Current status of your Interactive Brokers connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className={`h-3 w-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-x-2">
            <Button 
              onClick={handleConnect} 
              disabled={loading || connected}
              variant="default"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
            
            <Button 
              onClick={handleDisconnect} 
              disabled={loading || !connected}
              variant="destructive"
            >
              Disconnect
            </Button>
            
            <Button 
              onClick={handleTest} 
              disabled={loading || !connected}
              variant="outline"
            >
              Test Connection
            </Button>
          </div>
        </CardContent>
        <CardFooter className="block">
          <div className="text-sm text-muted-foreground">
            <p>Connection Type: Interactive Brokers {config.connectionMethod}</p>
            <p>Host: {config.twsHost}, Port: {config.twsPort}</p>
            <p>Mode: {config.paperTrading ? 'Paper Trading' : 'Live Trading'}</p>
          </div>
        </CardFooter>
      </Card>
      
      {responseData && (
        <Card>
          <CardHeader>
            <CardTitle>Response Data</CardTitle>
            <CardDescription>Last API response data</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-gray-50 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IBKRConnectionDebugger;
