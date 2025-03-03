
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BacktestEquityCurveProps {
  data: { date: Date; equity: number }[];
}

export const BacktestEquityCurve: React.FC<BacktestEquityCurveProps> = ({ data }) => {
  // Format data for recharts
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    equity: item.equity
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
            tickFormatter={(value) => {
              // Show fewer ticks for better readability
              if (chartData.indexOf(chartData.find(item => item.date === value)!) % Math.ceil(chartData.length / 10) === 0) {
                return value;
              }
              return '';
            }}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            width={80}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="equity" 
            stroke="hsl(var(--primary))" 
            fill="hsl(var(--primary) / 0.2)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
