
import React from 'react';
import { Card } from "@/components/ui/card";
import { PerformanceSummary, TradeAnalytics, PerformanceChartData } from '@/lib/types/spy';
import { EquityCurveChart } from '../charts/EquityCurveChart';
import { MonthlyPerformanceChart } from '../charts/MonthlyPerformanceChart';
import { ProfitDistributionChart } from '../charts/ProfitDistributionChart';
import { StrategyPerformanceChart } from '../charts/StrategyPerformanceChart';

interface OverviewTabContentProps {
  performanceSummary: PerformanceSummary;
  tradeAnalytics: TradeAnalytics;
  filteredData: {
    equityCurve: PerformanceChartData['equityCurve'];
    monthlyPerformance: PerformanceChartData['monthlyPerformance'];
    profitDistribution: PerformanceChartData['profitDistribution'];
  };
}

export const OverviewTabContent: React.FC<OverviewTabContentProps> = ({
  performanceSummary,
  tradeAnalytics,
  filteredData
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Profit</h3>
            <div className="text-2xl font-bold">${performanceSummary.allTime.profit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{performanceSummary.allTime.percentageChange}% all time
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Win Rate</h3>
            <div className="text-2xl font-bold">{performanceSummary.allTime.winRate}%</div>
            <p className="text-xs text-muted-foreground">
              {performanceSummary.allTime.totalTrades} total trades
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Today's P&L</h3>
            <div className="text-2xl font-bold">${performanceSummary.today.profit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {performanceSummary.today.percentageChange > 0 ? '+' : ''}{performanceSummary.today.percentageChange}% today
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Trades</h3>
            <div className="text-2xl font-bold">{performanceSummary.today.tradesOpened - performanceSummary.today.tradesClosed}</div>
            <p className="text-xs text-muted-foreground">
              {performanceSummary.today.tradesOpened} opened today
            </p>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2">Equity Curve</h3>
          <p className="text-sm text-muted-foreground mb-4">Portfolio value over time compared to SPY benchmark</p>
          <div className="h-96">
            <EquityCurveChart equityCurve={filteredData.equityCurve} />
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Monthly Performance</h3>
            <p className="text-sm text-muted-foreground mb-4">Returns by month for the selected period</p>
            <div className="h-80">
              <MonthlyPerformanceChart monthlyPerformance={filteredData.monthlyPerformance} />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Profit Distribution</h3>
            <p className="text-sm text-muted-foreground mb-4">Distribution of trade returns</p>
            <div className="h-80">
              <ProfitDistributionChart profitDistribution={filteredData.profitDistribution} />
            </div>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2">Strategy Performance</h3>
          <p className="text-sm text-muted-foreground mb-4">Comparison of different trading strategies</p>
          <div className="h-96">
            <StrategyPerformanceChart strategies={tradeAnalytics.byStrategy} />
          </div>
        </div>
      </Card>
    </div>
  );
};
