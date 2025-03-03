
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Gauge, Clock } from 'lucide-react';
import { AITradingSettings, RiskToleranceType, TimeOfDayPreference } from '@/lib/types/spy';
import { strategyDescriptions } from './AISettingsTypes';

interface StrategyTabProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  currentRiskTolerance: RiskToleranceType;
  onRiskToleranceChange: (tolerance: RiskToleranceType) => void;
}

export const StrategyTab: React.FC<StrategyTabProps> = ({
  settings,
  updateSettings,
  currentRiskTolerance,
  onRiskToleranceChange,
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Risk Tolerance Profile
          </CardTitle>
          <CardDescription>
            Choose your preferred risk tolerance for AI trading strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={currentRiskTolerance} 
            onValueChange={(value) => onRiskToleranceChange(value as RiskToleranceType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select risk tolerance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            {strategyDescriptions[currentRiskTolerance]}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Trading Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Maximum Simultaneous Trades</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.maxSimultaneousTrades]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => updateSettings('maxSimultaneousTrades', value[0])}
                className="flex-1"
              />
              <span className="w-10 text-center">{settings.maxSimultaneousTrades}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Maximum Daily Trades</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.maxDailyTrades]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => updateSettings('maxDailyTrades', value[0])}
                className="flex-1"
              />
              <span className="w-10 text-center">{settings.maxDailyTrades}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Timing Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Preferred Trading Time</Label>
            <Select
              value={settings.preferredTimeOfDay}
              onValueChange={(value) => updateSettings('preferredTimeOfDay', value as TimeOfDayPreference)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trading time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market-open">Market Open (9:30-11:00 AM)</SelectItem>
                <SelectItem value="midday">Midday (11:00 AM-2:00 PM)</SelectItem>
                <SelectItem value="market-close">Market Close (2:00-4:00 PM)</SelectItem>
                <SelectItem value="any">Any Time (Opportunistic)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              Different market hours have different volatility and liquidity characteristics
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
