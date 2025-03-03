
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, AlertTriangle, TrendingUp, Percent } from 'lucide-react';
import { AITradingSettings } from '@/lib/types/spyOptions';

interface RiskManagementTabProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
}

export const RiskManagementTab: React.FC<RiskManagementTabProps> = ({
  settings,
  updateSettings,
  updateNestedSettings,
}) => {
  return (
    <div className="space-y-4">
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
              value={settings.positionSizing.type}
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
              {settings.positionSizing.type === 'fixed' 
                ? 'Amount per Trade ($)' 
                : settings.positionSizing.type === 'percentage'
                ? 'Portfolio Percentage (%)' 
                : 'Kelly Multiplier (0-1)'}
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.positionSizing.value]}
                min={settings.positionSizing.type === 'fixed' ? 100 : 1}
                max={settings.positionSizing.type === 'fixed' ? 10000 : settings.positionSizing.type === 'percentage' ? 20 : 1}
                step={settings.positionSizing.type === 'fixed' ? 100 : 0.05}
                onValueChange={(value) => updateNestedSettings('positionSizing', 'value', value[0])}
                className="flex-1"
              />
              <span className="w-16 text-center">
                {settings.positionSizing.type === 'fixed' 
                  ? `$${settings.positionSizing.value}` 
                  : settings.positionSizing.type === 'percentage'
                  ? `${settings.positionSizing.value}%` 
                  : settings.positionSizing.value.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                checked={settings.stopLossSettings.enabled}
                onCheckedChange={(checked) => updateNestedSettings('stopLossSettings', 'enabled', checked)}
              />
            </div>
            
            {settings.stopLossSettings.enabled && (
              <>
                <div className="space-y-2">
                  <Label>Stop Loss Type</Label>
                  <Select
                    value={settings.stopLossSettings.type}
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
                    {settings.stopLossSettings.type === 'fixed' 
                      ? 'Amount ($)' 
                      : settings.stopLossSettings.type === 'percentage'
                      ? 'Loss Percentage (%)' 
                      : 'ATR Multiple'}
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.stopLossSettings.value]}
                      min={settings.stopLossSettings.type === 'fixed' ? 50 : 5}
                      max={settings.stopLossSettings.type === 'fixed' ? 1000 : settings.stopLossSettings.type === 'percentage' ? 50 : 5}
                      step={settings.stopLossSettings.type === 'fixed' ? 50 : 1}
                      onValueChange={(value) => updateNestedSettings('stopLossSettings', 'value', value[0])}
                      className="flex-1"
                    />
                    <span className="w-16 text-center">
                      {settings.stopLossSettings.type === 'fixed' 
                        ? `$${settings.stopLossSettings.value}` 
                        : settings.stopLossSettings.type === 'percentage'
                        ? `${settings.stopLossSettings.value}%` 
                        : settings.stopLossSettings.value.toFixed(1)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
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
                checked={settings.takeProfitSettings.enabled}
                onCheckedChange={(checked) => updateNestedSettings('takeProfitSettings', 'enabled', checked)}
              />
            </div>
            
            {settings.takeProfitSettings.enabled && (
              <>
                <div className="space-y-2">
                  <Label>Take Profit Type</Label>
                  <Select
                    value={settings.takeProfitSettings.type}
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
                    {settings.takeProfitSettings.type === 'fixed' 
                      ? 'Amount ($)' 
                      : settings.takeProfitSettings.type === 'percentage'
                      ? 'Gain Percentage (%)' 
                      : 'Risk/Reward Ratio'}
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.takeProfitSettings.value]}
                      min={settings.takeProfitSettings.type === 'fixed' ? 50 : 10}
                      max={settings.takeProfitSettings.type === 'fixed' ? 2000 : settings.takeProfitSettings.type === 'percentage' ? 100 : 5}
                      step={settings.takeProfitSettings.type === 'fixed' ? 50 : settings.takeProfitSettings.type === 'percentage' ? 5 : 0.5}
                      onValueChange={(value) => updateNestedSettings('takeProfitSettings', 'value', value[0])}
                      className="flex-1"
                    />
                    <span className="w-16 text-center">
                      {settings.takeProfitSettings.type === 'fixed' 
                        ? `$${settings.takeProfitSettings.value}` 
                        : settings.takeProfitSettings.type === 'percentage'
                        ? `${settings.takeProfitSettings.value}%` 
                        : `${settings.takeProfitSettings.value}:1`}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            Minimum Confidence Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.minimumConfidenceScore * 100]}
                min={50}
                max={95}
                step={5}
                onValueChange={(value) => updateSettings('minimumConfidenceScore', value[0] / 100)}
                className="flex-1"
              />
              <span className="w-16 text-center">{settings.minimumConfidenceScore * 100}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              AI will only execute trades when confidence level meets or exceeds this threshold
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
