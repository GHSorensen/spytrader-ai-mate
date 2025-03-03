
import React from 'react';
import { RiskSignal } from '@/lib/types/spy/riskMonitoring';
import { AlertTriangle, TrendingUp, TrendingDown, BarChart2, LineChart } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface SignalItemProps {
  signal: RiskSignal;
}

export const SignalItem: React.FC<SignalItemProps> = ({ signal }) => {
  // Function to get icon based on signal source
  const getSignalIcon = () => {
    switch (signal.source) {
      case 'price':
        return <LineChart className="h-4 w-4" />;
      case 'volatility':
        return <AlertTriangle className="h-4 w-4" />;
      case 'volume':
        return <BarChart2 className="h-4 w-4" />;
      case 'momentum':
        return signal.condition === 'bullish' 
          ? <TrendingUp className="h-4 w-4" /> 
          : <TrendingDown className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };
  
  // Function to get color based on signal condition
  const getConditionColor = () => {
    switch (signal.condition) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      case 'volatile': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  };
  
  // Function to get badge for signal strength
  const getStrengthBadge = () => {
    switch (signal.strength) {
      case 'weak':
        return <Badge variant="outline" className="text-xs">Weak</Badge>;
      case 'moderate':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Moderate</Badge>;
      case 'strong':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Strong</Badge>;
      case 'extreme':
        return <Badge variant="destructive" className="text-xs">Extreme</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{signal.strength}</Badge>;
    }
  };

  return (
    <div className="p-2 border rounded-md mb-1.5 hover:bg-accent/5 transition-colors">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          <span className={getConditionColor()}>{getSignalIcon()}</span>
          <span className="text-sm font-medium capitalize">{signal.source}</span>
          {getStrengthBadge()}
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(signal.timestamp).toLocaleTimeString()}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{signal.description}</p>
    </div>
  );
};
