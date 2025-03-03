
import React from 'react';
import { RiskAction } from '@/lib/types/spy/riskMonitoring';
import { ActionItem } from './ActionItem';

interface ActionsSectionProps {
  latestActions: RiskAction[];
  getRelativeTime: (timestamp: Date) => string;
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  latestActions,
  getRelativeTime
}) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Recent Risk Actions</h3>
      {latestActions.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No recent actions taken</p>
      ) : (
        <div className="space-y-2">
          {latestActions.slice(0, 5).map(action => (
            <ActionItem 
              key={action.id} 
              action={action} 
              getRelativeTime={getRelativeTime} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
