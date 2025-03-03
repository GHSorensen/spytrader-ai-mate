
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PerformanceChartData } from '@/lib/types/spy';

interface ProfitDistributionChartProps {
  profitDistribution: PerformanceChartData['profitDistribution'];
}

export const ProfitDistributionChart: React.FC<ProfitDistributionChartProps> = ({
  profitDistribution
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={profitDistribution}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="range" />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" name="Number of Trades" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};
