
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { PerformanceChartData } from '@/lib/types/spy';

interface DrawdownChartProps {
  equityCurve: PerformanceChartData['equityCurve'];
}

export const DrawdownChart: React.FC<DrawdownChartProps> = ({
  equityCurve
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={equityCurve}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
          dataKey="value" 
          stroke="#ef4444" 
          fillOpacity={1} 
          fill="url(#colorDrawdown)" 
          name="Portfolio Value"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
