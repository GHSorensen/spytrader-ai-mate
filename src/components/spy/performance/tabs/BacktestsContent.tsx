
import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BacktestResult } from '@/lib/types/spy';
import { BacktestMetricsCards } from '../BacktestMetricsCards';
import { BacktestDetailsTable } from '../BacktestDetailsTable';
import { MonthlyReturnsChart } from '../charts/MonthlyReturnsChart';

interface BacktestsContentProps {
  backtestResults: BacktestResult[];
  selectedBacktest: string;
  onSelectBacktest: (id: string) => void;
  selectedBacktestData: BacktestResult;
}

export const BacktestsContent: React.FC<BacktestsContentProps> = ({
  backtestResults,
  selectedBacktest,
  onSelectBacktest,
  selectedBacktestData
}) => {
  return (
    <>
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
      
      <BacktestMetricsCards metrics={selectedBacktestData.performanceMetrics} maxDrawdown={selectedBacktestData.maxDrawdown} />
      
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <CardDescription>Portfolio value over the backtest period</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={selectedBacktestData.equityCurve}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBacktest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
              />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                labelFormatter={(date) => format(new Date(date), 'PPP')}
              />
              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorBacktest)" 
                name="Portfolio Value"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <MonthlyReturnsChart data={selectedBacktestData.performanceMetrics.monthlyReturns} />
        </Card>
        
        <Card>
          <BacktestDetailsTable metrics={selectedBacktestData.performanceMetrics} />
        </Card>
      </div>
    </>
  );
};
