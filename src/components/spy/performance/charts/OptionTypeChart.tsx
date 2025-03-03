
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TradeAnalytics } from '@/lib/types/spy';

interface OptionTypeChartProps {
  optionTypes: TradeAnalytics['byOptionType'];
}

export const OptionTypeChart: React.FC<OptionTypeChartProps> = ({
  optionTypes
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={optionTypes}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(value) => `${value}%`} />
        <YAxis type="category" dataKey="type" />
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Win Rate']}
        />
        <Legend />
        <Bar dataKey="winRate" name="Win Rate">
          {optionTypes.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.winRate >= 50 ? "#10b981" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
