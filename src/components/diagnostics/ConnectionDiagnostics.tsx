
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIBKRConnectionMonitor } from '@/hooks/ibkr/useIBKRConnectionMonitor';
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { ConnectionHistoryEvent, ConnectionLogEntry } from '@/hooks/ibkr/connection-status/types';

const ConnectionDiagnostics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [updateTime, setUpdateTime] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
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

  // Periodically update connection status
  useEffect(() => {
    const interval = setInterval(() => {
      forceConnectionCheck();
      setUpdateTime(new Date());
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(interval);
  }, [forceConnectionCheck]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await forceConnectionCheck();
      setUpdateTime(new Date());
    } finally {
      setRefreshing(false);
    }
  };

  // Render a history event
  const renderHistoryEvent = (event: ConnectionHistoryEvent, index: number) => {
    let icon;
    let color;
    
    switch(event.event) {
      case 'connected':
      case 'reconnect_success':
        icon = <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
        color = 'bg-green-50 border-green-200';
        break;
      case 'disconnected':
      case 'reconnect_failure':
        icon = <AlertCircle className="h-3.5 w-3.5 text-red-600" />;
        color = 'bg-red-50 border-red-200';
        break;
      case 'reconnect_attempt':
        icon = <RefreshCw className="h-3.5 w-3.5 text-yellow-600" />;
        color = 'bg-yellow-50 border-yellow-200';
        break;
    }
    
    return (
      <div key={index} className={`text-xs p-2 rounded-md ${color} mb-1.5`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            {icon}
            <span className="font-medium">
              {event.event === 'connected' && 'Connected'}
              {event.event === 'disconnected' && 'Disconnected'}
              {event.event === 'reconnect_attempt' && 'Reconnect Attempt'}
              {event.event === 'reconnect_success' && 'Reconnect Success'}
              {event.event === 'reconnect_failure' && 'Reconnect Failed'}
            </span>
          </div>
          <span className="text-[10px] text-gray-500">
            {event.timestamp.toLocaleTimeString()}
          </span>
        </div>
        {event.details && (
          <div className="mt-1 text-[11px] text-gray-600">
            {event.details}
          </div>
        )}
      </div>
    );
  };

  // Render a log entry
  const renderLogEntry = (log: ConnectionLogEntry, index: number) => {
    let color;
    let icon;
    
    switch(log.level) {
      case 'error':
        color = 'bg-red-50 border-red-200 text-red-700';
        icon = <AlertCircle className="h-3.5 w-3.5 text-red-600" />;
        break;
      case 'warning':
        color = 'bg-yellow-50 border-yellow-200 text-yellow-700';
        icon = <AlertCircle className="h-3.5 w-3.5 text-yellow-600" />;
        break;
      case 'success':
        color = 'bg-green-50 border-green-200 text-green-700';
        icon = <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
        break;
      default:
        color = 'bg-blue-50 border-blue-200 text-blue-700';
        icon = <Clock className="h-3.5 w-3.5 text-blue-600" />;
    }
    
    return (
      <div key={index} className={`text-xs p-2 rounded-md ${color} mb-1.5`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            {icon}
            <span className="font-medium">
              {log.message}
            </span>
          </div>
          <span className="text-[10px] text-gray-500">
            {log.timestamp.toLocaleTimeString()}
          </span>
        </div>
        {log.data && (
          <div className="mt-1 text-[11px] overflow-hidden text-ellipsis">
            {typeof log.data === 'object' 
              ? JSON.stringify(log.data).slice(0, 100) + (JSON.stringify(log.data).length > 100 ? '...' : '')
              : String(log.data)}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Connection Diagnostics</span>
          <div className="flex items-center gap-2">
            <div className={`rounded-full h-2 w-2 ${isConnected ? 'bg-green-500' : isReconnecting ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-normal">
              {isConnected 
                ? `Connected (${dataSource})` 
                : isReconnecting 
                ? `Reconnecting (${reconnectAttempts})` 
                : 'Disconnected'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Last updated: {updateTime.toLocaleTimeString()}
          </div>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5">Refresh</span>
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => handleManualReconnect()}
              disabled={isReconnecting}
            >
              {isReconnecting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5">Reconnect</span>
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="history">Connection History</TabsTrigger>
            <TabsTrigger value="logs">Connection Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="history" className="pt-4">
            <ScrollArea className="h-[300px]">
              {connectionHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No connection history recorded</p>
              ) : (
                connectionHistory.slice().reverse().map((event, i) => renderHistoryEvent(event, i))
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="logs" className="pt-4">
            <ScrollArea className="h-[300px]">
              {connectionLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No connection logs recorded</p>
              ) : (
                connectionLogs.slice().reverse().map((log, i) => renderLogEntry(log, i))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConnectionDiagnostics;
