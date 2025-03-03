
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceSummary } from '@/lib/types/spy';

interface PerformanceSummaryCardsProps {
  summary: PerformanceSummary;
}

export const PerformanceSummaryCards: React.FC<PerformanceSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.allTime.profit.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            +{summary.allTime.percentageChange}% all time
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.allTime.winRate}%</div>
          <p className="text-xs text-muted-foreground">
            {summary.allTime.totalTrades} total trades
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.today.profit.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {summary.today.percentageChange > 0 ? '+' : ''}{summary.today.percentageChange}% today
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.today.tradesOpened - summary.today.tradesClosed}</div>
          <p className="text-xs text-muted-foreground">
            {summary.today.tradesOpened} opened today
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
