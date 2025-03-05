
import React, { useState } from 'react';
import { toast } from "sonner";
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { useIBKRRealTimeData } from '@/hooks/useIBKRRealTimeData';
import StatusBadge from './status/StatusBadge';
import ReconnectButton from './status/ReconnectButton';
import ConnectionDetailsDialog from './status/ConnectionDetailsDialog';
import useConnectionStatus from './status/useConnectionStatus';

interface IBKRStatusIndicatorProps {
  showDetails?: boolean;
  showTestLink?: boolean;
}

export const IBKRStatusIndicator: React.FC<IBKRStatusIndicatorProps> = ({ 
  showDetails = false,
  showTestLink = false
}) => {
  const { isConnected, dataSource, refreshAllData, reconnect, lastUpdated } = useIBKRRealTimeData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isAuthenticated, status, refreshing, setRefreshing, checkDetailedStatus } = useConnectionStatus();

  // Handle manual reconnect with better feedback
  const handleReconnect = async () => {
    try {
      setRefreshing(true);
      toast.info("Attempting to reconnect to Interactive Brokers...");
      
      await reconnect();
      
      // Force refresh provider status after reconnection attempt
      const provider = getDataProvider();
      if (!provider.isConnected()) {
        console.log("Reconnect didn't work, trying explicit connect");
        const connected = await provider.connect();
        if (connected) {
          toast.success("Successfully connected to Interactive Brokers");
        } else {
          toast.error("Failed to connect to Interactive Brokers");
        }
      }
      
      refreshAllData();
      checkDetailedStatus();
    } catch (error) {
      console.error("Error in reconnect:", error);
      toast.error(`Reconnection error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setRefreshing(false);
    }
  };
  
  return (
    <>
      <div className="flex items-center gap-2">
        <StatusBadge 
          isAuthenticated={isAuthenticated}
          isConnected={isConnected}
          dataSource={dataSource}
          onClick={() => setIsDialogOpen(true)}
        />
        
        {showDetails && (
          <ReconnectButton 
            isAuthenticated={isAuthenticated}
            isRefreshing={refreshing}
            onClick={handleReconnect}
          />
        )}
        
        {showTestLink && (
          <a 
            href="/ibkr-test" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary transition-colors ml-2"
          >
            Test Dashboard
          </a>
        )}
      </div>
      
      {showDetails && (
        <ConnectionDetailsDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          isAuthenticated={isAuthenticated}
          status={status}
          dataSource={dataSource}
          lastUpdated={lastUpdated}
          isRefreshing={refreshing}
          onReconnect={handleReconnect}
        />
      )}
    </>
  );
};

export default IBKRStatusIndicator;
