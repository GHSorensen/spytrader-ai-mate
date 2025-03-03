
import React from 'react';
import { RiskAction } from '@/lib/types/spy/riskMonitoring';
import { CheckIcon, XIcon } from 'lucide-react';
import { getActionBadge } from '../utils/insightFormatters';

interface ActionItemProps {
  action: RiskAction;
}

export const ActionItem: React.FC<ActionItemProps> = ({ action }) => {
  return (
    <div className="p-2 border rounded-md mb-1.5 hover:bg-accent/5 transition-colors">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          {getActionBadge(action.type)}
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(action.timestamp).toLocaleTimeString()}
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mb-1.5">{action.description}</p>
      
      <div className="flex justify-between items-center text-xs">
        <div className="flex gap-3">
          <span className="text-green-500">+{action.expectedImpact.profitPotential}% profit</span>
          <span className="text-blue-500">-{action.expectedImpact.riskReduction}% risk</span>
        </div>
        
        {action.appliedSuccess !== undefined && (
          <div className="flex items-center">
            {action.appliedSuccess ? 
              <CheckIcon className="h-3 w-3 text-green-500 mr-1" /> : 
              <XIcon className="h-3 w-3 text-red-500 mr-1" />
            }
            <span className={action.appliedSuccess ? "text-green-500" : "text-red-500"}>
              {action.appliedSuccess ? "Applied" : "Ignored"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
