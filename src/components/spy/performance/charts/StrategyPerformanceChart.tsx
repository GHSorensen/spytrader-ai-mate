
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface StrategyData {
  strategyId: string;
  strategyName: string;
  trades: number;
  winRate: number;
  averageReturn: number;
  totalProfit: number;
}

interface StrategyPerformanceChartProps {
  strategies: StrategyData[];
}

export const StrategyPerformanceChart: React.FC<StrategyPerformanceChartProps> = ({ strategies }) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Strategy Performance</CardTitle>
        <CardDescription>Comparison of different trading strategies</CardDescription>
      </CardHeader>
      <CardContent className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={strategies}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="strategyName" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => `${value}%`} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="trades" name="Number of Trades" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="winRate" name="Win Rate (%)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  );
};
