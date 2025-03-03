
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeFrameOption } from './types';

interface TimeFrameSelectorProps {
  value: TimeFrameOption;
  onChange: (value: TimeFrameOption) => void;
}

const TimeFrameSelector: React.FC<TimeFrameSelectorProps> = ({ value, onChange }) => {
  return (
    <Select 
      value={value} 
      onValueChange={(value: TimeFrameOption) => onChange(value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time frame" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Last 7 Days</SelectItem>
        <SelectItem value="30d">Last 30 Days</SelectItem>
        <SelectItem value="90d">Last 90 Days</SelectItem>
        <SelectItem value="all">All Time</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TimeFrameSelector;
