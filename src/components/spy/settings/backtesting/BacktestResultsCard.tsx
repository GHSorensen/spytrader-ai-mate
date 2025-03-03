
import React from 'react';
import { BacktestResult } from '@/lib/types/spy';

interface BacktestResultsCardProps {
  backtestResult: BacktestResult | null;
}

export const BacktestResultsCard: React.FC<BacktestResultsCardProps> = ({
  backtestResult
}) => {
  if (!backtestResult) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-muted rounded-md">
      <h3 className="font-semibold mb-2">Backtest Results</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Initial Capital:</span>
          <span className="font-medium">${backtestResult.initialCapital.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Final Capital:</span>
          <span className="font-medium">${backtestResult.finalCapital.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Return:</span>
          <span className={`font-medium ${backtestResult.finalCapital > backtestResult.initialCapital ? 'text-green-500' : 'text-red-500'}`}>
            {((backtestResult.finalCapital / backtestResult.initialCapital - 1) * 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Annualized Return:</span>
          <span className={`font-medium ${backtestResult.annualizedReturn > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {(backtestResult.annualizedReturn * 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Max Drawdown:</span>
          <span className="font-medium text-red-500">
            {backtestResult.maxDrawdown.percentage.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Sharpe Ratio:</span>
          <span className="font-medium">
            {backtestResult.performanceMetrics.sharpeRatio.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Win Rate:</span>
          <span className="font-medium">
            {(backtestResult.performanceMetrics.winRate * 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total Trades:</span>
          <span className="font-medium">{backtestResult.performanceMetrics.totalTrades}</span>
        </div>
      </div>
    </div>
  );
};
