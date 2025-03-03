
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskPatternsVisualizationProps, TimeFrameOption } from './types';
import { 
  processAnomaliesForChart, 
  processAnomaliesByDay, 
  processSignalsByConfidence 
} from './utils/dataProcessors';
import TimeFrameSelector from './TimeFrameSelector';
import AnomalyTypesChart from './charts/AnomalyTypesChart';
import AnomalyTimeSeriesChart from './charts/AnomalyTimeSeriesChart';
import SignalConfidenceChart from './charts/SignalConfidenceChart';

const RiskPatternsVisualization: React.FC<RiskPatternsVisualizationProps> = ({
  anomalies,
  signals,
  timeFrame = '30d'
}) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = React.useState<TimeFrameOption>(timeFrame);
  
  const anomalyTypeData = processAnomaliesForChart(anomalies, selectedTimeFrame);
  const anomalyTimeSeriesData = processAnomaliesByDay(anomalies, selectedTimeFrame);
  const signalConfidenceData = processSignalsByConfidence(signals, selectedTimeFrame);
  
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
          <TimeFrameSelector 
            value={selectedTimeFrame} 
            onChange={setSelectedTimeFrame}
          />
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
            <AnomalyTypesChart data={anomalyTypeData} />
          </TabsContent>
          
          <TabsContent value="anomalyTimeSeries">
            <AnomalyTimeSeriesChart data={anomalyTimeSeriesData} />
          </TabsContent>
          
          <TabsContent value="signalConfidence">
            <SignalConfidenceChart data={signalConfidenceData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RiskPatternsVisualization;
