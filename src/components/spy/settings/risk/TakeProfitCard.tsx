
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AITradingSettings } from '@/lib/types/spy';

interface TakeProfitCardProps {
  takeProfitSettings: AITradingSettings['takeProfitSettings'];
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
}

export const TakeProfitCard: React.FC<TakeProfitCardProps> = ({
  takeProfitSettings,
  updateNestedSettings,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-positive" />
          Take Profit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="take-profit-switch">Enable Take Profit</Label>
          <Switch
            id="take-profit-switch"
            checked={takeProfitSettings.enabled}
            onCheckedChange={(checked) => updateNestedSettings('takeProfitSettings', 'enabled', checked)}
          />
        </div>
        
        {takeProfitSettings.enabled && (
          <>
            <div className="space-y-2">
              <Label>Take Profit Type</Label>
              <Select
                value={takeProfitSettings.type}
                onValueChange={(value) => updateNestedSettings('takeProfitSettings', 'type', value as 'fixed' | 'percentage' | 'risk-reward')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select take profit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Dollar Amount</SelectItem>
                  <SelectItem value="percentage">Percentage Gain</SelectItem>
                  <SelectItem value="risk-reward">Risk/Reward Ratio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>
                {takeProfitSettings.type === 'fixed' 
                  ? 'Amount ($)' 
                  : takeProfitSettings.type === 'percentage'
                  ? 'Gain Percentage (%)' 
                  : 'Risk/Reward Ratio'}
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[takeProfitSettings.value]}
                  min={takeProfitSettings.type === 'fixed' ? 50 : 10}
                  max={takeProfitSettings.type === 'fixed' ? 2000 : takeProfitSettings.type === 'percentage' ? 100 : 5}
                  step={takeProfitSettings.type === 'fixed' ? 50 : takeProfitSettings.type === 'percentage' ? 5 : 0.5}
                  onValueChange={(value) => updateNestedSettings('takeProfitSettings', 'value', value[0])}
                  className="flex-1"
                />
                <span className="w-16 text-center">
                  {takeProfitSettings.type === 'fixed' 
                    ? `$${takeProfitSettings.value}` 
                    : takeProfitSettings.type === 'percentage'
                    ? `${takeProfitSettings.value}%` 
                    : `${takeProfitSettings.value}:1`}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
