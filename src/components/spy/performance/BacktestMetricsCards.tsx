
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { PerformanceMetrics } from '@/lib/types/spy';

interface BacktestMetricsCardsProps {
  metrics: PerformanceMetrics;
  maxDrawdown: {
    amount: number;
    percentage: number;
    startDate: Date;
    endDate: Date;
  };
}

export const BacktestMetricsCards: React.FC<BacktestMetricsCardsProps> = ({ metrics, maxDrawdown }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.netProfit.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.percentageReturn}% return
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.winRate}%</div>
          <p className="text-xs text-muted-foreground">
            {metrics.successfulTrades} / {metrics.totalTrades} trades
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">-{maxDrawdown.percentage}%</div>
          <p className="text-xs text-muted-foreground">
            ${maxDrawdown.amount.toLocaleString()}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Risk-adjusted return
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
