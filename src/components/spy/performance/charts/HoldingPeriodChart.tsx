
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TradeAnalytics } from '@/lib/types/spy';

interface HoldingPeriodChartProps {
  holdingPeriods: TradeAnalytics['byHoldingPeriod'];
}

export const HoldingPeriodChart: React.FC<HoldingPeriodChartProps> = ({
  holdingPeriods
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={holdingPeriods}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => `${value}%`} />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="trades" name="Number of Trades" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line yAxisId="right" type="monotone" dataKey="winRate" name="Win Rate (%)" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};
