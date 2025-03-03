
import React, { useState } from 'react';
import { SignalsSection } from '@/components/spy/settings/risk/components/SignalsSection';
import { ActionsSection } from '@/components/spy/settings/risk/components/ActionsSection';
import { RiskMonitoringCard } from '@/components/spy/settings/risk/RiskMonitoringCard';
import { RiskInsights } from '@/components/spy/settings/risk/RiskInsights';
import { RiskLearningInsightsCard } from '@/components/spy/settings/risk/RiskLearningInsightsCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { 
  RiskSignal, 
  RiskAction, 
  LearningInsight,
  RiskSignalSource,
  RiskSignalStrength,
  RiskSignalDirection,
  RiskSignalCondition 
} from '@/lib/types/spy/riskMonitoring';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RiskMonitoringTest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataScenario, setDataScenario] = useState<'empty' | 'minimal' | 'full'>('minimal');

  // Generate mock data based on selected scenario
  const generateMockData = () => {
    if (dataScenario === 'empty') {
      return {
        signals: [],
        actions: [],
        insights: []
      };
    }

    if (dataScenario === 'minimal') {
      return {
        signals: [generateMockSignal('price', 'bearish')],
        actions: [generateMockAction('adjust_stop_loss')],
        insights: [generateMockInsight()]
      };
    }

    // Full data scenario
    return {
      signals: [
        generateMockSignal('price', 'bearish'),
        generateMockSignal('volatility', 'volatile'),
        generateMockSignal('momentum', 'bullish'),
        generateMockSignal('volume', 'neutral'),
        generateMockSignal('technical', 'trending')
      ],
      actions: [
        generateMockAction('adjust_stop_loss'),
        generateMockAction('reduce_position_size'),
        generateMockAction('hedge_position'),
        generateMockAction('exit_trade'),
        generateMockAction('adjust_take_profit')
      ],
      insights: [
        generateMockInsight(),
        generateMockInsight('bullish'),
        generateMockInsight('neutral'),
        generateMockInsight('bearish', 'weak'),
        generateMockInsight('bullish', 'extreme')
      ]
    };
  };

  // Helper functions to generate mock data
  const generateMockSignal = (source: RiskSignalSource, condition: RiskSignalCondition): RiskSignal => {
    const strength: RiskSignalStrength = ['weak', 'moderate', 'strong', 'extreme'][Math.floor(Math.random() * 4)] as RiskSignalStrength;
    const direction: RiskSignalDirection = condition === 'bullish' ? 'bullish' : 
                                         condition === 'bearish' ? 'bearish' : 'neutral';
    
    return {
      id: uuidv4(),
      timestamp: new Date(),
      source,
      condition,
      strength,
      direction,
      description: `${strength} ${direction} signal detected in ${source} data during ${condition} market conditions`,
      confidence: Math.random() * 0.5 + 0.5
    };
  };

  const generateMockAction = (type: string): RiskAction => {
    return {
      id: uuidv4(),
      timestamp: new Date(),
      type: type as any,
      description: `${type.replace('_', ' ')} to protect against potential losses`,
      signalId: uuidv4(),
      tradeIds: [uuidv4(), uuidv4()],
      expectedImpact: {
        profitPotential: Math.floor(Math.random() * 15) + 5,
        riskReduction: Math.floor(Math.random() * 20) + 10
      },
      parameters: {
        signalStrength: 'strong' as RiskSignalStrength,
        signalDescription: 'Bearish signal detected',
        adjustmentFactor: 0.75
      },
      previousRisk: Math.random() * 0.7 + 0.3,
      newRisk: Math.random() * 0.3,
      userRiskTolerance: 'moderate'
    };
  };

  const generateMockInsight = (
    direction: RiskSignalDirection = 'bearish',
    strength: RiskSignalStrength = 'strong'
  ): LearningInsight => {
    const source: RiskSignalSource = ['price', 'volatility', 'volume', 'momentum', 'technical'][Math.floor(Math.random() * 5)] as RiskSignalSource;
    const condition: RiskSignalCondition = ['bullish', 'bearish', 'volatile', 'trending', 'ranging'][Math.floor(Math.random() * 5)] as RiskSignalCondition;
    const successRate = Math.random() * 0.7 + 0.3;
    
    return {
      id: uuidv4(),
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      description: `Pattern: ${direction} ${strength} ${source} signal during ${condition} market`,
      signalPattern: {
        source,
        condition,
        strength,
        direction
      },
      actionTaken: ['reduce_position_size', 'adjust_stop_loss', 'hedge_position', 'exit_trade'][Math.floor(Math.random() * 4)] as any,
      successRate,
      profitImpact: (Math.random() * 200) - 50,
      appliedCount: Math.floor(Math.random() * 20) + 3,
      relatedRiskTolerance: 'moderate',
      confidence: Math.random() * 0.5 + 0.5,
      recommendedActions: [
        'reduce_position_size', 
        'adjust_stop_loss', 
        'hedge_position'
      ] as any[],
      averageProfitImpact: Math.random() * 100
    };
  };

  const { signals, actions, insights } = generateMockData();

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Risk Monitoring Component Test</h2>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={dataScenario} onValueChange={(value) => setDataScenario(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select data scenario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="empty">Empty Data</SelectItem>
              <SelectItem value="minimal">Minimal Data</SelectItem>
              <SelectItem value="full">Full Data</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch id="loading-state" checked={loading} onCheckedChange={setLoading} />
          <Label htmlFor="loading-state">Loading State</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Individual Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">SignalsSection</h3>
              <SignalsSection 
                signals={signals} 
                isLoading={loading} 
              />
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">ActionsSection</h3>
              <ActionsSection 
                actions={actions} 
                isLoading={loading} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Combined Cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">RiskMonitoringCard</h3>
              <RiskMonitoringCard 
                isLoading={loading}
                signals={signals}
                actions={actions}
                latestSignals={signals}
                latestActions={actions}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <div className="border rounded-md p-6">
          <h3 className="text-xl font-medium mb-4">RiskInsights Component</h3>
          <RiskInsights 
            signals={signals}
            actions={actions}
            insights={insights}
            isLoading={loading}
          />
        </div>
        
        <div className="border rounded-md p-6">
          <h3 className="text-xl font-medium mb-4">RiskLearningInsightsCard Component</h3>
          <RiskLearningInsightsCard 
            insights={insights}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default RiskMonitoringTest;
