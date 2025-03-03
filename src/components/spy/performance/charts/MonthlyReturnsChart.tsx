
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface MonthlyReturnsChartProps {
  data: {
    month: string;
    return: number;
  }[];
}

export const MonthlyReturnsChart: React.FC<MonthlyReturnsChartProps> = ({ data }) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Monthly Returns</CardTitle>
        <CardDescription>Performance by month during backtest</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${value * 100}%`} />
            <Tooltip 
              formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, 'Return']}
            />
            <Legend />
            <Bar dataKey="return" name="Monthly Return" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  );
};
