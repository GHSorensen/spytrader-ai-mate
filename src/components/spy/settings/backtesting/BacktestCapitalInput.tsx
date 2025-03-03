
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BacktestCapitalInputProps {
  initialCapital: number;
  onInitialCapitalChange: (value: number) => void;
}

export const BacktestCapitalInput: React.FC<BacktestCapitalInputProps> = ({
  initialCapital,
  onInitialCapitalChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="initial-capital">Initial Capital ($)</Label>
      <Input 
        id="initial-capital" 
        type="number" 
        value={initialCapital}
        onChange={(e) => onInitialCapitalChange(Number(e.target.value))}
      />
    </div>
  );
};
