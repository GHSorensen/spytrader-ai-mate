
import React from 'react';
import { useIBKRRealTimeData } from '@/hooks/useIBKRRealTimeData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

/**
 * Test component for visualizing IBKR real-time data behavior
 * This helps us observe the polling, data updates, and error handling
 */
export const IBKRRealTimeDataTestView = () => {
  const { 
    marketData, 
    options,
    isConnected,
    dataSource,
    connectionDiagnostics,
    isLoading,
    isError,
    refreshAllData,
    forceConnectionCheck,
    reconnect,
    lastUpdated
  } = useIBKRRealTimeData();

  // Calculate time since last update
  const timeSinceUpdate = lastUpdated ? 
    new Date().getTime() - lastUpdated.getTime() : 0;
  const secondsSinceUpdate = Math.floor(timeSinceUpdate / 1000);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">IBKR Real-Time Data Test</h1>
        <div className="flex gap-2">
          <Button onClick={refreshAllData} variant="outline" size="sm">
            Refresh Data
          </Button>
          <Button onClick={forceConnectionCheck} variant="outline" size="sm">
            Check Connection
          </Button>
          {!isConnected && (
            <Button onClick={reconnect} variant="default" size="sm">
              Reconnect
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Current state of IBKR connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <div className="mt-1">
                <Badge 
                  variant={isConnected ? "success" : "destructive"}
                  className={isConnected ? "bg-green-500" : "bg-red-500"}
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Data Source</p>
              <div className="mt-1">
                <Badge variant="outline">{dataSource || 'Unknown'}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Loading State</p>
              <div className="mt-1">
                <Badge variant={isLoading ? "secondary" : "outline"}>
                  {isLoading ? 'Loading...' : 'Idle'}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Error State</p>
              <div className="mt-1">
                <Badge variant={isError ? "destructive" : "outline"}>
                  {isError ? 'Error' : 'No Errors'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated ? format(lastUpdated, 'HH:mm:ss') : 'Never'} 
            ({secondsSinceUpdate}s ago)
          </p>
          <Progress 
            className="mt-2 w-full" 
            value={Math.min(100, (secondsSinceUpdate / 30) * 100)} 
          />
        </CardFooter>
      </Card>

      {/* Market Data */}
      <Card>
        <CardHeader>
          <CardTitle>Market Data</CardTitle>
          <CardDescription>Real-time SPY market data</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !marketData && (
            <div className="flex justify-center items-center h-24">
              <p>Loading market data...</p>
            </div>
          )}
          {marketData ? (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Price</p>
                <p className="text-2xl font-bold">${marketData.price.toFixed(2)}</p>
                <p className={`text-sm ${marketData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)} 
                  ({marketData.changePercent.toFixed(2)}%)
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Range</p>
                <p className="text-base">{marketData.low.toFixed(2)} - {marketData.high.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Open: {marketData.open.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Volume</p>
                <p className="text-base">{(marketData.volume / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground">Avg: {(marketData.averageVolume / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          ) : isError ? (
            <div className="p-4 border border-red-200 rounded bg-red-50 text-red-700">
              Error loading market data
            </div>
          ) : (
            <div className="p-4 border rounded bg-gray-50">
              No market data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Options Data */}
      <Card>
        <CardHeader>
          <CardTitle>Options Chain</CardTitle>
          <CardDescription>SPY option data from IBKR</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && options.length === 0 && (
            <div className="flex justify-center items-center h-24">
              <p>Loading options data...</p>
            </div>
          )}
          {options.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Strike</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Expiry</th>
                    <th className="text-right py-2">Premium</th>
                    <th className="text-right py-2">IV</th>
                    <th className="text-right py-2">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {options.slice(0, 5).map((option) => (
                    <tr key={option.id} className="border-b">
                      <td className="py-2">{option.strikePrice}</td>
                      <td className="py-2">{option.type}</td>
                      <td className="py-2">{format(option.expirationDate, 'MM/dd/yyyy')}</td>
                      <td className="py-2 text-right">${option.premium.toFixed(2)}</td>
                      <td className="py-2 text-right">{(option.impliedVolatility * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right">{option.delta.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {options.length > 5 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing 5 of {options.length} options
                </p>
              )}
            </div>
          ) : isError ? (
            <div className="p-4 border border-red-200 rounded bg-red-50 text-red-700">
              Error loading options data
            </div>
          ) : (
            <div className="p-4 border rounded bg-gray-50">
              No options data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnostics */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Diagnostics</CardTitle>
          <CardDescription>Technical details about the connection</CardDescription>
        </CardHeader>
        <CardContent>
          {connectionDiagnostics ? (
            <div className="text-sm">
              <pre className="p-4 rounded bg-gray-50 overflow-auto">
                {JSON.stringify(connectionDiagnostics, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="p-4 border rounded bg-gray-50">
              No diagnostics available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IBKRRealTimeDataTestView;
