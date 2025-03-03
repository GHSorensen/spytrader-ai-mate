import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatisticalAnomaly, RiskSignal, AnomalyType } from '@/lib/types/spy/riskMonitoring';
import { format, subDays } from 'date-fns';

interface RiskPatternsVisualizationProps {
  anomalies: StatisticalAnomaly[];
  signals: RiskSignal[];
  timeFrame?: '7d' | '30d' | '90d' | 'all';
}

const RiskPatternsVisualization: React.FC<RiskPatternsVisualizationProps> = ({
  anomalies,
  signals,
  timeFrame = '30d'
}) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = React.useState<'7d' | '30d' | '90d' | 'all'>(timeFrame);
  
  const getFilteredData = (data: Array<StatisticalAnomaly | RiskSignal>) => {
    const now = new Date();
    let daysToSubtract = 30;
    
    switch (selectedTimeFrame) {
      case '7d':
        daysToSubtract = 7;
        break;
      case '30d':
        daysToSubtract = 30;
        break;
      case '90d':
        daysToSubtract = 90;
        break;
      case 'all':
        return data;
    }
    
    const cutoffDate = subDays(now, daysToSubtract);
    return data.filter(item => new Date(item.timestamp) >= cutoffDate);
  };

  const processAnomaliesForChart = () => {
    const filteredAnomalies = getFilteredData(anomalies) as StatisticalAnomaly[];
    
    const anomalyCountsByType: Record<AnomalyType, number> = {
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
    
    filteredAnomalies.forEach(anomaly => {
      anomalyCountsByType[anomaly.type]++;
    });
    
    return Object.entries(anomalyCountsByType).map(([type, count]) => ({
      type,
      count
    }));
  };
  
  const processAnomaliesByDay = () => {
    const filteredAnomalies = getFilteredData(anomalies) as StatisticalAnomaly[];
    
    const anomaliesByDay: Record<string, number> = {};
    
    filteredAnomalies.forEach(anomaly => {
      const day = format(new Date(anomaly.timestamp), 'yyyy-MM-dd');
      anomaliesByDay[day] = (anomaliesByDay[day] || 0) + 1;
    });
    
    return Object.entries(anomaliesByDay)
      .map(([day, count]) => ({
        day,
        count
      }))
      .sort((a, b) => a.day.localeCompare(b.day));
  };
  
  const processSignalsByConfidence = () => {
    const filteredSignals = getFilteredData(signals) as RiskSignal[];
    
    const ranges: Record<string, number> = {
      '0-0.2': 0,
      '0.2-0.4': 0,
      '0.4-0.6': 0,
      '0.6-0.8': 0,
      '0.8-1.0': 0
    };
    
    filteredSignals.forEach(signal => {
      if (signal.confidence < 0.2) ranges['0-0.2']++;
      else if (signal.confidence < 0.4) ranges['0.2-0.4']++;
      else if (signal.confidence < 0.6) ranges['0.4-0.6']++;
      else if (signal.confidence < 0.8) ranges['0.6-0.8']++;
      else ranges['0.8-1.0']++;
    });
    
    return Object.entries(ranges).map(([range, count]) => ({
      range,
      count
    }));
  };
  
  const anomalyTypeData = processAnomaliesForChart();
  const anomalyTimeSeriesData = processAnomaliesByDay();
  const signalConfidenceData = processSignalsByConfidence();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Risk Pattern Visualization</CardTitle>
            <CardDescription>
              Visual analysis of detected anomalies and risk signals
            </CardDescription>
          </div>
          <Select 
            value={selectedTimeFrame} 
            onValueChange={(value: '7d' | '30d' | '90d' | 'all') => setSelectedTimeFrame(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="anomalyTypes">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="anomalyTypes">Anomaly Types</TabsTrigger>
            <TabsTrigger value="anomalyTimeSeries">Anomalies Over Time</TabsTrigger>
            <TabsTrigger value="signalConfidence">Signal Confidence</TabsTrigger>
          </TabsList>
          
          <TabsContent value="anomalyTypes">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anomalyTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Occurrences" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="anomalyTimeSeries">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={anomalyTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#82ca9d"
                    activeDot={{ r: 8 }}
                    name="Anomalies"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="signalConfidence">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signalConfidenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#ffc658" name="Signal Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RiskPatternsVisualization;
