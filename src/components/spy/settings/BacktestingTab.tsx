
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Info, LineChart, PlayCircle } from 'lucide-react';
import { AITradingSettings, BacktestResult } from '@/lib/types/spy';
import { runBacktest } from '@/services/backtestingService';
import { OptionExpiry } from '@/lib/types/spy/common';

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
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  const handleRunBacktest = async () => {
    try {
      setIsRunningBacktest(true);
      
      // Create a simple default strategy for testing
      const defaultStrategy = {
        id: "default-strategy",
        name: "Default Strategy",
        description: "A basic trading strategy for testing",
        isActive: true,
        riskLevel: 5,
        timeFrame: "1d",
        optionType: "BOTH" as const, // Type assertion to ensure it matches the expected type
        expiryPreference: ["weekly", "monthly"] as Array<OptionExpiry>, // Explicitly cast as mutable array of OptionExpiry
        deltaRange: [0.3, 0.7],
        maxPositionSize: 10,
        maxLossPerTrade: 25,
        profitTarget: 50,
        marketCondition: "neutral" as const,
        averageHoldingPeriod: 5,
        successRate: 0.6
      };
      
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
        
        {backtestResult && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h3 className="font-semibold mb-2">Backtest Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Initial Capital:</span>
                <span className="font-medium">${backtestResult.initialCapital.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Final Capital:</span>
                <span className="font-medium">${backtestResult.finalCapital.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Return:</span>
                <span className={`font-medium ${backtestResult.finalCapital > backtestResult.initialCapital ? 'text-green-500' : 'text-red-500'}`}>
                  {((backtestResult.finalCapital / backtestResult.initialCapital - 1) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Annualized Return:</span>
                <span className={`font-medium ${backtestResult.annualizedReturn > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(backtestResult.annualizedReturn * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max Drawdown:</span>
                <span className="font-medium text-red-500">
                  {backtestResult.maxDrawdown.percentage.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sharpe Ratio:</span>
                <span className="font-medium">
                  {backtestResult.performanceMetrics.sharpeRatio.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Win Rate:</span>
                <span className="font-medium">
                  {(backtestResult.performanceMetrics.winRate * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Trades:</span>
                <span className="font-medium">{backtestResult.performanceMetrics.totalTrades}</span>
              </div>
            </div>
          </div>
        )}
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
  );
};
