
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, RefreshCw, Info, WifiOff, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useIBKRConnectionMonitor } from '@/hooks/ibkr/useIBKRConnectionMonitor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ConnectionMonitorProps {
  showDetails?: boolean;
  className?: string;
  onConnectionChange?: (status: { isConnected: boolean; dataSource: 'live' | 'delayed' | 'mock' }) => void;
}

const ConnectionMonitor: React.FC<ConnectionMonitorProps> = ({ 
  showDetails = false,
  className = '',
  onConnectionChange
}) => {
  const {
    isConnected,
    dataSource,
    isReconnecting,
    reconnectAttempts,
    connectionLostTime,
    connectionHistory,
    handleManualReconnect,
    forceConnectionCheck,
    getDetailedDiagnostics
  } = useIBKRConnectionMonitor({
    onStatusChange: onConnectionChange
  });

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [timeSinceConnection, setTimeSinceConnection] = useState<string>('');

  // Update time since connection loss
  useEffect(() => {
    if (!connectionLostTime) {
      setTimeSinceConnection('');
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diff = now.getTime() - connectionLostTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setTimeSinceConnection(
        minutes > 0 
          ? `${minutes}m ${seconds}s ago` 
          : `${seconds}s ago`
      );
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timer);
  }, [connectionLostTime]);

  // Status badge based on connection state
  const getStatusBadge = () => {
    if (isReconnecting) {
      return (
        <Badge variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-800 gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Reconnecting</span>
        </Badge>
      );
    }

    if (isConnected) {
      return (
        <Badge variant="outline" className="bg-green-50 border-green-300 text-green-800 gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>{dataSource === 'live' ? 'Live' : dataSource === 'delayed' ? 'Delayed' : 'Mock'}</span>
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-red-50 border-red-300 text-red-800 gap-1">
        <WifiOff className="h-3 w-3" />
        <span>Disconnected</span>
      </Badge>
    );
  };

  // Handle diagnostic info sharing
  const handleShareDiagnostics = () => {
    const diagnostics = getDetailedDiagnostics();
    console.log('[ConnectionMonitor] Connection diagnostics:', diagnostics);
    
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2))
      .then(() => {
        toast.success("Diagnostics Copied", {
          description: "Diagnostics information has been copied to clipboard.",
        });
      })
      .catch(err => {
        console.error('Failed to copy diagnostics:', err);
        toast.error("Failed to Copy", {
          description: "Please check console for diagnostic information.",
        });
      });
  };

  // Simple indicator component for compact display
  if (!showDetails) {
    return (
      <button
        onClick={() => setIsDetailsOpen(true)}
        className={`flex items-center gap-2 px-3 py-1 rounded-full hover:bg-opacity-80 ${className} ${
          isConnected 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : isReconnecting
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}
      >
        {isConnected ? (
          <CheckCircle className="h-3.5 w-3.5" />
        ) : isReconnecting ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5" />
        )}
        <span className="text-xs font-medium">
          {isConnected 
            ? dataSource === 'live' ? 'Live' : dataSource === 'delayed' ? 'Delayed' : 'Connected'
            : isReconnecting 
            ? 'Reconnecting'
            : 'Disconnected'}
        </span>
        
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Connection Status</DialogTitle>
              <DialogDescription>
                Details about your Interactive Brokers connection
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  {getStatusBadge()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isReconnecting}
                  onClick={handleManualReconnect}
                >
                  {isReconnecting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
                      Reconnecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-2" />
                      Reconnect
                    </>
                  )}
                </Button>
              </div>
              
              {!isConnected && reconnectAttempts > 0 && (
                <div className="flex items-center gap-2 mb-4 text-yellow-700 text-sm">
                  <Activity className="h-4 w-4" />
                  <span>Reconnect attempts: {reconnectAttempts}</span>
                </div>
              )}
              
              {connectionLostTime && (
                <div className="flex items-center gap-2 mb-4 text-red-700 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Connection lost {timeSinceConnection}</span>
                </div>
              )}
              
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={handleShareDiagnostics}
              >
                <Info className="h-3.5 w-3.5 mr-2" />
                Copy Diagnostic Info
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </button>
    );
  }

  // Full card component for detailed display
  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Interactive Brokers Connection</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {isConnected 
            ? `Connected to ${dataSource} market data`
            : isReconnecting
            ? `Attempting to reconnect (${reconnectAttempts} attempts)`
            : 'Not connected to Interactive Brokers'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isConnected && connectionLostTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Connection lost {timeSinceConnection}</span>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              size="sm"
              disabled={isReconnecting}
              onClick={handleManualReconnect}
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
              onClick={forceConnectionCheck}
            >
              Check Status
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Connection Details</DialogTitle>
                  <DialogDescription>
                    Detailed IBKR connection information and history
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Current Status</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Connection:</div>
                      <div className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</div>
                      
                      <div className="text-muted-foreground">Data Source:</div>
                      <div className="font-medium">{dataSource}</div>
                      
                      {reconnectAttempts > 0 && (
                        <>
                          <div className="text-muted-foreground">Reconnect Attempts:</div>
                          <div className="font-medium">{reconnectAttempts}</div>
                        </>
                      )}
                      
                      {connectionLostTime && (
                        <>
                          <div className="text-muted-foreground">Connection Lost:</div>
                          <div className="font-medium">{connectionLostTime.toLocaleTimeString()}</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Connection History</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {connectionHistory.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No connection events recorded</p>
                      ) : (
                        connectionHistory.slice().reverse().map((event, i) => (
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
                        ))
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={handleShareDiagnostics}
                  >
                    Copy Diagnostic Info
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionMonitor;
