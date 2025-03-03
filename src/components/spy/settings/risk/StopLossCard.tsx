
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AITradingSettings } from '@/lib/types/spy';

interface StopLossCardProps {
  stopLossSettings: AITradingSettings['stopLossSettings'];
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
}

export const StopLossCard: React.FC<StopLossCardProps> = ({
  stopLossSettings,
  updateNestedSettings,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-negative" />
          Stop Loss
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="stop-loss-switch">Enable Stop Loss</Label>
          <Switch
            id="stop-loss-switch"
            checked={stopLossSettings.enabled}
            onCheckedChange={(checked) => updateNestedSettings('stopLossSettings', 'enabled', checked)}
          />
        </div>
        
        {stopLossSettings.enabled && (
          <>
            <div className="space-y-2">
              <Label>Stop Loss Type</Label>
              <Select
                value={stopLossSettings.type}
                onValueChange={(value) => updateNestedSettings('stopLossSettings', 'type', value as 'fixed' | 'percentage' | 'atr-based')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stop loss type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Dollar Amount</SelectItem>
                  <SelectItem value="percentage">Percentage Loss</SelectItem>
                  <SelectItem value="atr-based">ATR Multiple</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>
                {stopLossSettings.type === 'fixed' 
                  ? 'Amount ($)' 
                  : stopLossSettings.type === 'percentage'
                  ? 'Loss Percentage (%)' 
                  : 'ATR Multiple'}
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[stopLossSettings.value]}
                  min={stopLossSettings.type === 'fixed' ? 50 : 5}
                  max={stopLossSettings.type === 'fixed' ? 1000 : stopLossSettings.type === 'percentage' ? 50 : 5}
                  step={stopLossSettings.type === 'fixed' ? 50 : 1}
                  onValueChange={(value) => updateNestedSettings('stopLossSettings', 'value', value[0])}
                  className="flex-1"
                />
                <span className="w-16 text-center">
                  {stopLossSettings.type === 'fixed' 
                    ? `$${stopLossSettings.value}` 
                    : stopLossSettings.type === 'percentage'
                    ? `${stopLossSettings.value}%` 
                    : stopLossSettings.value.toFixed(1)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
