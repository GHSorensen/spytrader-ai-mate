
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDataProvider, clearDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { InteractiveBrokersService } from '@/services/dataProviders/interactiveBrokersService';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const IBKRConnectionDebugger: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [configValues, setConfigValues] = useState({
    connectionMethod: 'tws' as 'tws' | 'webapi',
    twsHost: 'localhost',
    twsPort: '7496',
    apiKey: '',
    paperTrading: true
  });

  // Create a new service instance
  const [ibkrService, setIbkrService] = useState<InteractiveBrokersService | null>(null);

  // Initialize service with current config
  useEffect(() => {
    const config: DataProviderConfig = {
      type: 'interactive-brokers',
      connectionMethod: configValues.connectionMethod,
      twsHost: configValues.twsHost,
      twsPort: configValues.twsPort,
      apiKey: configValues.apiKey,
      paperTrading: configValues.paperTrading
    };
    
    const newService = new InteractiveBrokersService(config);
    setIbkrService(newService);
    
    // Check if already connected
    if (newService.isConnected()) {
      setConnected(true);
    }
  }, [configValues]);

  // Handle config change
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setConfigValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleConnect = async () => {
    if (!ibkrService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Clear any existing provider
      clearDataProvider();
      
      const result = await ibkrService.connect();
      setConnected(result);
      
      // Get diagnostics after connection attempt
      const diagnosticInfo = ibkrService.getDiagnostics();
      setDiagnostics(diagnosticInfo);
      
      setResponseData({ action: 'connect', result, timestamp: new Date().toISOString() });
      
      if (result) {
        toast.success('Connected to Interactive Brokers successfully');
      } else {
        const errorMessage = diagnosticInfo.lastError ? 
          diagnosticInfo.lastError.message : 
          'Failed to connect to Interactive Brokers';
        
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!ibkrService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await ibkrService.disconnect();
      setConnected(!result);
      setResponseData({ action: 'disconnect', result, timestamp: new Date().toISOString() });
      
      if (result) {
        toast.success('Disconnected from Interactive Brokers');
      } else {
        toast.error('Failed to disconnect from Interactive Brokers');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!ibkrService) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the enhanced testConnection method
      const testResult = await ibkrService.testConnection();
      
      setResponseData({
        action: 'test',
        ...testResult
      });
      
      if (testResult.success) {
        toast.success('Test connection successful');
      } else {
        setError(testResult.message);
        toast.error(testResult.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test connection';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>
        
        {/* Connection Tab */}
        <TabsContent value="connection">
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
                  {loading && !connected ? 'Connecting...' : 'Connect'}
                </Button>
                
                <Button 
                  onClick={handleDisconnect} 
                  disabled={loading || !connected}
                  variant="destructive"
                >
                  {loading && connected ? 'Disconnecting...' : 'Disconnect'}
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
                <p>Connection Type: Interactive Brokers {configValues.connectionMethod}</p>
                {configValues.connectionMethod === 'tws' ? (
                  <>
                    <p>TWS Host: {configValues.twsHost}</p>
                    <p>TWS Port: {configValues.twsPort}</p>
                  </>
                ) : (
                  <p>Using Web API with {configValues.apiKey ? 'provided' : 'missing'} API key</p>
                )}
                <p>Mode: {configValues.paperTrading ? 'Paper Trading' : 'Live Trading'}</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Configuration Tab */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>IBKR Configuration</CardTitle>
              <CardDescription>
                Configure your connection to Interactive Brokers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Connection Method</label>
                  <select 
                    name="connectionMethod"
                    value={configValues.connectionMethod}
                    onChange={handleConfigChange}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={connected}
                  >
                    <option value="tws">TWS (Trader Workstation)</option>
                    <option value="webapi">Web API</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    TWS requires Trader Workstation to be running on your computer
                  </p>
                </div>
                
                {configValues.connectionMethod === 'tws' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">TWS Host</label>
                      <input 
                        type="text" 
                        name="twsHost"
                        value={configValues.twsHost}
                        onChange={handleConfigChange}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={connected}
                        placeholder="localhost"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">TWS Port</label>
                      <input 
                        type="text" 
                        name="twsPort"
                        value={configValues.twsPort}
                        onChange={handleConfigChange}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={connected}
                        placeholder="7496"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Default is 7496 for live or 7497 for paper trading
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">API Key</label>
                    <input 
                      type="text" 
                      name="apiKey"
                      value={configValues.apiKey}
                      onChange={handleConfigChange}
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={connected}
                      placeholder="Your IBKR Web API Key"
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="paperTrading"
                    name="paperTrading"
                    checked={configValues.paperTrading}
                    onChange={handleConfigChange}
                    className="mr-2"
                    disabled={connected}
                  />
                  <label htmlFor="paperTrading" className="text-sm">
                    Paper Trading Mode
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleConnect} 
                disabled={loading || connected}
                variant="default"
                className="w-full"
              >
                Apply & Connect
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostics Information</CardTitle>
              <CardDescription>
                Technical details for troubleshooting connection issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border p-3 rounded-md bg-gray-50">
                  <h3 className="font-medium mb-2">Connection Diagnostics</h3>
                  {diagnostics ? (
                    <pre className="text-xs overflow-auto max-h-60">
                      {JSON.stringify(diagnostics, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-gray-500">No diagnostic data available yet. Try connecting first.</p>
                  )}
                </div>
                
                <Separator />
                
                <div className="border p-3 rounded-md bg-gray-50">
                  <h3 className="font-medium mb-2">Last Response</h3>
                  {responseData ? (
                    <pre className="text-xs overflow-auto max-h-60">
                      {JSON.stringify(responseData, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-gray-500">No response data available. Try an operation first.</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Troubleshooting Steps</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Make sure TWS or IB Gateway is running</li>
                    <li>Check that API connections are enabled in TWS (File → Global Configuration → API → Settings)</li>
                    <li>Verify that the "Allow connections from localhost only" option is disabled if connecting from another machine</li>
                    <li>Confirm the correct port is being used (7496 for live, 7497 for paper)</li>
                    <li>Check firewall settings to ensure the port is open</li>
                    <li>Try restarting TWS or IB Gateway</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full text-xs text-gray-500">
                <p>Interactive Brokers® and TWS® are registered trademarks of Interactive Brokers LLC.</p>
                <p>For API documentation and support, visit the <a href="https://interactivebrokers.github.io/tws-api/" target="_blank" rel="noopener noreferrer" className="underline">IBKR API documentation</a>.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IBKRConnectionDebugger;
