
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface TradePageHeaderProps {
  isAuthenticated: boolean;
  isPending: boolean;
  onCreateTestTrade: () => void;
  onRefreshTrades: () => void;
  isLoading: boolean;
  isRetrying?: boolean;
  retryCount?: number;
}

const TradePageHeader: React.FC<TradePageHeaderProps> = ({
  isAuthenticated,
  isPending,
  onCreateTestTrade,
  onRefreshTrades,
  isLoading,
  isRetrying = false,
  retryCount = 0
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trades</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your current trades
          {isRetrying && <span className="ml-2 text-amber-600 text-sm">(Reconnecting... Attempt {retryCount})</span>}
        </p>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefreshTrades}
          disabled={isLoading || !isAuthenticated}
          className={isLoading ? "animate-pulse" : ""}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button 
          size="sm" 
          onClick={onCreateTestTrade}
          disabled={isPending || !isAuthenticated}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Test Trade
        </Button>
      </div>
    </div>
  );
};

export default TradePageHeader;
