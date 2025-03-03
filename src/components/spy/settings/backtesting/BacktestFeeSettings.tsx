
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Info } from 'lucide-react';

interface BacktestFeeSettingsProps {
  includeCommissions: boolean;
  commissionPerTrade: number;
  includeTaxes: boolean;
  taxRate: number;
  onIncludeCommissionsChange: (checked: boolean) => void;
  onCommissionPerTradeChange: (value: number) => void;
  onIncludeTaxesChange: (checked: boolean) => void;
  onTaxRateChange: (value: number) => void;
}

export const BacktestFeeSettings: React.FC<BacktestFeeSettingsProps> = ({
  includeCommissions,
  commissionPerTrade,
  includeTaxes,
  taxRate,
  onIncludeCommissionsChange,
  onCommissionPerTradeChange,
  onIncludeTaxesChange,
  onTaxRateChange
}) => {
  return (
    <>
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
            checked={includeCommissions}
            onCheckedChange={onIncludeCommissionsChange}
          />
        </div>
        
        {includeCommissions && (
          <div className="space-y-2 pl-4">
            <Label htmlFor="commission-per-trade">Commission Per Trade ($)</Label>
            <Input 
              id="commission-per-trade" 
              type="number" 
              value={commissionPerTrade}
              onChange={(e) => onCommissionPerTradeChange(Number(e.target.value))}
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
            checked={includeTaxes}
            onCheckedChange={onIncludeTaxesChange}
          />
        </div>
        
        {includeTaxes && (
          <div className="space-y-2 pl-4">
            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
            <Input 
              id="tax-rate" 
              type="number" 
              value={taxRate * 100}
              onChange={(e) => onTaxRateChange(Number(e.target.value) / 100)}
            />
          </div>
        )}
      </div>
    </>
  );
};
