
import React from 'react';
import { PerformanceMetrics } from '@/lib/types/spy';

interface BacktestDetailsTableProps {
  metrics: PerformanceMetrics;
}

export const BacktestDetailsTable: React.FC<BacktestDetailsTableProps> = ({ metrics }) => {
  return (
    <>
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
        <div className="text-sm">Detailed backtest statistics</div>
      </div>
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Trades:</span>
              <span className="font-medium">{metrics.totalTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Win Rate:</span>
              <span className="font-medium">{metrics.winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit Factor:</span>
              <span className="font-medium">{metrics.profitFactor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Win:</span>
              <span className="font-medium">{metrics.averageWin}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Loss:</span>
              <span className="font-medium">{metrics.averageLoss}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best Trade:</span>
              <span className="font-medium">{metrics.bestTrade}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sharpe Ratio:</span>
              <span className="font-medium">{metrics.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sortino Ratio:</span>
              <span className="font-medium">{metrics.sortinoRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Calmar Ratio:</span>
              <span className="font-medium">{metrics.calmarRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Drawdown:</span>
              <span className="font-medium text-red-500">-{metrics.maxDrawdown}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Annualized Return:</span>
              <span className="font-medium">{metrics.percentageReturn}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">vs. Benchmark:</span>
              <span className="font-medium text-green-500">+{metrics.benchmarkComparison.outperformance}%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
