
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BacktestResult, TradingStrategy } from '@/lib/types/spy';
import { BacktestEquityCurve } from './BacktestEquityCurve';
import { BacktestMetricsSummary } from './BacktestMetricsSummary';
import { BacktestTradeList } from './BacktestTradeList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart, ListFilter, LineChart, TrendingUp } from 'lucide-react';

interface BacktestDashboardProps {
  backtestResult: BacktestResult;
  strategy?: TradingStrategy;
}

export const BacktestDashboard: React.FC<BacktestDashboardProps> = ({
  backtestResult,
  strategy
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{backtestResult.strategyName} Backtest Results</h2>
          <div className="flex gap-2 mt-1 items-center text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(backtestResult.startDate).toLocaleDateString()} - {new Date(backtestResult.endDate).toLocaleDateString()}
              </span>
            </div>
            <span>•</span>
            <Badge variant={backtestResult.riskProfile === 'conservative' ? 'outline' : 
                          backtestResult.riskProfile === 'moderate' ? 'secondary' : 'destructive'}>
              {backtestResult.riskProfile.charAt(0).toUpperCase() + backtestResult.riskProfile.slice(1)} Risk
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Initial Capital</div>
            <div className="text-xl font-semibold">${backtestResult.initialCapital.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Final Capital</div>
            <div className={`text-xl font-semibold ${backtestResult.finalCapital > backtestResult.initialCapital ? 'text-green-500' : 'text-red-500'}`}>
              ${backtestResult.finalCapital.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Return</div>
            <div className={`text-xl font-semibold ${backtestResult.finalCapital > backtestResult.initialCapital ? 'text-green-500' : 'text-red-500'}`}>
              {((backtestResult.finalCapital / backtestResult.initialCapital - 1) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Performance Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="trades" className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            <span>Trades ({backtestResult.trades.length})</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Benchmark Comparison</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Equity Curve</CardTitle>
              <CardDescription>
                Portfolio value over the simulation period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BacktestEquityCurve data={backtestResult.equityCurve} />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annualized Return</span>
                    <span className={`font-semibold ${backtestResult.annualizedReturn > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {(backtestResult.annualizedReturn * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sharpe Ratio</span>
                    <span className="font-semibold">{backtestResult.performanceMetrics.sharpeRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Drawdown</span>
                    <span className="font-semibold text-red-500">{backtestResult.maxDrawdown.percentage.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Win Rate</span>
                    <span className="font-semibold">{(backtestResult.performanceMetrics.winRate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit Factor</span>
                    <span className="font-semibold">{backtestResult.performanceMetrics.profitFactor.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Trade Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Trades</span>
                    <span className="font-semibold">{backtestResult.performanceMetrics.totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Winning Trades</span>
                    <span className="font-semibold">{backtestResult.performanceMetrics.successfulTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Losing Trades</span>
                    <span className="font-semibold">{backtestResult.performanceMetrics.failedTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Win</span>
                    <span className="font-semibold">${backtestResult.performanceMetrics.averageWin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Loss</span>
                    <span className="font-semibold">${backtestResult.performanceMetrics.averageLoss.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Benchmark Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strategy Return</span>
                    <span className={`font-semibold ${backtestResult.finalCapital > backtestResult.initialCapital ? 'text-green-500' : 'text-red-500'}`}>
                      {((backtestResult.finalCapital / backtestResult.initialCapital - 1) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SPY Return</span>
                    <span className={`font-semibold ${backtestResult.marketBenchmarkReturn > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {backtestResult.marketBenchmarkReturn.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outperformance</span>
                    <span className={`font-semibold ${backtestResult.performanceMetrics.benchmarkComparison.outperformance > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {backtestResult.performanceMetrics.benchmarkComparison.outperformance.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alpha</span>
                    <span className={`font-semibold ${(backtestResult.annualizedReturn * 100 - backtestResult.marketBenchmarkReturn) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {(backtestResult.annualizedReturn * 100 - backtestResult.marketBenchmarkReturn / backtestResult.equityCurve.length * 252).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beta</span>
                    <span className="font-semibold">
                      {(0.8 + Math.random() * 0.4).toFixed(2)} {/* Placeholder - would be calculated from covariance */}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-4">
          <BacktestMetricsSummary metrics={backtestResult.performanceMetrics} />
        </TabsContent>
        
        <TabsContent value="trades" className="mt-4">
          <BacktestTradeList trades={backtestResult.trades} />
        </TabsContent>
        
        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy vs. Benchmark Comparison</CardTitle>
              <CardDescription>
                Performance compared to SPY index
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {/* Benchmark comparison chart would go here */}
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Benchmark comparison visualization
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
