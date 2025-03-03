
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnomalyTimeSeriesChartProps {
  data: Array<{ day: string; count: number }>;
}

const AnomalyTimeSeriesChart: React.FC<AnomalyTimeSeriesChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#82ca9d"
            activeDot={{ r: 8 }}
            name="Anomalies"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnomalyTimeSeriesChart;
