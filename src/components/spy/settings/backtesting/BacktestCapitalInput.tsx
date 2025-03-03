
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface BacktestCapitalInputProps {
  initialCapital: number;
  onInitialCapitalChange: (value: number) => void;
}

export const BacktestCapitalInput: React.FC<BacktestCapitalInputProps> = ({
  initialCapital,
  onInitialCapitalChange
}) => {
  // Define reasonable min/max values for the capital slider
  const minCapital = 1000;
  const maxCapital = 1000000;
  
  const handleSliderChange = (value: number[]) => {
    onInitialCapitalChange(value[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onInitialCapitalChange(value);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="initial-capital" className="text-base font-medium">
              Initial Capital ($)
            </Label>
            <div className="text-sm text-muted-foreground mb-4">
              The amount of capital to start your backtest with
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Input 
              id="initial-capital" 
              type="number" 
              min={0}
              className="w-32"
              value={initialCapital}
              onChange={handleInputChange}
            />
            <div className="font-medium">
              ${initialCapital.toLocaleString()}
            </div>
          </div>
          
          <div className="py-4">
            <Slider
              defaultValue={[initialCapital]}
              min={minCapital}
              max={maxCapital}
              step={1000}
              value={[initialCapital]}
              onValueChange={handleSliderChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>${minCapital.toLocaleString()}</span>
              <span>${maxCapital.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
