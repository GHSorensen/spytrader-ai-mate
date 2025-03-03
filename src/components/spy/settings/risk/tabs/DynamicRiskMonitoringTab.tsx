
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RiskInsights } from '../RiskInsights';
import { AITradingSettings } from '@/lib/types/spy';
import { 
  RiskSignal, 
  RiskAction, 
  LearningInsight
} from '@/lib/types/spy/riskMonitoring';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';
import { toast } from "sonner";
import { RiskMonitoringTabContent } from './risk/RiskMonitoringTabContent';
import { AnomalyDetectionTabContent } from './anomaly/AnomalyDetectionTabContent';

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
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'risk' | 'anomaly')} className="mb-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="risk">Risk Monitoring</TabsTrigger>
          <TabsTrigger value="anomaly">Anomaly Detection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="risk">
          <RiskMonitoringTabContent
            autoMode={autoMode}
            toggleAutoMode={toggleAutoMode}
            performRiskMonitoring={performRiskMonitoring}
            isLoading={isLoading}
            latestSignals={latestSignals}
            latestActions={latestActions}
            settings={settings}
            updateSettings={updateSettings}
          />
        </TabsContent>
        
        <TabsContent value="anomaly">
          <AnomalyDetectionTabContent
            anomalyLoading={anomalyLoading}
            anomalies={anomalies}
            runDetection={runDetection}
          />
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
