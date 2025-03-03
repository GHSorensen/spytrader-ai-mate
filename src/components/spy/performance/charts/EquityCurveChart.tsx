
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { PerformanceChartData } from '@/lib/types/spy';

interface EquityCurveChartProps {
  equityCurve: PerformanceChartData['equityCurve'];
}

export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ equityCurve }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={equityCurve}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
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
        <Legend />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#8884d8" 
          fillOpacity={1} 
          fill="url(#colorValue)" 
          name="Portfolio"
        />
        <Area 
          type="monotone" 
          dataKey="benchmarkValue" 
          stroke="#82ca9d" 
          fillOpacity={1} 
          fill="url(#colorBenchmark)" 
          name="SPY Benchmark"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
