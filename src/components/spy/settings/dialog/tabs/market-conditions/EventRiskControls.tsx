
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle } from 'lucide-react';

interface EventRiskControlsProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
}

export const EventRiskControls: React.FC<EventRiskControlsProps> = ({
  settings,
  updateSettings
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Event-Based Risk Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="consider-earnings" className="mb-1 block">Consider Earnings Events</Label>
            <p className="text-sm text-muted-foreground">Adjust risk around earnings announcements</p>
          </div>
          <Switch
            id="consider-earnings"
            checked={settings.considerEarningsEvents}
            onCheckedChange={(checked) => updateSettings('considerEarningsEvents', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="consider-fed-meetings" className="mb-1 block">Consider Fed Meetings</Label>
            <p className="text-sm text-muted-foreground">Adapt strategy around Federal Reserve announcements</p>
          </div>
          <Switch
            id="consider-fed-meetings"
            checked={settings.considerFedMeetings}
            onCheckedChange={(checked) => updateSettings('considerFedMeetings', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="consider-economic-data" className="mb-1 block">Consider Economic Data</Label>
            <p className="text-sm text-muted-foreground">Adjust for major economic reports (CPI, GDP, etc.)</p>
          </div>
          <Switch
            id="consider-economic-data"
            checked={settings.considerEconomicData}
            onCheckedChange={(checked) => updateSettings('considerEconomicData', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="consider-geopolitical" className="mb-1 block">Consider Geopolitical Events</Label>
            <p className="text-sm text-muted-foreground">Adjust risk during major geopolitical developments</p>
          </div>
          <Switch
            id="consider-geopolitical"
            checked={settings.considerGeopoliticalEvents}
            onCheckedChange={(checked) => updateSettings('considerGeopoliticalEvents', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
