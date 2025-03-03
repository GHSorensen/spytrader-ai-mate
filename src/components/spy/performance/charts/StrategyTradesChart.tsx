
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TradeAnalytics } from '@/lib/types/spy';

interface StrategyTradesChartProps {
  strategies: TradeAnalytics['byStrategy'];
}

export const StrategyTradesChart: React.FC<StrategyTradesChartProps> = ({
  strategies
}) => {
  return (
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
        <Bar yAxisId="left" dataKey="totalProfit" name="Total Profit ($)" fill="#8884d8" />
        <Bar yAxisId="right" dataKey="winRate" name="Win Rate (%)" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};
