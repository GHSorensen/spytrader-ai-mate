
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, RefreshCw, Clock, Zap, Database, FileText, TimerReset } from 'lucide-react';
import { useIBKRConnectionMonitor } from '@/hooks/ibkr/useIBKRConnectionMonitor';
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * A dedicated panel showing detailed IBKR connection status
 * with connection history and debugging options
 */
export const ConnectionStatusPanel: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  
  const {
    isConnected,
    dataSource,
    isReconnecting,
    reconnectAttempts,
    connectionLostTime,
    connectionHistory,
    connectionLogs,
    handleManualReconnect,
    forceConnectionCheck,
    getDetailedDiagnostics
  } = useIBKRConnectionMonitor();

  // Show time since last refresh
  const [timeSinceRefresh, setTimeSinceRefresh] = useState<string>('');
  
  // Update the time since refresh
  useEffect(() => {
    if (!lastRefreshTime) return;
    
    const updateTimer = () => {
      const now = new Date();
      const diff = now.getTime() - lastRefreshTime.getTime();
      const seconds = Math.floor(diff / 1000);
      setTimeSinceRefresh(seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds/60)}m ${seconds%60}s ago`);
    };
    
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [lastRefreshTime]);

  // Handle refresh click
  const handleRefreshClick = async () => {
    setLastRefreshTime(new Date());
    await forceConnectionCheck();
    toast.success("Connection status refreshed");
  };

  // Handle manual reconnect
  const handleReconnectClick = async () => {
    await handleManualReconnect();
    setLastRefreshTime(new Date());
  };
  
  // Handle diagnostics collection
  const handleCopyDiagnostics = () => {
    const diagnostics = getDetailedDiagnostics();
    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2))
      .then(() => toast.success("Diagnostics copied to clipboard"))
      .catch(() => toast.error("Failed to copy diagnostics"));
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>IBKR Connection Status</span>
          <Badge variant="outline" className={`
            ${isConnected 
              ? 'bg-green-50 border-green-300 text-green-800' 
              : isReconnecting 
              ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
              : 'bg-red-50 border-red-300 text-red-800'
            } gap-1
          `}>
            {isConnected ? (
              <><CheckCircle className="h-3.5 w-3.5" /> {dataSource === 'live' ? 'Live' : dataSource === 'delayed' ? 'Delayed' : 'Connected'}</>
            ) : isReconnecting ? (
              <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Reconnecting</>
            ) : (
              <><AlertCircle className="h-3.5 w-3.5" /> Disconnected</>
            )}
          </Badge>
        </CardTitle>
        <CardDescription>
          {isConnected 
            ? `Connected to ${dataSource} data`
            : isReconnecting
            ? `Attempting to reconnect (Attempt ${reconnectAttempts})`
            : 'No connection to Interactive Brokers'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isConnected && connectionLostTime && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <Clock className="h-4 w-4" />
              <span>Connection lost at {connectionLostTime.toLocaleTimeString()}</span>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              size="sm"
              disabled={isReconnecting}
              onClick={handleReconnectClick}
            >
              {isReconnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Reconnecting...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reconnect
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshClick}
            >
              <Zap className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
          
          {lastRefreshTime && (
            <div className="text-xs text-muted-foreground flex items-center mt-1">
              <TimerReset className="h-3 w-3 mr-1" />
              Last refreshed: {timeSinceRefresh}
            </div>
          )}
          
          {expanded && (
            <>
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Connection History</h4>
                  <ScrollArea className="h-[150px] w-full rounded-md border p-2">
                    {connectionHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No connection events recorded</p>
                    ) : (
                      <div className="space-y-2">
                        {connectionHistory.slice().reverse().map((event, i) => (
                          <div key={i} className="text-xs border-l-2 pl-2 py-1 border-gray-200">
                            <div className="font-medium">
                              {event.event === 'connected' && 'Connected'}
                              {event.event === 'disconnected' && 'Disconnected'}
                              {event.event === 'reconnect_attempt' && 'Reconnect Attempt'}
                              {event.event === 'reconnect_success' && 'Reconnect Successful'}
                              {event.event === 'reconnect_failure' && 'Reconnect Failed'}
                            </div>
                            <div className="text-muted-foreground flex justify-between">
                              <span>{event.timestamp.toLocaleTimeString()}</span>
                              {event.details && <span>{event.details}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleCopyDiagnostics}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Copy Diagnostic Info
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatusPanel;
