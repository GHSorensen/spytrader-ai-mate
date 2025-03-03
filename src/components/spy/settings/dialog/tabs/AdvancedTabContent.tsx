
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Sliders, BrainCircuit, TimerReset, LineChart, AlertCircle } from 'lucide-react';
import { ConfidenceScoreCard } from '../../risk/ConfidenceScoreCard';

interface AdvancedTabContentProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
}

export const AdvancedTabContent: React.FC<AdvancedTabContentProps> = ({
  settings,
  updateSettings
}) => {
  return (
    <div className="space-y-6">
      <ConfidenceScoreCard 
        minimumConfidenceScore={settings.minimumConfidenceScore}
        updateSettings={updateSettings}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            AI Trading Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-adjust-volatility">Auto-Adjust Volatility</Label>
              <p className="text-sm text-muted-foreground">
                Dynamically adjust trading parameters based on market volatility
              </p>
            </div>
            <Switch
              id="auto-adjust-volatility"
              checked={settings.autoAdjustVolatility}
              onCheckedChange={(checked) => updateSettings('autoAdjustVolatility', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="use-market-sentiment">Use Market Sentiment</Label>
              <p className="text-sm text-muted-foreground">
                Factor in social media and news sentiment for trade decisions
              </p>
            </div>
            <Switch
              id="use-market-sentiment"
              checked={settings.useMarketSentiment}
              onCheckedChange={(checked) => updateSettings('useMarketSentiment', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-hedging">Enable Hedging</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create hedge positions to reduce risk in volatile markets
              </p>
            </div>
            <Switch
              id="enable-hedging"
              checked={settings.enableHedging}
              onCheckedChange={(checked) => updateSettings('enableHedging', checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Event Sensitivity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="consider-earnings">Consider Earnings Events</Label>
              <p className="text-sm text-muted-foreground">
                Adjust strategy around corporate earnings announcements
              </p>
            </div>
            <Switch
              id="consider-earnings"
              checked={settings.considerEarningsEvents}
              onCheckedChange={(checked) => updateSettings('considerEarningsEvents', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="consider-fed-meetings">Consider Fed Meetings</Label>
              <p className="text-sm text-muted-foreground">
                Adjust strategy around Federal Reserve announcements
              </p>
            </div>
            <Switch
              id="consider-fed-meetings"
              checked={settings.considerFedMeetings}
              onCheckedChange={(checked) => updateSettings('considerFedMeetings', checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TimerReset className="h-5 w-5 text-primary" />
            Trading Frequency Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Maximum Daily Trades</Label>
              <span className="text-sm font-medium">{settings.maxDailyTrades}</span>
            </div>
            <Slider
              value={[settings.maxDailyTrades]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => updateSettings('maxDailyTrades', value[0])}
            />
            <p className="text-sm text-muted-foreground">
              Limit the number of trades AI can execute in a single day
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Maximum Simultaneous Trades</Label>
              <span className="text-sm font-medium">{settings.maxSimultaneousTrades}</span>
            </div>
            <Slider
              value={[settings.maxSimultaneousTrades]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => updateSettings('maxSimultaneousTrades', value[0])}
            />
            <p className="text-sm text-muted-foreground">
              Limit how many positions can be open at once
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
