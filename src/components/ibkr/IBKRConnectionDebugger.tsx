
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';

const IBKRConnectionDebugger: React.FC = () => {
  const [connectionHistory, setConnectionHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  
  const fetchConnectionHistory = async () => {
    try {
      setLoading(true);
      
      // Get data provider
      const provider = getDataProvider();
      
      // Check if it's the IBKR provider with the IBKRTradesService
      if (provider && provider.constructor.name.includes('Interactive') && (provider as any).coreService) {
        // Try to access coreService and then tradesService to get history
        const history = await getConnectionHistory(provider);
        setConnectionHistory(history);
        
        // Check for token information in localStorage
        const savedToken = localStorage.getItem('ibkr-token');
        if (savedToken) {
          try {
            const tokenData = JSON.parse(savedToken);
            setTokenInfo({
              hasAccessToken: !!tokenData.accessToken,
              hasRefreshToken: !!tokenData.refreshToken,
              accessTokenPrefix: tokenData.accessToken ? 
                `${tokenData.accessToken.substring(0, 5)}...${tokenData.accessToken.substring(tokenData.accessToken.length - 5)}` : 
                "None",
              expiresAt: tokenData.expires ? new Date(tokenData.expires).toISOString() : "Unknown",
              isExpired: tokenData.expires ? new Date(tokenData.expires) < new Date() : true
            });
          } catch (e) {
            console.error("Error parsing token:", e);
          }
        }
      } else {
        console.log("Provider doesn't have connection history capability", provider?.constructor.name);
      }
    } catch (error) {
      console.error("Error fetching connection history:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to access connection history through provider chain
  const getConnectionHistory = async (provider: any): Promise<any> => {
    try {
      // Try different paths to find the trades service with connection history
      if (provider.coreService?.dataService?.tradesService?.getConnectionHistory) {
        return provider.coreService.dataService.tradesService.getConnectionHistory();
      }
      
      if (provider.coreService?.tradesService?.getConnectionHistory) {
        return provider.coreService.tradesService.getConnectionHistory();
      }
      
      // For direct IBKRTradesService
      if (provider.tradesService?.getConnectionHistory) {
        return provider.tradesService.getConnectionHistory();
      }
      
      return { error: "Could not find connection history method" };
    } catch (error) {
      console.error("Error in getConnectionHistory:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  };
  
  useEffect(() => {
    fetchConnectionHistory();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchConnectionHistory, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>IBKR Connection Debugger</CardTitle>
            <CardDescription>View detailed connection history and diagnostics</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchConnectionHistory}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="history">
          <TabsList className="mb-4">
            <TabsTrigger value="history">Connection History</TabsTrigger>
            <TabsTrigger value="tokens">Token Status</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            {connectionHistory ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 border rounded-md">
                    <h3 className="text-sm font-medium mb-2">Authentication State</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Auth Initiated:</span>
                        <Badge variant={connectionHistory.currentState?.authInitiated ? "success" : "destructive"}>
                          {connectionHistory.currentState?.authInitiated ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Auth Complete:</span>
                        <Badge variant={connectionHistory.currentState?.authComplete ? "success" : "destructive"}>
                          {connectionHistory.currentState?.authComplete ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Auth Attempt:</span>
                        <span>{connectionHistory.currentState?.lastAuthAttempt || "Never"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <h3 className="text-sm font-medium mb-2">Auth Errors</h3>
                    {connectionHistory.currentState?.authErrors?.length > 0 ? (
                      <ul className="text-sm space-y-1">
                        {connectionHistory.currentState.authErrors.map((error: string, i: number) => (
                          <li key={i} className="flex items-center text-red-600">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" /> {error}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" /> No errors detected
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Recent Events</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {connectionHistory.history?.length > 0 ? 
                          connectionHistory.history.map((event: any, i: number) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-2 text-xs">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                  {new Date(event.timestamp).toLocaleTimeString()}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-xs">{event.action}</td>
                              <td className="px-4 py-2 text-xs">
                                {event.result ? (
                                  <Badge variant="success" className="px-1 py-0">Success</Badge>
                                ) : (
                                  <Badge variant="destructive" className="px-1 py-0">Failed</Badge>
                                )}
                              </td>
                              <td className="px-4 py-2 text-xs truncate max-w-xs">{event.details || "-"}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-4 text-sm text-center text-gray-500">
                                No connection events recorded
                              </td>
                            </tr>
                          )
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {loading ? "Loading connection history..." : "No connection history available"}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tokens">
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium mb-3">Saved Token Information</h3>
                {tokenInfo ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Access Token:</div>
                      <div className="overflow-hidden">
                        {tokenInfo.hasAccessToken ? (
                          <span className="font-mono text-xs">{tokenInfo.accessTokenPrefix}</span>
                        ) : (
                          <span className="text-red-500">Missing</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Refresh Token:</div>
                      <div>{tokenInfo.hasRefreshToken ? "Available" : "Missing"}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Expires:</div>
                      <div>{tokenInfo.expiresAt || "Unknown"}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Status:</div>
                      <div>
                        {tokenInfo.isExpired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge variant="success">Valid</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No token information found
                  </div>
                )}
              </div>
              
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="text-sm font-medium mb-2">Token Management</h3>
                <div className="text-sm text-gray-600 mb-4">
                  If you're experiencing token issues, you can clear stored tokens and reconnect.
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('ibkr-token');
                      setTokenInfo(null);
                      fetchConnectionHistory();
                    }}
                  >
                    Clear Saved Tokens
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="config">
            {connectionHistory?.configuration ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="text-sm font-medium mb-3">Connection Configuration</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Connection Method:</div>
                      <div>
                        <Badge>{connectionHistory.configuration.connectionMethod || 'unknown'}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Paper Trading:</div>
                      <div>{connectionHistory.configuration.paperTrading ? "Enabled" : "Disabled"}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Has Access Token:</div>
                      <div>{connectionHistory.configuration.hasToken ? "Yes" : "No"}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">WebAPI Config:</div>
                      <div>
                        {connectionHistory.configuration.configuredEndpoints.webapi ? (
                          <Badge variant="success">Configured</Badge>
                        ) : (
                          <Badge variant="destructive">Not Configured</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">TWS Config:</div>
                      <div>
                        {connectionHistory.configuration.configuredEndpoints.tws ? (
                          <Badge variant="success">Configured</Badge>
                        ) : (
                          <Badge variant="destructive">Not Configured</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md bg-gray-50">
                  <h3 className="text-sm font-medium mb-2">Browser Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">User Agent:</div>
                      <div className="truncate">{navigator.userAgent}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Platform:</div>
                      <div>{navigator.platform}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Time Zone:</div>
                      <div>{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Current Time:</div>
                      <div>{new Date().toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Configuration information not available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        <div>
          {connectionHistory ? (
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          ) : (
            <span>Connection history not available</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default IBKRConnectionDebugger;
