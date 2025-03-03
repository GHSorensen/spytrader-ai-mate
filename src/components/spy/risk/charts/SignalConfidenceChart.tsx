
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SignalConfidenceChartProps {
  data: Array<{ range: string; count: number }>;
}

const SignalConfidenceChart: React.FC<SignalConfidenceChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#ffc658" name="Signal Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SignalConfidenceChart;
