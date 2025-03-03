
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { PositionSizingCard } from './risk/PositionSizingCard';
import { StopLossCard } from './risk/StopLossCard';
import { TakeProfitCard } from './risk/TakeProfitCard';
import { ConfidenceScoreCard } from './risk/ConfidenceScoreCard';
import { RiskMonitoringCard } from './risk/RiskMonitoringCard';
import { RiskLearningInsightsCard } from './risk/RiskLearningInsightsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, Shield, BarChart, Activity, Zap, RefreshCw } from 'lucide-react';
import { useRiskMonitoring } from '@/hooks/useRiskMonitoring';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface RiskManagementTabProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
  currentRiskTolerance: string;
}

export const RiskManagementTab: React.FC<RiskManagementTabProps> = ({
  settings,
  updateSettings,
  updateNestedSettings,
  currentRiskTolerance,
}) => {
  // Use our risk monitoring hook
  const {
    isLoading,
    latestSignals,
    latestActions,
    learningInsights,
    autoMode,
    performRiskMonitoring,
    toggleAutoMode
  } = useRiskMonitoring(settings, currentRiskTolerance as any);
  
  // Handle scan for risks
  const handleScanForRisks = () => {
    performRiskMonitoring();
    toast.success("Risk scan completed", {
      description: `${latestSignals.length} signals detected, ${latestActions.length} actions taken`,
    });
  };
  
  // Handle toggle auto mode
  const handleToggleAutoMode = () => {
    toggleAutoMode();
    toast.success(autoMode ? "Auto mode disabled" : "Auto mode enabled", {
      description: autoMode 
        ? "Real-time risk monitoring will be paused" 
        : "AI will automatically monitor and adjust risk in real-time",
    });
  };
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="mb-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="basic">Basic Risk Settings</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic Risk Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-2">
          <PositionSizingCard 
            positionSizing={settings.positionSizing}
            updateNestedSettings={updateNestedSettings}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StopLossCard 
              stopLossSettings={settings.stopLossSettings}
              updateNestedSettings={updateNestedSettings}
            />
            
            <TakeProfitCard 
              takeProfitSettings={settings.takeProfitSettings}
              updateNestedSettings={updateNestedSettings}
            />
          </div>
          
          <ConfidenceScoreCard 
            minimumConfidenceScore={settings.minimumConfidenceScore}
            updateSettings={updateSettings}
          />
          
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
        </TabsContent>
        
        <TabsContent value="dynamic" className="space-y-4 pt-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Automatic Risk Management
              </CardTitle>
              <CardDescription>
                Enable real-time monitoring and automatic risk adjustment based on market conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-risk-mode" className="mb-1 block">Automatic Risk Management</Label>
                  <p className="text-sm text-muted-foreground">
                    AI will continuously monitor the market and adjust risk in real-time
                  </p>
                </div>
                <Switch
                  id="auto-risk-mode"
                  checked={autoMode}
                  onCheckedChange={handleToggleAutoMode}
                />
              </div>
              
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleScanForRisks}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Scan for risks now</span>
                  {isLoading && <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="adjust-on-volatility" className="mb-1 block">Adjust on VIX Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically adjust risk based on volatility index changes
                  </p>
                </div>
                <Switch
                  id="adjust-on-volatility"
                  checked={settings.autoAdjustVolatility}
                  onCheckedChange={(checked) => updateSettings('autoAdjustVolatility', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smart-profit" className="mb-1 block">Smart Profit Taking</Label>
                  <p className="text-sm text-muted-foreground">
                    Dynamically adjust take-profit levels based on current market conditions
                  </p>
                </div>
                <Switch
                  id="smart-profit"
                  checked={settings.smartProfitTaking}
                  onCheckedChange={(checked) => updateSettings('smartProfitTaking', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="position-scaling" className="mb-1 block">Auto Position Scaling</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically scale in/out of positions based on changing market conditions
                  </p>
                </div>
                <Switch
                  id="position-scaling"
                  checked={settings.autoPositionScaling}
                  onCheckedChange={(checked) => updateSettings('autoPositionScaling', checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <RiskMonitoringCard 
            isLoading={isLoading}
            latestSignals={latestSignals}
            latestActions={latestActions}
          />
          
          <RiskLearningInsightsCard insights={learningInsights} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
