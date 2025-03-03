
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnomalyTypesChartProps {
  data: Array<{ type: string; count: number }>;
}

const AnomalyTypesChart: React.FC<AnomalyTypesChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Occurrences" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnomalyTypesChart;
