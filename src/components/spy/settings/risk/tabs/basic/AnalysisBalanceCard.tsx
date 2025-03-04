
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BarChart } from 'lucide-react';

interface AnalysisBalanceCardProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
}

export const AnalysisBalanceCard: React.FC<AnalysisBalanceCardProps> = ({
  settings,
  updateSettings
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Analysis Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Technical vs. Fundamental Analysis</Label>
          <Slider
            value={[settings.technicalFundamentalBalance]}
            min={0}
            max={100}
            step={10}
            onValueChange={(value) => updateSettings('technicalFundamentalBalance', value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100% Fundamental</span>
            <span>Balanced</span>
            <span>100% Technical</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Current: {settings.technicalFundamentalBalance}% technical focus
          </p>
        </div>
        
        <div className="space-y-2 pt-2">
          <Label>Short-term vs. Long-term Timeframe</Label>
          <Slider
            value={[settings.shortLongTimeframeBalance]}
            min={0}
            max={100}
            step={10}
            onValueChange={(value) => updateSettings('shortLongTimeframeBalance', value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Long-term</span>
            <span>Balanced</span>
            <span>Short-term</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Current: {settings.shortLongTimeframeBalance}% short-term focus
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
