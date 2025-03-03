
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, AlertTriangle, LightbulbIcon, Zap } from 'lucide-react';
import { StatisticalAnomaly } from '@/lib/types/spy/riskMonitoring';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useRelativeTime } from '@/hooks/useRelativeTime';

interface AnomalyItemProps {
  anomaly: StatisticalAnomaly;
}

const AnomalyItem: React.FC<AnomalyItemProps> = ({ anomaly }) => {
  const getRelativeTime = useRelativeTime();
  
  // Determine color based on confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-red-500";
    if (confidence >= 0.7) return "bg-orange-500";
    if (confidence >= 0.6) return "bg-amber-500";
    return "bg-blue-500";
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'price_spike': return "bg-blue-500/10 text-blue-600 border-blue-200";
      case 'volume_surge': return "bg-purple-500/10 text-purple-600 border-purple-200";
      case 'volatility_explosion': return "bg-red-500/10 text-red-600 border-red-200";
      case 'correlation_break': return "bg-amber-500/10 text-amber-600 border-amber-200";
      case 'option_skew_change': return "bg-green-500/10 text-green-600 border-green-200";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };
  
  return (
    <div className="mb-3 p-3 border rounded-md bg-white/50 dark:bg-zinc-900/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getConfidenceColor(anomaly.confidence)}`} />
          <span className="font-medium text-sm">
            {anomaly.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </span>
          <Badge variant="outline" className={getTypeColor(anomaly.type)}>
            {anomaly.detectionMethod.replace('_', ' ')}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {getRelativeTime(anomaly.timestamp)}
        </span>
      </div>
      
      <p className="mt-2 text-sm">
        {anomaly.description}
      </p>
      
      <div className="mt-2 flex flex-wrap gap-2">
        <div className="text-xs bg-muted/50 px-2 py-1 rounded-sm">
          Confidence: {(anomaly.confidence * 100).toFixed(0)}%
        </div>
        <div className="text-xs bg-muted/50 px-2 py-1 rounded-sm">
          Z-Score: {anomaly.zScore.toFixed(2)}
        </div>
        {anomaly.historicalOccurrences !== undefined && (
          <div className="text-xs bg-muted/50 px-2 py-1 rounded-sm">
            History: {anomaly.historicalOccurrences} similar events
          </div>
        )}
      </div>
      
      {anomaly.suggestedActions && anomaly.suggestedActions.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <LightbulbIcon className="h-3 w-3" />
            <span>Suggested actions:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {anomaly.suggestedActions.map((action, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {action.split('_').join(' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface AnomalyDetectionCardProps {
  anomalies: StatisticalAnomaly[];
  isLoading?: boolean;
  lastDetectionTime?: Date | null;
}

export const AnomalyDetectionCard: React.FC<AnomalyDetectionCardProps> = ({
  anomalies,
  isLoading = false,
  lastDetectionTime = null
}) => {
  const getRelativeTime = useRelativeTime();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Statistical Anomaly Detection
        </CardTitle>
        <CardDescription>
          {lastDetectionTime ? (
            `Last detection: ${getRelativeTime(lastDetectionTime)}`
          ) : (
            'Advanced statistical pattern recognition'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Zap className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No statistical anomalies detected</p>
            <p className="text-xs text-muted-foreground mt-1">
              The market is behaving within expected statistical parameters
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            {anomalies.map((anomaly) => (
              <AnomalyItem key={anomaly.id} anomaly={anomaly} />
            ))}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AnomalyDetectionCard;
