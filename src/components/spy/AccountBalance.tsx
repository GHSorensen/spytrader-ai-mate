
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign, LineChart, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccountBalanceProps {
  balance: number;
  dailyPnL: number;
  allTimePnL: number;
  isLoading?: boolean;
  lastUpdated?: string;
  error?: string | null;
}

export const AccountBalance: React.FC<AccountBalanceProps> = ({
  balance,
  dailyPnL,
  allTimePnL,
  isLoading = false,
  lastUpdated,
  error
}) => {
  const isDailyPositive = dailyPnL > 0;
  const isAllTimePositive = allTimePnL > 0;
  
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center gap-2 w-full text-center">
            <LineChart className="h-5 w-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Account Balance</h2>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center px-4 py-2">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2">
                ${balance.toLocaleString()}
              </div>
              
              {/* PnL information - redesigned for better mobile display */}
              <div className="grid grid-cols-2 w-full gap-4 mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">Daily:</span>
                  <div className={cn("flex items-center justify-center", 
                    isDailyPositive ? "text-emerald-500" : "text-red-500")}>
                    {isDailyPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                    <span className="font-medium text-sm md:text-base">
                      ${Math.abs(dailyPnL).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs">
                    ({isDailyPositive ? "+" : "-"}{Math.abs(dailyPnL / (balance - dailyPnL) * 100).toFixed(2)}%)
                  </span>
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">All Time:</span>
                  <div className={cn("flex items-center justify-center", 
                    isAllTimePositive ? "text-emerald-500" : "text-red-500")}>
                    {isAllTimePositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                    <span className="font-medium text-sm md:text-base">
                      ${Math.abs(allTimePnL).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs">
                    ({isAllTimePositive ? "+" : "-"}{Math.abs(allTimePnL / (balance - allTimePnL) * 100).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </>
          )}
          
          {lastUpdated && (
            <div className="text-xs text-muted-foreground mt-2">
              Last updated: {lastUpdated}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountBalance;
