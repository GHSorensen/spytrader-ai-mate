
import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DrawdownsContentProps {
  equityCurve: {
    date: Date;
    value: number;
    benchmarkValue: number;
  }[];
  drawdowns: {
    startDate: Date;
    endDate: Date;
    duration: number;
    depthPercent: number;
    recoveryDays: number;
  }[];
}

export const DrawdownsContent: React.FC<DrawdownsContentProps> = ({ equityCurve, drawdowns }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Drawdown Analysis</CardTitle>
        <CardDescription>Historical drawdowns and recovery periods</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="h-96">
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
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-5 p-4 font-medium border-b">
              <div>Start Date</div>
              <div>End Date</div>
              <div>Duration (Days)</div>
              <div>Depth (%)</div>
              <div>Recovery (Days)</div>
            </div>
            {drawdowns.slice(0, 5).map((drawdown, index) => (
              <div key={index} className="grid grid-cols-5 p-4 border-b last:border-0">
                <div>{format(drawdown.startDate, 'MMM d, yyyy')}</div>
                <div>{format(drawdown.endDate, 'MMM d, yyyy')}</div>
                <div>{drawdown.duration}</div>
                <div className="text-red-500">-{drawdown.depthPercent}%</div>
                <div>{drawdown.recoveryDays}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
