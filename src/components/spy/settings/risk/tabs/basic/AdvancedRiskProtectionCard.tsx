
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Shield } from 'lucide-react';

interface AdvancedRiskProtectionCardProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
}

export const AdvancedRiskProtectionCard: React.FC<AdvancedRiskProtectionCardProps> = ({
  settings,
  updateSettings
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Advanced Risk Protection
        </CardTitle>
        <CardDescription>
          Additional safeguards to protect your portfolio during adverse conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enable-hedging" className="mb-1 block">Enable Hedging</Label>
            <p className="text-sm text-muted-foreground">Automatically add hedge positions during high risk periods</p>
          </div>
          <Switch
            id="enable-hedging"
            checked={settings.enableHedging}
            onCheckedChange={(checked) => updateSettings('enableHedging', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="adaptive-position-sizing" className="mb-1 block">Adaptive Position Sizing</Label>
            <p className="text-sm text-muted-foreground">Dynamically adjust position size based on market conditions</p>
          </div>
          <Switch
            id="adaptive-position-sizing"
            checked={settings.adaptivePositionSizing}
            onCheckedChange={(checked) => updateSettings('adaptivePositionSizing', checked)}
          />
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Label>Max Capital Deployment (%)</Label>
            <span className="text-sm font-medium">{settings.maxCapitalDeployment}%</span>
          </div>
          <Slider
            value={[settings.maxCapitalDeployment]}
            min={10}
            max={100}
            step={5}
            onValueChange={(value) => updateSettings('maxCapitalDeployment', value[0])}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Maximum percentage of portfolio value that can be deployed at any time
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
