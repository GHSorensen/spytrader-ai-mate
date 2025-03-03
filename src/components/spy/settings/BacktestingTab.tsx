
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Info, LineChart } from 'lucide-react';
import { AITradingSettings } from '@/lib/types/spyOptions';

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
      </CardContent>
    </Card>
  );
};
