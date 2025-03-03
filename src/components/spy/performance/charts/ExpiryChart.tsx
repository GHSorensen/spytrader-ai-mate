
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TradeAnalytics } from '@/lib/types/spy';

interface ExpiryChartProps {
  expiryData: TradeAnalytics['byExpiry'];
}

export const ExpiryChart: React.FC<ExpiryChartProps> = ({
  expiryData
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={expiryData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="expiry" />
        <YAxis tickFormatter={(value) => `${value}%`} />
        <Tooltip formatter={(value) => [`${value}%`, 'Win Rate']} />
        <Legend />
        <Bar dataKey="winRate" name="Win Rate" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};
