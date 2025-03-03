
import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BacktestDataSourceSelectProps {
  dataSource: string;
  onDataSourceChange: (value: string) => void;
}

export const BacktestDataSourceSelect: React.FC<BacktestDataSourceSelectProps> = ({
  dataSource,
  onDataSourceChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="data-source">Data Source</Label>
      <Select
        value={dataSource}
        onValueChange={onDataSourceChange}
      >
        <SelectTrigger id="data-source">
          <SelectValue placeholder="Select data source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alpha-vantage">Alpha Vantage</SelectItem>
          <SelectItem value="yahoo-finance">Yahoo Finance</SelectItem>
          <SelectItem value="cboe">CBOE Historical Data</SelectItem>
          <SelectItem value="custom">Custom Data Source</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
