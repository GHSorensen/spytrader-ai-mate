
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { RiskAction } from '@/lib/types/spy/riskMonitoring';

interface ActionItemProps {
  action: RiskAction;
}

export const ActionItem: React.FC<ActionItemProps> = ({ action }) => {
  const getActionColor = () => {
    switch (action.type) {
      case 'exit_trade':
        return 'text-red-500';
      case 'reduce_position_size':
        return 'text-amber-500';
      case 'increase_position_size':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  const getActionBadge = () => {
    const type = action.type.replace(/_/g, ' ');
    
    switch (action.type) {
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

  return (
    <div className="border rounded-md p-3 mb-2 bg-card hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <div className={`font-medium ${getActionColor()}`}>
          {action.description}
        </div>
        {getActionBadge()}
      </div>
      <div className="text-xs text-muted-foreground">
        Trade ID: {action.tradeId.substring(0, 8)} • 
        <span className="ml-1">{action.reason}</span>
      </div>
    </div>
  );
};
