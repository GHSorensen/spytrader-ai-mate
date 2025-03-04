
import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { IBKRStatusIndicator } from '@/components/ibkr/IBKRStatusIndicator';
import { toast } from "sonner";
import { useAccountBalance } from '@/hooks/useAccountBalance';

interface TradePageHeaderProps {
  isAuthenticated: boolean;
  isPending: boolean;
  onCreateTestTrade: () => void;
  onRefreshTrades: () => void;
  isLoading: boolean;
}

const TradePageHeader: React.FC<TradePageHeaderProps> = ({
  isAuthenticated,
  isPending,
  onCreateTestTrade,
  onRefreshTrades,
  isLoading
}) => {
  const accountData = useAccountBalance();

  const onRefreshBalance = useCallback(() => {
    console.log("Refreshing account balance", "Authentication state:", accountData.isAuthenticated);
    try {
      accountData.refreshBalance?.();
    } catch (error) {
      console.error("Error refreshing balance:", error);
      toast.error("Failed to refresh account balance");
    }
  }, [accountData]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Trades</h1>
        <p className="text-sm text-muted-foreground">
          Manage your trading activity and orders
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
        <div className="px-2 md:px-3 py-1 rounded-md bg-muted text-xs md:text-sm flex items-center">
          <span>Balance: ${accountData.balance?.toLocaleString() || "0"}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 md:h-6 md:w-6 ml-1"
            onClick={onRefreshBalance}
            disabled={accountData.isLoading}
          >
            <RefreshCw className={`h-3 w-3 ${accountData.isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <IBKRStatusIndicator showDetails={true} />
        {isAuthenticated && (
          <>
            <Button 
              onClick={onCreateTestTrade} 
              disabled={isPending}
              size="sm"
              className="flex items-center gap-1 text-xs md:text-sm"
            >
              <PlusCircle className="h-3 w-3 md:h-4 md:w-4" />
              {isPending ? "Creating..." : "Create Test Trade"}
            </Button>
            <Button
              onClick={onRefreshTrades}
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-xs md:text-sm"
            >
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TradePageHeader;
