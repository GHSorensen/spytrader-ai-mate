
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DollarSign } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AITradingSettings } from '@/lib/types/spy';

interface PositionSizingCardProps {
  positionSizing: AITradingSettings['positionSizing'];
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
}

export const PositionSizingCard: React.FC<PositionSizingCardProps> = ({
  positionSizing,
  updateNestedSettings,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Position Sizing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Position Sizing Method</Label>
          <Select
            value={positionSizing.type}
            onValueChange={(value) => updateNestedSettings('positionSizing', 'type', value as 'fixed' | 'percentage' | 'kelly')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sizing method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Dollar Amount</SelectItem>
              <SelectItem value="percentage">Portfolio Percentage</SelectItem>
              <SelectItem value="kelly">Kelly Criterion</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>
            {positionSizing.type === 'fixed' 
              ? 'Amount per Trade ($)' 
              : positionSizing.type === 'percentage'
              ? 'Portfolio Percentage (%)' 
              : 'Kelly Multiplier (0-1)'}
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[positionSizing.value]}
              min={positionSizing.type === 'fixed' ? 100 : 1}
              max={positionSizing.type === 'fixed' ? 10000 : positionSizing.type === 'percentage' ? 20 : 1}
              step={positionSizing.type === 'fixed' ? 100 : 0.05}
              onValueChange={(value) => updateNestedSettings('positionSizing', 'value', value[0])}
              className="flex-1"
            />
            <span className="w-16 text-center">
              {positionSizing.type === 'fixed' 
                ? `$${positionSizing.value}` 
                : positionSizing.type === 'percentage'
                ? `${positionSizing.value}%` 
                : positionSizing.value.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
