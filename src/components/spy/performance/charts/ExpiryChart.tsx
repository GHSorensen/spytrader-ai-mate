
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
    <div className="w-full h-[300px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={expiryData}
          margin={{ 
            top: 5, 
            right: 20, 
            left: 5, 
            bottom: 20 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="expiry" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
            height={40}
          />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12 }}
            width={45}
          />
          <Tooltip formatter={(value) => [`${value}%`, 'Win Rate']} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          <Bar dataKey="winRate" name="Win Rate" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
