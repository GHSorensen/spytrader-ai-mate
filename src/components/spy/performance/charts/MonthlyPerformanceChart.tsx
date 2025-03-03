
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface MonthlyPerformanceChartProps {
  data: {
    month: string;
    return: number;
  }[];
}

export const MonthlyPerformanceChart: React.FC<MonthlyPerformanceChartProps> = ({ data }) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Monthly Performance</CardTitle>
        <CardDescription>Returns by month for the selected period</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Return']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Bar dataKey="return">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.return >= 0 ? "#10b981" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  );
};
