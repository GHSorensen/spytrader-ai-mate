
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useIBKRConnectionMonitor } from '@/hooks/ibkr/useIBKRConnectionMonitor';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MiniConnectionStatusProps {
  className?: string;
  showTooltip?: boolean;
}

/**
 * Compact IBKR connection status indicator for headers/toolbars
 */
export const MiniConnectionStatus: React.FC<MiniConnectionStatusProps> = ({ 
  className = '', 
  showTooltip = true 
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const {
    isConnected,
    dataSource,
    isReconnecting,
    reconnectAttempts,
    connectionLostTime,
    connectionHistory,
    connectionLogs,
    handleManualReconnect,
    getDetailedDiagnostics
  } = useIBKRConnectionMonitor();

  const handleReconnectClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info("Attempting to reconnect...");
    await handleManualReconnect();
  };
  
  const handleCopyDiagnostics = () => {
    const diagnostics = getDetailedDiagnostics();
    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2))
      .then(() => toast.success("Diagnostics copied to clipboard"))
      .catch(() => toast.error("Failed to copy diagnostics"));
  };
  
  return (
    <>
      <button
        className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs ${className} ${
          isConnected 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : isReconnecting
            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        }`}
        onClick={() => setIsDetailsOpen(true)}
        title={showTooltip ? `IBKR Status: ${isConnected ? `Connected (${dataSource})` : isReconnecting ? 'Reconnecting...' : 'Disconnected'}` : ''}
      >
        {isConnected ? (
          <CheckCircle className="h-3 w-3" />
        ) : isReconnecting ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        <span className="font-medium">
          {isConnected 
            ? dataSource === 'live' ? 'Live' : dataSource === 'delayed' ? 'Delayed' : 'IBKR'
            : isReconnecting 
            ? 'Reconnecting'
            : 'Disconnected'}
        </span>
      </button>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>IBKR Connection Status</DialogTitle>
          </DialogHeader>
          
          <div className="py-2 space-y-4">
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div className="text-muted-foreground">Connection:</div>
              <div className="font-medium">{isConnected ? 'Connected' : isReconnecting ? 'Reconnecting...' : 'Disconnected'}</div>
              
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
            
            <h4 className="text-sm font-medium mb-1">Connection History</h4>
            <ScrollArea className="h-[100px] w-full rounded-md border p-1.5">
              {connectionHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground">No connection events recorded</p>
              ) : (
                <div className="space-y-1.5">
                  {connectionHistory.slice().reverse().map((event, i) => (
                    <div key={i} className="text-xs border-l-2 pl-2 py-0.5 border-gray-200">
                      <div className="font-medium">
                        {event.event === 'connected' && 'Connected'}
                        {event.event === 'disconnected' && 'Disconnected'}
                        {event.event === 'reconnect_attempt' && 'Reconnect Attempt'}
                        {event.event === 'reconnect_success' && 'Reconnect Success'}
                        {event.event === 'reconnect_failure' && 'Reconnect Failed'}
                      </div>
                      <div className="text-muted-foreground text-[10px]">
                        <span>{event.timestamp.toLocaleTimeString()}</span>
                        {event.details && <span> - {event.details}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <h4 className="text-sm font-medium mb-1">Connection Logs</h4>
            <ScrollArea className="h-[150px] w-full rounded-md border p-1.5">
              {connectionLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No logs recorded</p>
              ) : (
                <div className="space-y-1.5">
                  {connectionLogs.slice().reverse().map((log, i) => (
                    <div 
                      key={i} 
                      className={`text-xs border-l-2 pl-2 py-0.5 
                        ${log.level === 'error' ? 'border-red-300'
                          : log.level === 'warning' ? 'border-yellow-300'
                          : log.level === 'success' ? 'border-green-300'
                          : 'border-blue-300'
                        }`
                      }
                    >
                      <div className={`font-medium 
                        ${log.level === 'error' ? 'text-red-700'
                          : log.level === 'warning' ? 'text-yellow-700'
                          : log.level === 'success' ? 'text-green-700'
                          : 'text-blue-700'
                        }`
                      }>
                        {log.message}
                      </div>
                      <div className="text-muted-foreground text-[10px] flex justify-between">
                        <span>{log.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReconnectClick}
              disabled={isReconnecting}
            >
              {isReconnecting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Reconnecting...
                </>
              ) : (
                'Force Reconnect'
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyDiagnostics}
            >
              Copy Diagnostics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MiniConnectionStatus;
