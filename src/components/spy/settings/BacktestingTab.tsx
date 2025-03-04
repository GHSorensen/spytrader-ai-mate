
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { LineChart, PlayCircle, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AITradingSettings, BacktestResult } from '@/lib/types/spy';
import { runBacktest } from '@/services/backtestingService';
import { createDefaultStrategy } from '@/lib/helpers/defaultStrategyHelper';

import { BacktestDateSettings } from './backtesting/BacktestDateSettings';
import { BacktestCapitalInput } from './backtesting/BacktestCapitalInput';
import { BacktestDataSourceSelect } from './backtesting/BacktestDataSourceSelect';
import { BacktestFeeSettings } from './backtesting/BacktestFeeSettings';
import { BacktestResultsCard } from './backtesting/BacktestResultsCard';
import { PaperTradingChallenges } from './backtesting/PaperTradingChallenges';

interface BacktestingTabProps {
  settings: AITradingSettings;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
}

export const BacktestingTab: React.FC<BacktestingTabProps> = ({
  settings,
  updateNestedSettings,
}) => {
  const [activeTab, setActiveTab] = useState<string>("backtesting");
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  const handleRunBacktest = async () => {
    try {
      setIsRunningBacktest(true);
      
      // Create a default strategy for testing
      const defaultStrategy = createDefaultStrategy();
      
      const result = await runBacktest(
        defaultStrategy,
        settings,
        settings.backtestingSettings.startDate,
        settings.backtestingSettings.endDate,
        settings.backtestingSettings.initialCapital,
        settings.backtestingSettings.includeCommissions,
        settings.backtestingSettings.commissionPerTrade,
        settings.backtestingSettings.includeTaxes,
        settings.backtestingSettings.taxRate
      );
      
      setBacktestResult(result);
      
      toast({
        title: "Backtest Completed",
        description: `Final capital: $${result.finalCapital.toLocaleString()} (${(result.annualizedReturn * 100).toFixed(2)}% annualized)`,
      });
    } catch (error) {
      console.error("Backtest error:", error);
      toast({
        title: "Backtest Error",
        description: "An error occurred while running the backtest",
        variant: "destructive",
      });
    } finally {
      setIsRunningBacktest(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="backtesting" className="flex items-center">
          <LineChart className="h-4 w-4 mr-2" />
          Historical Backtesting
        </TabsTrigger>
        <TabsTrigger value="paper-trading" className="flex items-center">
          <BarChart3 className="h-4 w-4 mr-2" />
          Paper Trading Tests
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="backtesting" className="space-y-4">
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
            <BacktestDateSettings 
              startDate={settings.backtestingSettings.startDate}
              endDate={settings.backtestingSettings.endDate}
              onStartDateChange={(date) => updateNestedSettings('backtestingSettings', 'startDate', date)}
              onEndDateChange={(date) => updateNestedSettings('backtestingSettings', 'endDate', date)}
            />
            
            <BacktestCapitalInput 
              initialCapital={settings.backtestingSettings.initialCapital}
              onInitialCapitalChange={(value) => updateNestedSettings('backtestingSettings', 'initialCapital', value)}
            />
            
            <BacktestDataSourceSelect 
              dataSource={settings.backtestingSettings.dataSource}
              onDataSourceChange={(value) => updateNestedSettings('backtestingSettings', 'dataSource', value)}
            />
            
            <Separator />
            
            <BacktestFeeSettings 
              includeCommissions={settings.backtestingSettings.includeCommissions}
              commissionPerTrade={settings.backtestingSettings.commissionPerTrade}
              includeTaxes={settings.backtestingSettings.includeTaxes}
              taxRate={settings.backtestingSettings.taxRate}
              onIncludeCommissionsChange={(checked) => updateNestedSettings('backtestingSettings', 'includeCommissions', checked)}
              onCommissionPerTradeChange={(value) => updateNestedSettings('backtestingSettings', 'commissionPerTrade', value)}
              onIncludeTaxesChange={(checked) => updateNestedSettings('backtestingSettings', 'includeTaxes', checked)}
              onTaxRateChange={(value) => updateNestedSettings('backtestingSettings', 'taxRate', value)}
            />
            
            <BacktestResultsCard backtestResult={backtestResult} />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleRunBacktest} 
              disabled={isRunningBacktest}
              className="w-full"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              {isRunningBacktest ? "Running Backtest..." : "Run Backtest"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="paper-trading" className="space-y-4">
        <PaperTradingChallenges />
      </TabsContent>
    </Tabs>
  );
};
