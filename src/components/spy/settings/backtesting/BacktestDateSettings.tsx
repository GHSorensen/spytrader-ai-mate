
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from 'lucide-react';

interface BacktestDateSettingsProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export const BacktestDateSettings: React.FC<BacktestDateSettingsProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="backtest-start-date">Start Date</Label>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input 
            id="backtest-start-date" 
            type="date" 
            value={startDate.toISOString().split('T')[0]}
            onChange={(e) => onStartDateChange(new Date(e.target.value))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="backtest-end-date">End Date</Label>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input 
            id="backtest-end-date" 
            type="date" 
            value={endDate.toISOString().split('T')[0]}
            onChange={(e) => onEndDateChange(new Date(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};
