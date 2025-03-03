
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Activity, Check } from 'lucide-react';
import { 
  RiskSignal, 
  RiskAction,
  RiskSignalStrength,
  RiskSignalDirection 
} from '@/lib/types/spy/riskMonitoring';

interface RiskMonitoringCardProps {
  isLoading?: boolean;
  latestSignals: RiskSignal[];
  latestActions: RiskAction[];
}

export const RiskMonitoringCard: React.FC<RiskMonitoringCardProps> = ({
  isLoading = false,
  latestSignals = [],
  latestActions = []
}) => {
  // Format relative time (e.g., "2 minutes ago")
  const getRelativeTime = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    return timestamp.toLocaleDateString();
  };
  
  // Get color based on signal strength
  const getStrengthColor = (strength: RiskSignalStrength): string => {
    switch (strength) {
      case 'extreme': return 'text-red-500';
      case 'strong': return 'text-orange-500';
      case 'moderate': return 'text-yellow-500';
      case 'weak': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };
  
  // Get icon based on signal direction
  const getDirectionIcon = (direction: RiskSignalDirection) => {
    switch (direction) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-positive" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-negative" />;
      case 'neutral': return <Activity className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };
  
  // Get badge for action type
  const getActionBadge = (actionType: string) => {
    const type = actionType.replace(/_/g, ' ');
    
    switch (actionType) {
      case 'exit_trade':
        return <Badge variant="destructive">{type}</Badge>;
      case 'reduce_position_size':
        return <Badge variant="warning">{type}</Badge>;
      case 'hedge_position':
        return <Badge variant="outline">{type}</Badge>;
      case 'adjust_stop_loss':
      case 'adjust_take_profit':
        return <Badge variant="secondary">{type}</Badge>;
      case 'increase_position_size':
        return <Badge variant="success">{type}</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Real-time Risk Monitoring
        </CardTitle>
        <CardDescription>
          Latest market signals and automated risk actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-medium mb-2">Recent Market Signals</h3>
              {latestSignals.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No recent signals detected</p>
              ) : (
                <div className="space-y-2">
                  {latestSignals.slice(0, 5).map(signal => (
                    <div key={signal.id} className="border rounded-lg p-2 text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                          {getDirectionIcon(signal.direction)}
                          <span className={`font-medium ${getStrengthColor(signal.strength)}`}>
                            {signal.strength.charAt(0).toUpperCase() + signal.strength.slice(1)}
                          </span>
                          <span className="ml-1">
                            {signal.source.charAt(0).toUpperCase() + signal.source.slice(1)} Signal
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getRelativeTime(signal.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs">{signal.description}</p>
                      <div className="flex items-center gap-1 text-xs mt-1 text-muted-foreground">
                        <span>Confidence:</span>
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{width: `${signal.confidence * 100}%`}}
                          />
                        </div>
                        <span>{Math.round(signal.confidence * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Recent Risk Actions</h3>
              {latestActions.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No recent actions taken</p>
              ) : (
                <div className="space-y-2">
                  {latestActions.slice(0, 5).map(action => (
                    <div key={action.id} className="border rounded-lg p-2 text-sm">
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
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
