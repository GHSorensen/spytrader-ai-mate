
import React from 'react';
import { Card } from "@/components/ui/card";
import { format } from 'date-fns';
import { PerformanceChartData } from '@/lib/types/spy';
import { DrawdownChart } from '../charts/DrawdownChart';

interface DrawdownsTabContentProps {
  equityCurve: PerformanceChartData['equityCurve'];
  drawdowns: PerformanceChartData['drawdowns'];
}

export const DrawdownsTabContent: React.FC<DrawdownsTabContentProps> = ({
  equityCurve,
  drawdowns
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2">Drawdown Analysis</h3>
          <p className="text-sm text-muted-foreground mb-4">Historical drawdowns and recovery periods</p>
          <div className="space-y-8">
            <div className="h-96">
              <DrawdownChart equityCurve={equityCurve} />
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
        </div>
      </Card>
    </div>
  );
};
