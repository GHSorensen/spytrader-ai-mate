
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccountBalanceProps {
  balance: number;
  dailyPnL: number;
  allTimePnL: number;
}

export const AccountBalance: React.FC<AccountBalanceProps> = ({
  balance,
  dailyPnL,
  allTimePnL
}) => {
  const isDailyPositive = dailyPnL > 0;
  const isAllTimePositive = allTimePnL > 0;
  
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Account Balance</h2>
          </div>
          
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold">
            ${balance.toLocaleString()}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-2 text-xs md:text-sm gap-2">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Daily:</span>
              <div className={cn("flex items-center", 
                isDailyPositive ? "text-emerald-500" : "text-red-500")}>
                {isDailyPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span className="font-medium">
                  ${Math.abs(dailyPnL).toLocaleString()}
                  <span className="text-xs md:text-sm">
                    ({isDailyPositive ? "+" : "-"}{Math.abs(dailyPnL / (balance - dailyPnL) * 100).toFixed(2)}%)
                  </span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">All Time:</span>
              <div className={cn("flex items-center", 
                isAllTimePositive ? "text-emerald-500" : "text-red-500")}>
                {isAllTimePositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span className="font-medium">
                  ${Math.abs(allTimePnL).toLocaleString()}
                  <span className="text-xs md:text-sm">
                    ({isAllTimePositive ? "+" : "-"}{Math.abs(allTimePnL / (balance - allTimePnL) * 100).toFixed(2)}%)
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountBalance;
