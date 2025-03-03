
import React from 'react';
import { Check } from 'lucide-react';
import { RiskAction, RiskActionType } from '@/lib/types/spy/riskMonitoring';
import { getActionBadge } from '../utils/insightFormatters';

interface ActionItemProps {
  action: RiskAction;
  getRelativeTime: (timestamp: Date) => string;
}

export const ActionItem: React.FC<ActionItemProps> = ({
  action,
  getRelativeTime
}) => {
  return (
    <div className="border rounded-lg p-2 text-sm">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          {getActionBadge(action.actionType)}
        </div>
        <span className="text-xs text-muted-foreground">
          {getRelativeTime(action.timestamp)}
        </span>
      </div>
      <p className="text-xs">{action.description}</p>
      <div className="flex gap-3 mt-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Before:</span>
          <div className="w-10 h-1.5 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-orange-500 rounded-full" 
              style={{width: `${action.previousRisk * 100}%`}}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>After:</span>
          <div className="w-10 h-1.5 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{width: `${action.newRisk * 100}%`}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
