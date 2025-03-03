
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface ExpiryData {
  expiry: string;
  trades: number;
  winRate: number;
  averageReturn: number;
  totalProfit: number;
}

interface ExpiryChartProps {
  expiryData: ExpiryData[];
}

export const ExpiryChart: React.FC<ExpiryChartProps> = ({ expiryData }) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Trades by Expiry</CardTitle>
        <CardDescription>Performance breakdown by option expiration</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
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
      </CardContent>
    </>
  );
};
