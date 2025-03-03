
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatisticalAnomaly, AnomalyType } from '@/lib/types/spy/riskMonitoring';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

interface AnomalyPatternsCardProps {
  anomalies: StatisticalAnomaly[];
  lastDetectionTime: Date | null;
  isLoading?: boolean;
}

export const AnomalyPatternsCard: React.FC<AnomalyPatternsCardProps> = ({
  anomalies,
  lastDetectionTime,
  isLoading = false
}) => {
  // Process anomaly history data - last 30 days
  const getAnomalyHistory = () => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    
    // Create a map of dates for the last 30 days
    const dateMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      dateMap[dateStr] = 0;
    }
    
    // Count anomalies by date
    anomalies.forEach(anomaly => {
      const anomalyDate = new Date(anomaly.timestamp);
      if (anomalyDate >= thirtyDaysAgo) {
        const dateStr = format(anomalyDate, 'yyyy-MM-dd');
        if (dateMap[dateStr] !== undefined) {
          dateMap[dateStr]++;
        }
      }
    });
    
    // Convert to chart data
    return Object.entries(dateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };
  
  // Count anomalies by type
  const getAnomaliesByType = () => {
    const counts: Record<AnomalyType, number> = {
      'price_spike': 0,
      'volume_surge': 0,
      'volatility_explosion': 0,
      'correlation_break': 0,
      'pattern_deviation': 0,
      'momentum_shift': 0,
      'liquidity_change': 0,
      'option_skew_change': 0,
      'implied_volatility_divergence': 0
    };
    
    anomalies.forEach(anomaly => {
      counts[anomaly.type]++;
    });
    
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  };
  
  const anomalyHistory = getAnomalyHistory();
  const anomaliesByType = getAnomaliesByType();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Anomaly Patterns
        </CardTitle>
        <CardDescription>
          Statistical anomaly detection patterns over time
          {lastDetectionTime && (
            <span className="block text-xs mt-1">
              Last updated: {format(lastDetectionTime, 'PPpp')}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="history">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="history">30-Day History</TabsTrigger>
            <TabsTrigger value="types">Anomaly Types</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={anomalyHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'PPP')}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="Anomalies" 
                    stroke="#ff9800" 
                    fill="#ffcc80" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="types">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anomaliesByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnomalyPatternsCard;
