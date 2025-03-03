
import React from 'react';
import { Card } from "@/components/ui/card";
import { TradeAnalytics } from '@/lib/types/spy';
import { StrategyTradesChart } from '../charts/StrategyTradesChart';
import { OptionTypeChart } from '../charts/OptionTypeChart';
import { ExpiryChart } from '../charts/ExpiryChart';
import { HoldingPeriodChart } from '../charts/HoldingPeriodChart';

interface TradeAnalysisContentProps {
  tradeAnalytics: TradeAnalytics;
}

export const TradeAnalysisContent: React.FC<TradeAnalysisContentProps> = ({ tradeAnalytics }) => {
  return (
    <>
      <Card>
        <StrategyTradesChart strategies={tradeAnalytics.byStrategy} />
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <OptionTypeChart optionTypes={tradeAnalytics.byOptionType} />
        </Card>
        
        <Card>
          <ExpiryChart expiryData={tradeAnalytics.byExpiry} />
        </Card>
      </div>
      
      <Card>
        <HoldingPeriodChart holdingPeriods={tradeAnalytics.byHoldingPeriod} />
      </Card>
    </>
  );
};
