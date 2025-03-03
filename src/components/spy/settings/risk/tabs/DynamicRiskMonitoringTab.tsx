
import React, { useState } from 'react';
import { RiskMonitoringCard } from '../RiskMonitoringCard';
import { RiskInsights } from '../RiskInsights';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AITradingSettings } from '@/lib/types/spy';
import { 
  RiskSignal, 
  RiskAction, 
  LearningInsight, 
  StatisticalAnomaly, 
  AnomalyDetectionParams 
} from '@/lib/types/spy/riskMonitoring';
import { AlertCircle, BarChart3 } from 'lucide-react';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface DynamicRiskMonitoringTabProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  isLoading: boolean;
  latestSignals: RiskSignal[];
  latestActions: RiskAction[];
  learningInsights: LearningInsight[];
  autoMode: boolean;
  performRiskMonitoring: () => void;
  toggleAutoMode: () => void;
}

export const DynamicRiskMonitoringTab: React.FC<DynamicRiskMonitoringTabProps> = ({
  settings,
  updateSettings,
  isLoading,
  latestSignals,
  latestActions,
  learningInsights,
  autoMode,
  performRiskMonitoring,
  toggleAutoMode
}) => {
  const [activeTab, setActiveTab] = useState<'risk' | 'anomaly'>('risk');
  
  // Initialize anomaly detection hook (without auto-detect for now)
  const {
    anomalies,
    isLoading: anomalyLoading,
    lastDetectionTime,
    runDetection,
    clearAnomalies
  } = useAnomalyDetection({
    autoDetect: false,
    showNotifications: true,
    params: {
      sensitivity: 0.7
    }
  });
  
  // Run anomaly detection with sample/mock data (for demo purposes)
  const runSampleAnomalyDetection = () => {
    // Create mock market data for demonstration
    const currentData = {
      price: 415.50,
      previousClose: 412.25,
      change: 3.25,
      changePercent: 0.79,
      volume: 78500000,
      averageVolume: 72000000,
      high: 416.75,
      low: 413.20,
      open: 413.50,
      timestamp: new Date(),
      vix: 18.5
    };
    
    // Create 30 days of historical data
    const historicalData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      
      // Add some randomness to make it realistic
      const basePrice = 410 + Math.sin(i * 0.3) * 8;
      const randomFactor = Math.random() * 2 - 1;
      
      return {
        price: basePrice + randomFactor,
        previousClose: basePrice - 0.25,
        change: randomFactor + 0.25,
        changePercent: (randomFactor + 0.25) / basePrice * 100,
        volume: 70000000 + Math.random() * 10000000,
        averageVolume: 72000000,
        high: basePrice + 1 + randomFactor,
        low: basePrice - 1 + randomFactor,
        open: basePrice - 0.5 + randomFactor,
        timestamp: date,
        vix: 17 + Math.sin(i * 0.4) * 3
      };
    });
    
    // Run detection with this mock data
    runDetection(currentData, historicalData)
      .then(result => {
        if (result.anomalies.length === 0) {
          toast.info("No statistical anomalies detected in the sample data");
        } else {
          toast.success(`Detected ${result.anomalies.length} statistical anomalies`);
        }
      })
      .catch(error => {
        console.error("Error running anomaly detection:", error);
        toast.error("Failed to run anomaly detection");
      });
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'risk' | 'anomaly')} className="mb-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="risk">Risk Monitoring</TabsTrigger>
          <TabsTrigger value="anomaly">Anomaly Detection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="risk" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-risk-monitoring"
                checked={autoMode}
                onCheckedChange={toggleAutoMode}
              />
              <Label htmlFor="auto-risk-monitoring" className="font-medium">
                Automatic Risk Monitoring
              </Label>
            </div>
            <Button 
              onClick={performRiskMonitoring} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Run Risk Analysis
            </Button>
          </div>
          
          {latestSignals.length === 0 && !isLoading && (
            <div className="flex items-center p-4 border rounded-md bg-muted/40">
              <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">
                No risk signals detected yet. Run a risk analysis to get started.
              </p>
            </div>
          )}
          
          <RiskMonitoringCard 
            isLoading={isLoading}
            latestSignals={latestSignals}
            latestActions={latestActions}
            settings={settings}
            updateSettings={updateSettings}
          />
        </TabsContent>
        
        <TabsContent value="anomaly" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="font-medium">Statistical Anomaly Detection</span>
            </div>
            <Button 
              onClick={runSampleAnomalyDetection} 
              disabled={anomalyLoading}
              variant="outline"
              size="sm"
            >
              Run Anomaly Detection
            </Button>
          </div>
          
          <div className="bg-muted/20 border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">About Statistical Anomaly Detection</h3>
            <p className="text-sm text-muted-foreground">
              This module uses advanced statistical methods to identify unusual market behavior that may indicate trading opportunities.
              It analyzes price movements, volatility, volume, and option market data to detect patterns that deviate from normal behavior.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-xs font-medium mb-1">Detection Methods</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Z-score analysis</li>
                  <li>Bollinger bands</li>
                  <li>Moving averages</li>
                  <li>Correlation breaks</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-medium mb-1">Anomaly Types</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Price spikes/drops</li>
                  <li>Volume surges</li>
                  <li>Volatility explosions</li>
                  <li>Option skew changes</li>
                </ul>
              </div>
            </div>
          </div>
          
          {anomalyLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="rounded-md border bg-card">
              {anomalies.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground">No anomalies detected</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    Run the detection to identify statistical anomalies in market data that could indicate trading opportunities.
                  </p>
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-sm font-medium mb-4">
                    {anomalies.length} anomalies detected
                  </p>
                  {/* We'll use the full card component in the insights section instead */}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <RiskInsights 
        signals={latestSignals}
        actions={latestActions}
        insights={learningInsights}
        anomalies={anomalies}
        lastAnomalyDetectionTime={lastDetectionTime}
        isLoading={isLoading || anomalyLoading}
      />
    </div>
  );
};
