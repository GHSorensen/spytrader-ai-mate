
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PerformanceMetrics } from '@/lib/types/spy';

interface BacktestMetricsSummaryProps {
  metrics: PerformanceMetrics;
}

export const BacktestMetricsSummary: React.FC<BacktestMetricsSummaryProps> = ({ metrics }) => {
  // Format monthly returns for the chart
  const monthlyReturnData = metrics.monthlyReturns.map(item => ({
    month: item.month,
    return: parseFloat((item.return * 100).toFixed(2))
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Return Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Net Profit</div>
                <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${metrics.netProfit.toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Return %</div>
                <div className={`text-2xl font-bold ${metrics.percentageReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metrics.percentageReturn.toFixed(2)}%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Profit Factor</div>
                <div className="text-2xl font-bold">
                  {metrics.profitFactor.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Kelly %</div>
                <div className="text-2xl font-bold">
                  {metrics.kellyPercentage.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Risk-Adjusted Returns</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted p-2 rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Sharpe</div>
                  <div className="text-base font-semibold">{metrics.sharpeRatio.toFixed(2)}</div>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Sortino</div>
                  <div className="text-base font-semibold">{metrics.sortinoRatio.toFixed(2)}</div>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Calmar</div>
                  <div className="text-base font-semibold">{metrics.calmarRatio.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Trade Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Total Trades</div>
                <div className="text-2xl font-bold">{metrics.totalTrades}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Win Rate</div>
                <div className="text-2xl font-bold">{(metrics.winRate * 100).toFixed(2)}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Avg Duration</div>
                <div className="text-2xl font-bold">
                  {metrics.averageDuration > 60 * 24 
                    ? `${(metrics.averageDuration / (60 * 24)).toFixed(1)}d` 
                    : `${(metrics.averageDuration / 60).toFixed(1)}h`}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-sm font-medium mb-1">Average Win</div>
                <div className="text-lg font-bold text-green-500">${metrics.averageWin.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Average Loss</div>
                <div className="text-lg font-bold text-red-500">${metrics.averageLoss.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Best Trade</div>
                <div className="text-lg font-bold text-green-500">${metrics.bestTrade.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Worst Trade</div>
                <div className="text-lg font-bold text-red-500">${metrics.worstTrade.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Consecutive Wins</div>
                <div className="text-lg font-bold">{metrics.consecutiveWins}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Consecutive Losses</div>
                <div className="text-lg font-bold">{metrics.consecutiveLosses}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Returns</CardTitle>
          <CardDescription>Performance breakdown by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyReturnData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Return']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar 
                  dataKey="return" 
                  fill="hsl(var(--primary))" 
                  name="Monthly Return"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
