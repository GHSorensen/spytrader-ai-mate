
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PerformanceMetrics } from '@/lib/types/spy';

interface BacktestMonthlyReturnsChartProps {
  monthlyReturns: PerformanceMetrics['monthlyReturns'];
}

export const BacktestMonthlyReturnsChart: React.FC<BacktestMonthlyReturnsChartProps> = ({
  monthlyReturns
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthlyReturns}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${value * 100}%`} />
        <Tooltip 
          formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, 'Return']}
        />
        <Legend />
        <Bar dataKey="return" name="Monthly Return" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};
