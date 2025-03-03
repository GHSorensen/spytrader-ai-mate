
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spyOptions';
import { toast } from '@/components/ui/use-toast';

interface AISettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRiskTolerance: RiskToleranceType;
  onRiskToleranceChange: (tolerance: RiskToleranceType) => void;
}

const DEFAULT_SETTINGS: AITradingSettings = {
  enabledStrategies: ['moderate'],
  maxSimultaneousTrades: 3,
  maxDailyTrades: 5,
  autoAdjustVolatility: true,
  useMarketSentiment: true,
  considerEarningsEvents: true,
  considerFedMeetings: true,
  enableHedging: false,
  minimumConfidenceScore: 0.65,
  preferredTimeOfDay: 'any',
};

export const AISettingsDialog = ({
  open,
  onOpenChange,
  currentRiskTolerance,
  onRiskToleranceChange,
}: AISettingsDialogProps) => {
  const [settings, setSettings] = useState<AITradingSettings>(DEFAULT_SETTINGS);
  
  const strategyDescriptions = {
    conservative: 'Focuses on capital preservation with lower-risk trades, longer expirations, and strict stop losses. Targets 5-8% returns with high win rate.',
    moderate: 'Balanced approach with a mix of daily and weekly options. Targets 10-15% returns with moderate risk management.',
    aggressive: 'Seeks higher returns with shorter expirations and larger position sizes. May use leveraged strategies targeting 20%+ returns.',
  };
  
  const handleSaveSettings = () => {
    // Here you would save the settings to your backend or local storage
    toast({
      title: "AI Settings Saved",
      description: "Your trading preferences have been updated",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Trading Settings</DialogTitle>
          <DialogDescription>
            Configure how the AI agent manages your SPY options trades.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="strategy" className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="strategy" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Risk Tolerance Profile</Label>
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
              </div>
              
              <div className="space-y-2">
                <Label>Maximum Simultaneous Trades</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.maxSimultaneousTrades]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setSettings({...settings, maxSimultaneousTrades: value[0]})}
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
                    onValueChange={(value) => setSettings({...settings, maxDailyTrades: value[0]})}
                    className="flex-1"
                  />
                  <span className="w-10 text-center">{settings.maxDailyTrades}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Preferred Trading Time</Label>
                <Select
                  value={settings.preferredTimeOfDay}
                  onValueChange={(value) => setSettings({...settings, preferredTimeOfDay: value})}
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
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="parameters" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Minimum AI Confidence Score</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.minimumConfidenceScore * 100]}
                    min={50}
                    max={95}
                    step={5}
                    onValueChange={(value) => setSettings({...settings, minimumConfidenceScore: value[0] / 100})}
                    className="flex-1"
                  />
                  <span className="w-10 text-center">{settings.minimumConfidenceScore * 100}%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  AI will only execute trades when confidence level meets or exceeds this threshold
                </p>
              </div>
              
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
                  onCheckedChange={(checked) => setSettings({...settings, autoAdjustVolatility: checked})}
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
                  onCheckedChange={(checked) => setSettings({...settings, enableHedging: checked})}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-4">
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
                  onCheckedChange={(checked) => setSettings({...settings, useMarketSentiment: checked})}
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
                  onCheckedChange={(checked) => setSettings({...settings, considerEarningsEvents: checked})}
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
                  onCheckedChange={(checked) => setSettings({...settings, considerFedMeetings: checked})}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
