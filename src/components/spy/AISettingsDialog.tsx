
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  AITradingSettings, 
  RiskToleranceType, 
  MarketCondition, 
  TimeOfDayPreference 
} from '@/lib/types/spyOptions';
import { toast } from '@/components/ui/use-toast';
import { 
  AlertTriangle, 
  BarChart4, 
  Calendar, 
  Clock, 
  DollarSign, 
  Gauge, 
  Info, 
  LineChart, 
  Percent, 
  Shield, 
  TrendingUp 
} from 'lucide-react';

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
  positionSizing: {
    type: 'percentage',
    value: 5, // 5% of portfolio per trade
  },
  stopLossSettings: {
    enabled: true,
    type: 'percentage',
    value: 25, // 25% loss
  },
  takeProfitSettings: {
    enabled: true,
    type: 'risk-reward',
    value: 2, // 1:2 risk-reward ratio
  },
  marketConditionOverrides: {
    volatile: {
      enabled: true,
      adjustedRisk: 0.5, // reduce risk by 50% in volatile markets
    }
  },
  backtestingSettings: {
    startDate: new Date(new Date().getFullYear() - 10, 0, 1), // 10 years ago
    endDate: new Date(),
    initialCapital: 100000,
    dataSource: 'alpha-vantage',
    includeCommissions: true,
    commissionPerTrade: 0.65,
    includeTaxes: false,
    taxRate: 0.25,
  }
};

const strategyDescriptions = {
  conservative: 'Focuses on capital preservation with lower-risk trades, longer expirations, and strict stop losses. Targets 5-8% returns with high win rate.',
  moderate: 'Balanced approach with a mix of daily and weekly options. Targets 10-15% returns with moderate risk management.',
  aggressive: 'Seeks higher returns with shorter expirations and larger position sizes. May use leveraged strategies targeting 20%+ returns.',
};

const marketConditionDescriptions = {
  bullish: 'Trending upward market with positive momentum',
  bearish: 'Trending downward market with negative momentum',
  neutral: 'Sideways or range-bound market with low directional bias',
  volatile: 'High volatility market with sharp movements in both directions',
};

export const AISettingsDialog = ({
  open,
  onOpenChange,
  currentRiskTolerance,
  onRiskToleranceChange,
}: AISettingsDialogProps) => {
  const [settings, setSettings] = useState<AITradingSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('strategy');
  
  const updateSettings = <K extends keyof AITradingSettings>(
    key: K,
    value: AITradingSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedSettings = <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value,
      },
    }));
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>AI Trading Settings</DialogTitle>
          <DialogDescription>
            Configure how the AI agent manages your SPY options trades.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="pr-4 max-h-[calc(90vh-180px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="risk">Risk Management</TabsTrigger>
              <TabsTrigger value="market">Market Conditions</TabsTrigger>
              <TabsTrigger value="backtest">Backtesting</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="strategy" className="space-y-4 mt-4">
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
            </TabsContent>
            
            <TabsContent value="risk" className="space-y-4 mt-4">
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
            </TabsContent>
            
            <TabsContent value="market" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart4 className="h-5 w-5 text-primary" />
                    Market Condition Adjustments
                  </CardTitle>
                  <CardDescription>
                    Configure how the AI should adjust its strategy in different market conditions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(Object.keys(marketConditionDescriptions) as MarketCondition[]).map((condition) => (
                    <div key={condition} className="space-y-2 border rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium capitalize">{condition}</h4>
                          <p className="text-sm text-muted-foreground">
                            {marketConditionDescriptions[condition]}
                          </p>
                        </div>
                        <Switch
                          checked={settings.marketConditionOverrides[condition]?.enabled || false}
                          onCheckedChange={(checked) => {
                            const current = settings.marketConditionOverrides[condition] || { adjustedRisk: 0.8 };
                            setSettings((prev) => ({
                              ...prev,
                              marketConditionOverrides: {
                                ...prev.marketConditionOverrides,
                                [condition]: {
                                  ...current,
                                  enabled: checked,
                                },
                              },
                            }));
                          }}
                        />
                      </div>
                      
                      {settings.marketConditionOverrides[condition]?.enabled && (
                        <div className="space-y-2 pt-2">
                          <Label>Risk Adjustment ({((settings.marketConditionOverrides[condition]?.adjustedRisk || 0.8) * 100).toFixed(0)}%)</Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[(settings.marketConditionOverrides[condition]?.adjustedRisk || 0.8) * 100]}
                              min={10}
                              max={120}
                              step={5}
                              onValueChange={(value) => {
                                setSettings((prev) => ({
                                  ...prev,
                                  marketConditionOverrides: {
                                    ...prev.marketConditionOverrides,
                                    [condition]: {
                                      ...prev.marketConditionOverrides[condition],
                                      adjustedRisk: value[0] / 100,
                                    },
                                  },
                                }));
                              }}
                              className="flex-1"
                            />
                            <span className="w-16 text-center">
                              {((settings.marketConditionOverrides[condition]?.adjustedRisk || 0.8) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {(settings.marketConditionOverrides[condition]?.adjustedRisk || 0.8) > 1 
                              ? 'Increase risk compared to baseline strategy' 
                              : 'Reduce risk compared to baseline strategy'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="backtest" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    Backtesting Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure settings for strategy backtesting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backtest-start-date">Start Date</Label>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input 
                          id="backtest-start-date" 
                          type="date" 
                          value={settings.backtestingSettings.startDate.toISOString().split('T')[0]}
                          onChange={(e) => updateNestedSettings(
                            'backtestingSettings', 
                            'startDate', 
                            new Date(e.target.value)
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="backtest-end-date">End Date</Label>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input 
                          id="backtest-end-date" 
                          type="date" 
                          value={settings.backtestingSettings.endDate.toISOString().split('T')[0]}
                          onChange={(e) => updateNestedSettings(
                            'backtestingSettings', 
                            'endDate', 
                            new Date(e.target.value)
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="initial-capital">Initial Capital ($)</Label>
                    <Input 
                      id="initial-capital" 
                      type="number" 
                      value={settings.backtestingSettings.initialCapital}
                      onChange={(e) => updateNestedSettings(
                        'backtestingSettings', 
                        'initialCapital', 
                        Number(e.target.value)
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="data-source">Data Source</Label>
                    <Select
                      value={settings.backtestingSettings.dataSource}
                      onValueChange={(value) => updateNestedSettings('backtestingSettings', 'dataSource', value)}
                    >
                      <SelectTrigger id="data-source">
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alpha-vantage">Alpha Vantage</SelectItem>
                        <SelectItem value="yahoo-finance">Yahoo Finance</SelectItem>
                        <SelectItem value="cboe">CBOE Historical Data</SelectItem>
                        <SelectItem value="custom">Custom Data Source</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="include-commissions">Include Commissions</Label>
                        <div className="relative h-4 w-4 ml-1 group">
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          <div className="absolute bottom-6 left-0 w-48 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            Factor in broker commissions and fees for more realistic results
                          </div>
                        </div>
                      </div>
                      <Switch
                        id="include-commissions"
                        checked={settings.backtestingSettings.includeCommissions}
                        onCheckedChange={(checked) => updateNestedSettings('backtestingSettings', 'includeCommissions', checked)}
                      />
                    </div>
                    
                    {settings.backtestingSettings.includeCommissions && (
                      <div className="space-y-2 pl-4">
                        <Label htmlFor="commission-per-trade">Commission Per Trade ($)</Label>
                        <Input 
                          id="commission-per-trade" 
                          type="number" 
                          value={settings.backtestingSettings.commissionPerTrade}
                          onChange={(e) => updateNestedSettings(
                            'backtestingSettings', 
                            'commissionPerTrade', 
                            Number(e.target.value)
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="include-taxes">Include Taxes</Label>
                        <div className="relative h-4 w-4 ml-1 group">
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          <div className="absolute bottom-6 left-0 w-48 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            Factor in capital gains tax for a more realistic after-tax return
                          </div>
                        </div>
                      </div>
                      <Switch
                        id="include-taxes"
                        checked={settings.backtestingSettings.includeTaxes}
                        onCheckedChange={(checked) => updateNestedSettings('backtestingSettings', 'includeTaxes', checked)}
                      />
                    </div>
                    
                    {settings.backtestingSettings.includeTaxes && (
                      <div className="space-y-2 pl-4">
                        <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                        <Input 
                          id="tax-rate" 
                          type="number" 
                          value={settings.backtestingSettings.taxRate * 100}
                          onChange={(e) => updateNestedSettings(
                            'backtestingSettings', 
                            'taxRate', 
                            Number(e.target.value) / 100
                          )}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 mt-4">
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
            </TabsContent>
          </Tabs>
        </ScrollArea>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
