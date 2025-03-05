
import React, { useEffect, useState } from 'react';
import { useIBKRRealTimeData } from '@/hooks/useIBKRRealTimeData';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Clock, Wifi, WifiOff, RefreshCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ConnectionStatusMonitorProps {
  autoRefreshInterval?: number;
  showDetailedStatus?: boolean;
}

/**
 * Component that monitors IBKR connection status and provides
 * visual indicators and controls for connection management
 */
export const ConnectionStatusMonitor: React.FC<ConnectionStatusMonitorProps> = ({
  autoRefreshInterval = 60000, // 1 minute default refresh
  showDetailedStatus = false
}) => {
  const { 
    isConnected, 
    dataSource,
    connectionDiagnostics,
    isError,
    refreshAllData,
    forceConnectionCheck,
    reconnect,
    lastUpdated
  } = useIBKRRealTimeData();
  
  // Local component state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Auto-refresh data on interval
  useEffect(() => {
    if (!autoRefreshInterval || autoRefreshInterval <= 0) return;
    
    const interval = setInterval(() => {
      if (isConnected) {
        console.log("Auto-refreshing connection status");
        forceConnectionCheck();
      }
    }, autoRefreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefreshInterval, isConnected, forceConnectionCheck]);
  
  // Handle manual refresh with error handling
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshAllData();
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle reconnect with better feedback
  const handleReconnect = async () => {
    try {
      setIsReconnecting(true);
      await reconnect();
      
      // Force a refresh after reconnection
      await refreshAllData();
      
      toast.success("Reconnected successfully");
    } catch (error) {
      toast.error("Failed to reconnect", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsReconnecting(false);
    }
  };
  
  // Format the last update time
  const formatTime = (date?: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString();
  };
  
  // Get appropriate badge color and icon based on status
  const getBadgeProps = () => {
    if (!isConnected) {
      return {
        variant: "destructive" as const,
        icon: <WifiOff className="h-3 w-3 mr-1" />,
        text: "Disconnected"
      };
    }
    
    if (isError) {
      return {
        variant: "outline" as const,
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
        text: "Connection Error"
      };
    }
    
    if (dataSource === 'live') {
      return {
        variant: "default" as const,
        icon: <Wifi className="h-3 w-3 mr-1" />,
        text: "Live Data"
      };
    }
    
    if (dataSource === 'delayed') {
      return {
        variant: "secondary" as const,
        icon: <Clock className="h-3 w-3 mr-1" />,
        text: "Delayed Data"
      };
    }
    
    return {
      variant: "secondary" as const,
      icon: <AlertTriangle className="h-3 w-3 mr-1" />,
      text: "Mock Data"
    };
  };
  
  const badgeProps = getBadgeProps();
  
  return (
    <>
      <div className="flex items-center gap-2">
        <Badge 
          variant={badgeProps.variant}
          className="cursor-pointer"
          onClick={() => setShowDetails(true)}
        >
          {badgeProps.icon}
          {badgeProps.text}
        </Badge>
        
        {showDetailedStatus && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={handleReconnect}
              disabled={isReconnecting}
            >
              <RefreshCcw className={`h-3 w-3 mr-1 ${isReconnecting ? 'animate-spin' : ''}`} />
              {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
            </Button>
          </>
        )}
      </div>
      
      {showDetails && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connection Status</DialogTitle>
              <DialogDescription>
                Details about your connection to Interactive Brokers
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-medium">Connection Status:</span>
                <span>{isConnected ? "Connected" : "Disconnected"}</span>
                
                <span className="font-medium">Data Type:</span>
                <span className="capitalize">{dataSource}</span>
                
                <span className="font-medium">Last Updated:</span>
                <span>{formatTime(lastUpdated)}</span>
              </div>
              
              {connectionDiagnostics && (
                <div className="bg-gray-100 p-3 rounded-md text-sm">
                  <span className="font-medium">Diagnostics:</span>
                  <pre className="mt-1 text-xs overflow-auto">
                    {JSON.stringify(connectionDiagnostics, null, 2)}
                  </pre>
                </div>
              )}
              
              {isError && (
                <div className="bg-red-100 p-3 rounded-md text-red-800 text-sm">
                  <span className="font-medium">Error:</span> There was an error with your connection.
                  Please try reconnecting or refreshing your data.
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
                <Button 
                  variant="default"
                  onClick={handleReconnect}
                  disabled={isReconnecting}
                >
                  {isReconnecting ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                      Reconnecting...
                    </>
                  ) : (
                    <>Reconnect</>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ConnectionStatusMonitor;
