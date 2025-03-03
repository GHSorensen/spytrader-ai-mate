
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { PerformanceChartData } from '@/lib/types/spy';

interface MonthlyPerformanceChartProps {
  monthlyPerformance: PerformanceChartData['monthlyPerformance'];
}

export const MonthlyPerformanceChart: React.FC<MonthlyPerformanceChartProps> = ({ 
  monthlyPerformance 
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthlyPerformance}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${value}%`} />
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Return']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Bar dataKey="return" name="Monthly Return">
          {monthlyPerformance.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.return >= 0 ? "#10b981" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
