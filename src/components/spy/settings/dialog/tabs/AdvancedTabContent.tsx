
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Sliders, 
  BrainCircuit, 
  TimerReset, 
  LineChart, 
  AlertCircle, 
  Zap,
  Gauge,
  BarChart 
} from 'lucide-react';
import { ConfidenceScoreCard } from '../../risk/ConfidenceScoreCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <Tabs defaultValue="ai-features" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="ai-features">
            <BrainCircuit className="h-4 w-4 mr-2" />
            AI Features
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Zap className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="risk-factors">
            <AlertCircle className="h-4 w-4 mr-2" />
            Risk Factors
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-features" className="space-y-4">
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
              <CardDescription>
                Configure advanced AI capabilities for market analysis
              </CardDescription>
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
                  <Label htmlFor="adaptive-position-sizing">Adaptive Position Sizing</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically adjust position sizes based on volatility and confidence
                  </p>
                </div>
                <Switch
                  id="adaptive-position-sizing"
                  checked={settings.adaptivePositionSizing}
                  onCheckedChange={(checked) => updateSettings('adaptivePositionSizing', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="technical-analysis">Advanced Technical Analysis</Label>
                  <p className="text-sm text-muted-foreground">
                    Use machine learning for pattern recognition in technical indicators
                  </p>
                </div>
                <Switch
                  id="technical-analysis"
                  checked={settings.advancedTechnicalAnalysis}
                  onCheckedChange={(checked) => updateSettings('advancedTechnicalAnalysis', checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                Smart Analysis Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Technical vs. Fundamental Balance</Label>
                  <span className="text-sm font-medium">
                    {settings.technicalFundamentalBalance < 50 
                      ? `${100 - settings.technicalFundamentalBalance}% Fundamental` 
                      : `${settings.technicalFundamentalBalance}% Technical`}
                  </span>
                </div>
                <Slider
                  value={[settings.technicalFundamentalBalance]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => updateSettings('technicalFundamentalBalance', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Adjust the balance between technical and fundamental analysis in AI decision making
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Decision Timeframe Weighting</Label>
                  <span className="text-sm font-medium">
                    {settings.shortLongTimeframeBalance < 50 
                      ? `${100 - settings.shortLongTimeframeBalance}% Long-term` 
                      : `${settings.shortLongTimeframeBalance}% Short-term`}
                  </span>
                </div>
                <Slider
                  value={[settings.shortLongTimeframeBalance]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => updateSettings('shortLongTimeframeBalance', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Adjust how much weight is given to short vs long-term market factors
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="automation" className="space-y-4">
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
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Maximum Capital Deployment (%)</Label>
                  <span className="text-sm font-medium">{settings.maxCapitalDeployment}%</span>
                </div>
                <Slider
                  value={[settings.maxCapitalDeployment]}
                  min={10}
                  max={100}
                  step={5}
                  onValueChange={(value) => updateSettings('maxCapitalDeployment', value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum percentage of portfolio that can be deployed at once
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                Execution Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-scaling">Auto Position Scaling</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically scale in/out of positions based on market conditions
                  </p>
                </div>
                <Switch
                  id="auto-scaling"
                  checked={settings.autoPositionScaling}
                  onCheckedChange={(checked) => updateSettings('autoPositionScaling', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-profit-taking">Smart Profit Taking</Label>
                  <p className="text-sm text-muted-foreground">
                    Use AI to determine optimal profit taking levels dynamically
                  </p>
                </div>
                <Switch
                  id="auto-profit-taking"
                  checked={settings.smartProfitTaking}
                  onCheckedChange={(checked) => updateSettings('smartProfitTaking', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="risk-factors" className="space-y-4">
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
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="consider-economic-data">Economic Data Releases</Label>
                  <p className="text-sm text-muted-foreground">
                    Adjust strategy around major economic data releases
                  </p>
                </div>
                <Switch
                  id="consider-economic-data"
                  checked={settings.considerEconomicData}
                  onCheckedChange={(checked) => updateSettings('considerEconomicData', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="consider-geopolitical">Geopolitical Events</Label>
                  <p className="text-sm text-muted-foreground">
                    Adjust risk exposure based on major geopolitical developments
                  </p>
                </div>
                <Switch
                  id="consider-geopolitical"
                  checked={settings.considerGeopoliticalEvents}
                  onCheckedChange={(checked) => updateSettings('considerGeopoliticalEvents', checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                Risk Protection Thresholds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Daily Loss Limit (%)</Label>
                  <span className="text-sm font-medium">{settings.dailyLossLimitPct}%</span>
                </div>
                <Slider
                  value={[settings.dailyLossLimitPct]}
                  min={0.5}
                  max={5}
                  step={0.5}
                  onValueChange={(value) => updateSettings('dailyLossLimitPct', value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum allowable daily portfolio loss before halting trading
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Volatility Threshold</Label>
                  <span className="text-sm font-medium">{settings.volatilityThreshold}</span>
                </div>
                <Slider
                  value={[settings.volatilityThreshold]}
                  min={10}
                  max={40}
                  step={5}
                  onValueChange={(value) => updateSettings('volatilityThreshold', value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  VIX index level that triggers reduced position sizing
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
