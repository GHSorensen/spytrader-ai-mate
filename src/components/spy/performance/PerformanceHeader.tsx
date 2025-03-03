
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeFrame } from '@/lib/types/spy';

interface PerformanceHeaderProps {
  timeFrame: TimeFrame;
  onTimeFrameChange: (value: string) => void;
}

export const PerformanceHeader: React.FC<PerformanceHeaderProps> = ({
  timeFrame,
  onTimeFrameChange
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
        <p className="text-muted-foreground">
          Analyze your trading performance and strategy effectiveness
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={timeFrame} onValueChange={onTimeFrameChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">1 Day</SelectItem>
            <SelectItem value="1w">1 Week</SelectItem>
            <SelectItem value="1m">1 Month</SelectItem>
            <SelectItem value="3m">3 Months</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
