
import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { useIBKRRealTimeData } from '@/hooks/useIBKRRealTimeData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface IBKRStatusIndicatorProps {
  showDetails?: boolean;
}

const IBKRStatusIndicator: React.FC<IBKRStatusIndicatorProps> = ({ 
  showDetails = false 
}) => {
  const { isConnected, dataSource, refreshAllData, reconnect, lastUpdated } = useIBKRRealTimeData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [status, setStatus] = useState({
    connected: false,
    errorMessage: null as string | null,
    quotesDelayed: true,
    lastChecked: new Date()
  });

  // Check detailed status on mount and when connection changes
  useEffect(() => {
    const checkDetailedStatus = async () => {
      try {
        const provider = getDataProvider();
        
        if (provider && provider.isConnected()) {
          // If provider has status property, use it for detailed status
          const providerStatus = (provider as any).status || {
            connected: true,
            quotesDelayed: true,
            lastUpdated: new Date()
          };
          
          setStatus({
            connected: providerStatus.connected,
            errorMessage: providerStatus.errorMessage,
            quotesDelayed: providerStatus.quotesDelayed,
            lastChecked: providerStatus.lastUpdated || new Date()
          });
        } else {
          setStatus({
            connected: false,
            errorMessage: "Not connected to Interactive Brokers",
            quotesDelayed: true,
            lastChecked: new Date()
          });
        }
      } catch (error) {
        console.error("Error checking IBKR status:", error);
        setStatus({
          connected: false,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          quotesDelayed: true,
          lastChecked: new Date()
        });
      }
    };
    
    checkDetailedStatus();
  }, [isConnected]);

  // Format the last update time
  const formatTime = (date?: Date) => {
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
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
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
          onClick={() => setIsDialogOpen(true)}
        >
          {badgeProps.icon}
          {badgeProps.text}
        </Badge>
        
        {showDetails && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs"
            onClick={refreshAllData}
          >
            Refresh
          </Button>
        )}
      </div>
      
      {showDetails && isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Interactive Brokers Connection Status</DialogTitle>
              <DialogDescription>
                Details about your connection to Interactive Brokers
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-medium">Connection Status:</span>
                <span>{status.connected ? "Connected" : "Disconnected"}</span>
                
                <span className="font-medium">Data Type:</span>
                <span className="capitalize">{dataSource}</span>
                
                <span className="font-medium">Last Updated:</span>
                <span>{formatTime(lastUpdated)}</span>
                
                <span className="font-medium">Last Status Check:</span>
                <span>{formatTime(status.lastChecked)}</span>
              </div>
              
              {status.errorMessage && (
                <div className="bg-red-100 p-3 rounded-md text-red-800 text-sm">
                  <span className="font-medium">Error: </span>
                  {status.errorMessage}
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={reconnect}>
                  Reconnect
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default IBKRStatusIndicator;
