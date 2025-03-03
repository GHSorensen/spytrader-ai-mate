
import React from 'react';
import { Card } from "@/components/ui/card";
import { TradeAnalytics } from '@/lib/types/spy';
import { StrategyTradesChart } from '../charts/StrategyTradesChart';
import { OptionTypeChart } from '../charts/OptionTypeChart';
import { ExpiryChart } from '../charts/ExpiryChart';
import { HoldingPeriodChart } from '../charts/HoldingPeriodChart';

interface TradeAnalysisTabContentProps {
  tradeAnalytics: TradeAnalytics;
}

export const TradeAnalysisTabContent: React.FC<TradeAnalysisTabContentProps> = ({
  tradeAnalytics
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2">Trades by Strategy</h3>
          <p className="text-sm text-muted-foreground mb-4">Performance breakdown by trading strategy</p>
          <div className="h-96">
            <StrategyTradesChart strategies={tradeAnalytics.byStrategy} />
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Trades by Option Type</h3>
            <p className="text-sm text-muted-foreground mb-4">Performance breakdown by call vs put options</p>
            <div className="h-80">
              <OptionTypeChart optionTypes={tradeAnalytics.byOptionType} />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Trades by Expiry</h3>
            <p className="text-sm text-muted-foreground mb-4">Performance breakdown by option expiration</p>
            <div className="h-80">
              <ExpiryChart expiryData={tradeAnalytics.byExpiry} />
            </div>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2">Holding Period Analysis</h3>
          <p className="text-sm text-muted-foreground mb-4">Performance by trade duration</p>
          <div className="h-80">
            <HoldingPeriodChart holdingPeriods={tradeAnalytics.byHoldingPeriod} />
          </div>
        </div>
      </Card>
    </div>
  );
};
