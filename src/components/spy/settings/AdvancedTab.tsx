
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AITradingSettings } from '@/lib/types/spyOptions';

interface AdvancedTabProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({
  settings,
  updateSettings,
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Market Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sentiment-switch" className="block">Use Market Sentiment Analysis</Label>
              <p className="text-sm text-muted-foreground">
                Incorporate social media and news sentiment into trading decisions
              </p>
            </div>
            <Switch
              id="sentiment-switch"
              checked={settings.useMarketSentiment}
              onCheckedChange={(checked) => updateSettings('useMarketSentiment', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="earnings-switch" className="block">Consider Earnings Events</Label>
              <p className="text-sm text-muted-foreground">
                Adjust strategy around earnings announcements of major S&P 500 components
              </p>
            </div>
            <Switch
              id="earnings-switch"
              checked={settings.considerEarningsEvents}
              onCheckedChange={(checked) => updateSettings('considerEarningsEvents', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="fed-switch" className="block">Consider Fed Meetings</Label>
              <p className="text-sm text-muted-foreground">
                Adjust strategy around Federal Reserve announcements
              </p>
            </div>
            <Switch
              id="fed-switch"
              checked={settings.considerFedMeetings}
              onCheckedChange={(checked) => updateSettings('considerFedMeetings', checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Volatility & Risk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-vol-switch" className="block">Auto-Adjust for Volatility</Label>
              <p className="text-sm text-muted-foreground">
                Automatically adjust position sizes during high volatility
              </p>
            </div>
            <Switch
              id="auto-vol-switch"
              checked={settings.autoAdjustVolatility}
              onCheckedChange={(checked) => updateSettings('autoAdjustVolatility', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="hedging-switch" className="block">Enable Hedging</Label>
              <p className="text-sm text-muted-foreground">
                AI will automatically create hedge positions to protect against market reversals
              </p>
            </div>
            <Switch
              id="hedging-switch"
              checked={settings.enableHedging}
              onCheckedChange={(checked) => updateSettings('enableHedging', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
