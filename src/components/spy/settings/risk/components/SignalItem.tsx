
import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { 
  RiskSignal,
  RiskSignalStrength,
  RiskSignalDirection 
} from '@/lib/types/spy/riskMonitoring';

interface SignalItemProps {
  signal: RiskSignal;
  getRelativeTime: (timestamp: Date) => string;
}

export const SignalItem: React.FC<SignalItemProps> = ({
  signal,
  getRelativeTime
}) => {
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

  return (
    <div className="border rounded-lg p-2 text-sm">
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
  );
};
