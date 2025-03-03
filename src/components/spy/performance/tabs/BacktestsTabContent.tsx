
import React from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { BacktestResult } from '@/lib/types/spy';
import { BacktestEquityCurveChart } from '../charts/BacktestEquityCurveChart';
import { BacktestMonthlyReturnsChart } from '../charts/BacktestMonthlyReturnsChart';

interface BacktestsTabContentProps {
  backtestResults: BacktestResult[];
  selectedBacktest: string;
  onSelectBacktest: (id: string) => void;
  selectedBacktestData: BacktestResult;
}

export const BacktestsTabContent: React.FC<BacktestsTabContentProps> = ({
  backtestResults,
  selectedBacktest,
  onSelectBacktest,
  selectedBacktestData
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Backtest Results</h3>
        <Select value={selectedBacktest} onValueChange={onSelectBacktest}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            {backtestResults.map(result => (
              <SelectItem key={result.strategyId} value={result.strategyId}>
                {result.strategyName} ({result.riskProfile})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Net Profit</h3>
            <div className="text-2xl font-bold">${selectedBacktestData.performanceMetrics.netProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedBacktestData.performanceMetrics.percentageReturn}% return
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Win Rate</h3>
            <div className="text-2xl font-bold">{selectedBacktestData.performanceMetrics.winRate}%</div>
            <p className="text-xs text-muted-foreground">
              {selectedBacktestData.performanceMetrics.successfulTrades} / {selectedBacktestData.performanceMetrics.totalTrades} trades
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Max Drawdown</h3>
            <div className="text-2xl font-bold text-red-500">-{selectedBacktestData.maxDrawdown.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              ${selectedBacktestData.maxDrawdown.amount.toLocaleString()}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Sharpe Ratio</h3>
            <div className="text-2xl font-bold">{selectedBacktestData.performanceMetrics.sharpeRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted return
            </p>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2">Equity Curve</h3>
          <p className="text-sm text-muted-foreground mb-4">Portfolio value over the backtest period</p>
          <div className="h-96">
            <BacktestEquityCurveChart equityCurve={selectedBacktestData.equityCurve} />
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Monthly Returns</h3>
            <p className="text-sm text-muted-foreground mb-4">Performance by month during backtest</p>
            <div className="h-80">
              <BacktestMonthlyReturnsChart monthlyReturns={selectedBacktestData.performanceMetrics.monthlyReturns} />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
            <p className="text-sm text-muted-foreground mb-4">Detailed backtest statistics</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Trades:</span>
                  <span className="font-medium">{selectedBacktestData.performanceMetrics.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Win Rate:</span>
                  <span className="font-medium">{selectedBacktestData.performanceMetrics.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profit Factor:</span>
                  <span className="font-medium">{selectedBacktestData.performanceMetrics.profitFactor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Win:</span>
                  <span className="font-medium">{selectedBacktestData.performanceMetrics.averageWin}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Loss:</span>
                  <span className="font-medium">{selectedBacktestData.performanceMetrics.averageLoss}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best Trade:</span>
                  <span className="font-medium">{selectedBacktestData.performanceMetrics.bestTrade}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sharpe Ratio:</span>
                  <span className="font-medium">{selectedBacktestData.performanceMetrics.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sortino Ratio:</span>
                  <span className="font-medium">{selectedBacktestData.performanceMetrics.sortinoRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calmar Ratio:</span>
                  <span className="font-medium">{selectedBacktestData.performanceMetrics.calmarRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Drawdown:</span>
                  <span className="font-medium text-red-500">-{selectedBacktestData.maxDrawdown.percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annualized Return:</span>
                  <span className="font-medium">{selectedBacktestData.annualizedReturn}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">vs. Benchmark:</span>
                  <span className="font-medium text-green-500">+{selectedBacktestData.performanceMetrics.benchmarkComparison.outperformance}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
