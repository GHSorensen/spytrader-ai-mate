
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"; 
import { RiskHeader } from '../components/spy/risk-console/RiskHeader';
import { Footer } from '../components/spy/risk-console/Footer';
import { DemoNotifications } from '../components/spy/risk-console/DemoNotifications';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { RiskSignal, RiskAction, LearningInsight, StatisticalAnomaly } from '@/lib/types/spy/riskMonitoring';
import { RiskInsights } from '@/components/spy/settings/risk/RiskInsights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RiskConsole: React.FC = () => {
  const navigate = useNavigate();
  
  // State for risk data
  const [isLoading, setIsLoading] = useState(false);
  const [riskSignals, setRiskSignals] = useState<RiskSignal[]>([]);
  const [riskActions, setRiskActions] = useState<RiskAction[]>([]);
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  const [anomalies, setAnomalies] = useState<StatisticalAnomaly[]>([]);
  const [lastDetectionTime, setLastDetectionTime] = useState<Date>(new Date());
  const [autoMode, setAutoMode] = useState(false);
  
  // Initialize with sample data
  useEffect(() => {
    // This will ensure we have some data to display
    const mockSignals: RiskSignal[] = [
      {
        id: 'signal-1',
        timestamp: new Date(),
        source: 'volatility',
        condition: 'volatile',
        strength: 'strong',
        direction: 'bearish',
        description: 'VIX spike detected above normal thresholds',
        confidence: 0.85
      },
      {
        id: 'signal-2',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        source: 'price',
        condition: 'trending',
        strength: 'moderate',
        direction: 'bearish',
        description: 'SPY price falling below 50-day moving average',
        confidence: 0.72
      }
    ];
    
    // Mock actions
    const mockActions: RiskAction[] = [
      {
        id: 'action-1',
        signalId: 'signal-1',
        timestamp: new Date(),
        type: 'reduce_position_size',
        tradeIds: ['trade-123', 'trade-456'],
        description: 'Reduce position size for 2 CALL trades based on bearish volatility signal',
        parameters: {
          signalStrength: 'strong',
          signalDescription: 'VIX spike detected above normal thresholds'
        },
        expectedImpact: {
          profitPotential: 0,
          riskReduction: 50
        },
        previousRisk: 1.0,
        newRisk: 0.5,
        userRiskTolerance: 'moderate'
      }
    ];
    
    // Mock insights - fixing the property name to match the type definition
    const mockInsights: LearningInsight[] = [
      {
        id: 'insight-1',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        signalPattern: {
          source: 'volatility',
          condition: 'volatile',
          strength: 'strong',
          direction: 'bearish'
        },
        actionTaken: 'reduce_position_size',
        successRate: 0.8,
        profitImpact: 750,
        description: 'Reducing position size during volatility spikes has been 80% effective',
        appliedCount: 12,
        relatedRiskTolerance: 'moderate',
        confidence: 0.75,
        recommendedActions: ['reduce_position_size', 'adjust_stop_loss'],
        averageProfitImpact: 680
      }
    ];
    
    // Mock anomalies
    const mockAnomalies: StatisticalAnomaly[] = [
      {
        id: 'anomaly-1',
        timestamp: new Date(),
        type: 'volatility_explosion',
        detectionMethod: 'zscore',
        timeWindow: '1d',
        metric: 'VIX',
        value: 35.2,
        expectedValue: 18.5,
        deviation: 2.8,
        zScore: 3.2,
        confidence: 0.92,
        description: 'Abnormal volatility expansion detected'
      }
    ];
    
    setRiskSignals(mockSignals);
    setRiskActions(mockActions);
    setLearningInsights(mockInsights);
    setAnomalies(mockAnomalies);
  }, []);
  
  const performRiskMonitoring = () => {
    setIsLoading(true);
    
    // Simulate a loading delay
    setTimeout(() => {
      setIsLoading(false);
      setLastDetectionTime(new Date());
      // In a real implementation, this would fetch new data
    }, 1500);
  };
  
  const toggleAutoMode = () => {
    setAutoMode(!autoMode);
  };
  
  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        <RiskHeader
          autoMode={autoMode}
          isLoading={isLoading}
          toggleAutoMode={toggleAutoMode}
          performRiskMonitoring={performRiskMonitoring}
        />
        
        <Tabs defaultValue="insights" className="mb-6">
          <TabsList>
            <TabsTrigger value="insights">Risk Insights</TabsTrigger>
            <TabsTrigger value="positions">Active Positions</TabsTrigger>
            <TabsTrigger value="history">Analysis History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="mt-4">
            <RiskInsights 
              signals={riskSignals}
              actions={riskActions}
              insights={learningInsights}
              anomalies={anomalies}
              lastAnomalyDetectionTime={lastDetectionTime}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="positions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Positions</CardTitle>
                <CardDescription>Monitor your current risk exposure</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Position risk monitoring coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Analysis History</CardTitle>
                <CardDescription>Past analysis results and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Risk analysis history coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-auto">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1" 
              onClick={handleReturnToDashboard}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Return to Dashboard
            </Button>
          </div>
          
          <Footer />
        </div>
        
        <DemoNotifications />
      </div>
    </div>
  );
};

export default RiskConsole;
