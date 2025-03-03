
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface ProfitDistributionChartProps {
  data: {
    range: string;
    count: number;
  }[];
}

export const ProfitDistributionChart: React.FC<ProfitDistributionChartProps> = ({ data }) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Profit Distribution</CardTitle>
        <CardDescription>Distribution of trade returns</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="range" />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Number of Trades" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  );
};
