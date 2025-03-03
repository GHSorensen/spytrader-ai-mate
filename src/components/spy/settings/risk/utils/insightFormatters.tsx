
import { LearningInsight, RiskActionType } from '@/lib/types/spy/riskMonitoring';
import { Badge } from "@/components/ui/badge";
import React from 'react';

// Format success rate as percentage
export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

// Format profit impact
export const formatProfitImpact = (value: number): string => {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}$${value.toFixed(2)}`;
};

// Get action badge with appropriate color
export const getActionBadge = (actionType: RiskActionType): JSX.Element => {
  const type = actionType.replace(/_/g, ' ');
  
  switch (actionType) {
    case 'exit_trade':
      return <Badge variant="destructive">{type}</Badge>;
    case 'reduce_position_size':
      return <Badge variant="outline" className="text-amber-500 border-amber-500">{type}</Badge>;
    case 'hedge_position':
      return <Badge variant="outline">{type}</Badge>;
    case 'adjust_stop_loss':
    case 'adjust_take_profit':
      return <Badge variant="secondary">{type}</Badge>;
    case 'increase_position_size':
      return <Badge variant="outline" className="text-green-500 border-green-500">{type}</Badge>;
    case 'no_action':
      return <Badge variant="outline" className="text-muted-foreground">{type}</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
};

// Format signal pattern description
export const formatSignalPattern = (insight: LearningInsight): string => {
  const { source, condition, strength, direction } = insight.signalPattern;
  return `${direction} ${strength} ${source} signal during ${condition} market conditions`;
};
