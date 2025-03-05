
import React from 'react';
import { useIBKRRealTimeData } from '@/hooks/useIBKRRealTimeData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JsonView } from '@/components/ui/json-view';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export const IBKRRealTimeDataTestView: React.FC = () => {
  const { toast } = useToast();
  const {
    // Data
    marketData,
    options,
    
    // Status
    isConnected,
    dataSource,
    connectionDiagnostics,
    isLoading,
    isError,
    
    // Actions
    refreshAllData,
    forceConnectionCheck,
    reconnect,
    
    // Timestamps
    lastUpdated
  } = useIBKRRealTimeData();

  const handleRefresh = async () => {
    await refreshAllData();
    toast({
      title: "Data Refreshed",
      description: "Real-time data has been refreshed",
    });
  };

  const handleCheckConnection = () => {
    forceConnectionCheck();
    toast({
      title: "Connection Check",
      description: "Checking connection status...",
    });
  };

  const handleReconnect = () => {
    reconnect();
    toast({
      title: "Reconnection Initiated",
      description: "Attempting to reconnect to IBKR...",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>IBKR Real-Time Data Test</CardTitle>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <CardDescription>
            Testing the IBKR real-time data integration with {dataSource} data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Button onClick={handleRefresh} disabled={isLoading}>
                Refresh Data
              </Button>
              <Button onClick={handleCheckConnection} variant="outline">
                Check Connection
              </Button>
              <Button onClick={handleReconnect} variant="secondary">
                Reconnect
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <p className="text-sm">Last Updated: </p>
              <Badge variant="outline">
                {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
              </Badge>
              
              {isLoading && (
                <Badge variant="outline" className="ml-2 bg-yellow-100">Loading...</Badge>
              )}
              
              {isError && (
                <Badge variant="destructive">Error</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="market-data">
        <TabsList className="w-full">
          <TabsTrigger value="market-data" className="flex-1">Market Data</TabsTrigger>
          <TabsTrigger value="options" className="flex-1">Options Chain</TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex-1">Diagnostics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="market-data">
          <Card>
            <CardHeader>
              <CardTitle>SPY Market Data</CardTitle>
            </CardHeader>
            <CardContent>
              {!marketData ? (
                <p>No market data available</p>
              ) : (
                <JsonView data={marketData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="options">
          <Card>
            <CardHeader>
              <CardTitle>SPY Options Chain</CardTitle>
              <CardDescription>Showing {options?.length || 0} options</CardDescription>
            </CardHeader>
            <CardContent>
              {(!options || options.length === 0) ? (
                <p>No options data available</p>
              ) : (
                <JsonView data={options.slice(0, 10)} />
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Note: Showing first 10 options only for performance
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle>Connection Diagnostics</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonView data={connectionDiagnostics || {}} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
