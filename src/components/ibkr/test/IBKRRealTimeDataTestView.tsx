
import React, { useEffect } from 'react';
import { useIBKRRealTimeData } from '@/hooks/useIBKRRealTimeData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ConnectionStatus from '../ConnectionStatus';
import RetryStatusIndicator from '../RetryStatusIndicator';
import { toast } from 'sonner';

const IBKRRealTimeDataTestView: React.FC = () => {
  const { 
    marketData, 
    options, 
    isConnected, 
    dataSource, 
    isLoading, 
    isError, 
    refreshAllData, 
    forceConnectionCheck,
    reconnect,
    lastUpdated,
    retryCount,
    isRetrying
  } = useIBKRRealTimeData();

  // Automatically refresh data when component mounts
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handle refresh button click
  const handleRefresh = () => {
    toast.info("Refreshing data...");
    refreshAllData();
  };

  // Handle connection check button click
  const handleConnectionCheck = () => {
    toast.info("Checking connection...");
    forceConnectionCheck();
  };

  // Handle reconnect button click
  const handleReconnect = () => {
    toast.info("Attempting to reconnect...");
    reconnect();
  };

  // Map connection status for the component
  const connectionStatus = isConnected ? 'connected' : 'disconnected';

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">IBKR Real-Time Data Test</h1>
          <p className="text-muted-foreground">Test the IBKR real-time data integration with automatic retry</p>
        </div>
        
        <div className="flex items-center gap-4">
          <ConnectionStatus status={connectionStatus} source={dataSource} />
          <RetryStatusIndicator isRetrying={isRetrying} retryCount={retryCount} />
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh All Data'}
        </Button>
        <Button variant="outline" onClick={handleConnectionCheck}>
          Check Connection
        </Button>
        <Button variant="secondary" onClick={handleReconnect}>
          Reconnect
        </Button>
      </div>
      
      {isError && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700">Error Detected</CardTitle>
            <CardDescription className="text-red-600">
              There was an error fetching data from IBKR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              Please check your connection settings and try again. If retry is in progress,
              wait for it to complete.
            </p>
          </CardContent>
          <CardFooter className="bg-red-100 rounded-b-lg">
            <div className="text-xs text-red-600">
              Retry mechanism is {isRetrying ? 'active' : 'inactive'}.
              {isRetrying && ` Attempt ${retryCount} in progress.`}
            </div>
          </CardFooter>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Data</CardTitle>
            <CardDescription>
              Latest SPY market data from IBKR
              {lastUpdated && ` (Updated: ${lastUpdated.toLocaleTimeString()})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !marketData ? (
              <div className="text-center p-6 text-muted-foreground">Loading market data...</div>
            ) : marketData ? (
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="font-medium">Price</span>
                  <span>${marketData.price.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-1">
                  <span className="font-medium">Change</span>
                  <span className={marketData.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between py-1">
                  <span className="font-medium">Volume</span>
                  <span>{marketData.volume.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-1">
                  <span className="font-medium">High</span>
                  <span>${marketData.high?.toFixed(2) || 'N/A'}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-1">
                  <span className="font-medium">Low</span>
                  <span>${marketData.low?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground">No market data available</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Options Data</CardTitle>
            <CardDescription>
              Latest SPY options from IBKR
              {options.length > 0 && ` (${options.length} options available)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && options.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">Loading options data...</div>
            ) : options.length > 0 ? (
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Strike</th>
                      <th className="text-left p-2">Expiry</th>
                      <th className="text-right p-2">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {options.slice(0, 8).map((option, index) => (
                      <tr key={index} className="border-b border-muted hover:bg-muted/50">
                        <td className="p-2">{option.type}</td>
                        <td className="p-2">${option.strikePrice.toFixed(1)}</td>
                        <td className="p-2">{new Date(option.expirationDate).toLocaleDateString()}</td>
                        <td className="p-2 text-right">
                          ${option.premium.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground">No options data available</div>
            )}
          </CardContent>
          {options.length > 8 && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing 8 of {options.length} options
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default IBKRRealTimeDataTestView;
