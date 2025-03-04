
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"; 
import { RiskHeader } from '../components/spy/risk-console/RiskHeader';
import { Footer } from '../components/spy/risk-console/Footer';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, Shield, AlertTriangle, BarChart } from 'lucide-react';
import { RiskSignal, RiskAction } from '@/lib/types/spy/riskMonitoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignalsSection } from '@/components/spy/settings/risk/components/SignalsSection';
import { ActionsSection } from '@/components/spy/settings/risk/components/ActionsSection';
import { useAccountBalance } from '@/hooks/useAccountBalance';
import { TodaysTrades } from '@/components/spy/TodaysTrades';

const RiskConsole: React.FC = () => {
  const navigate = useNavigate();
  const accountData = useAccountBalance();
  
  // State for risk data
  const [isLoading, setIsLoading] = useState(false);
  const [riskSignals, setRiskSignals] = useState<RiskSignal[]>([]);
  const [riskActions, setRiskActions] = useState<RiskAction[]>([]);
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
    
    setRiskSignals(mockSignals);
    setRiskActions(mockActions);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Risk Console</h1>
            <p className="text-muted-foreground">Monitor and manage SPY options trading risk</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-md bg-muted text-sm">
              Balance: ${accountData.balance.toLocaleString()}
            </div>
            <RiskHeader
              autoMode={autoMode}
              isLoading={isLoading}
              toggleAutoMode={toggleAutoMode}
              performRiskMonitoring={performRiskMonitoring}
            />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Market Signals
              </CardTitle>
              <CardDescription>
                Current detected risk signals in the market
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignalsSection 
                signals={riskSignals}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Recommended Actions
              </CardTitle>
              <CardDescription>
                AI suggested risk management actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActionsSection 
                actions={riskActions}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Recent Trades
            </CardTitle>
            <CardDescription>
              Review your recent trading activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TodaysTrades showHeader={false} />
          </CardContent>
        </Card>
        
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
      </div>
    </div>
  );
};

export default RiskConsole;
