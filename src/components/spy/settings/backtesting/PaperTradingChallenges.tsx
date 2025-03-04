
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, PauseCircle, BarChart3, Gauge } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format, addDays, differenceInDays } from 'date-fns';

interface TradingChallenge {
  id: string;
  name: string;
  description: string;
  initialBudget: number;
  currentValue: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'active' | 'completed' | 'failed';
  objective: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  trades: number;
  winRate: number;
}

export const PaperTradingChallenges: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [challenges, setChallenges] = useState<TradingChallenge[]>([
    {
      id: 'challenge-1',
      name: 'Conservative Challenge',
      description: 'Low-risk paper trading with small position sizes',
      initialBudget: 50,
      currentValue: 50,
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      status: 'pending',
      objective: 'Exceed 200% gains in one week',
      riskLevel: 'conservative',
      trades: 0,
      winRate: 0,
    },
    {
      id: 'challenge-2',
      name: 'Moderate Challenge',
      description: 'Balanced risk-reward approach with medium position sizes',
      initialBudget: 500,
      currentValue: 500,
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      status: 'pending',
      objective: 'Exceed 200% gains in one week',
      riskLevel: 'moderate',
      trades: 0,
      winRate: 0,
    },
    {
      id: 'challenge-3',
      name: 'Aggressive Challenge',
      description: 'High-risk approach seeking maximum returns',
      initialBudget: 1000,
      currentValue: 1000,
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      status: 'pending',
      objective: 'Exceed 200% gains in one week',
      riskLevel: 'aggressive',
      trades: 0,
      winRate: 0,
    },
  ]);

  const startChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, status: 'active', startDate: new Date() } 
        : challenge
    ));
    
    toast({
      title: "Challenge Started",
      description: "The AI trading challenge has been activated.",
    });
  };

  const pauseChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, status: 'pending' } 
        : challenge
    ));
    
    toast({
      title: "Challenge Paused",
      description: "The AI trading challenge has been paused.",
    });
  };

  const resetChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { 
            ...challenge, 
            status: 'pending', 
            currentValue: challenge.initialBudget,
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            trades: 0,
            winRate: 0
          } 
        : challenge
    ));
    
    toast({
      title: "Challenge Reset",
      description: "The AI trading challenge has been reset to initial values.",
    });
  };

  const filteredChallenges = activeTab === 'all' 
    ? challenges 
    : challenges.filter(c => c.status === activeTab);

  const calculateProgress = (challenge: TradingChallenge) => {
    if (challenge.status === 'pending') return 0;
    
    const totalDays = differenceInDays(challenge.endDate, challenge.startDate);
    const elapsedDays = differenceInDays(new Date(), challenge.startDate);
    
    return Math.min(Math.max(Math.round((elapsedDays / totalDays) * 100), 0), 100);
  };

  const calculateGainPercentage = (challenge: TradingChallenge) => {
    return ((challenge.currentValue - challenge.initialBudget) / challenge.initialBudget) * 100;
  };

  const getRiskLevelColor = (riskLevel: TradingChallenge['riskLevel']) => {
    switch (riskLevel) {
      case 'conservative': return 'bg-blue-500';
      case 'moderate': return 'bg-yellow-500';
      case 'aggressive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Paper Trading Challenges</span>
          </div>
          <Badge variant="outline" className="ml-2">
            Total Budget: ${challenges.reduce((sum, c) => sum + c.initialBudget, 0)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Run parallel trading tests with different risk profiles and budgets
        </CardDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No challenges in this category
          </div>
        ) : (
          filteredChallenges.map(challenge => (
            <Card key={challenge.id} className="overflow-hidden border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {challenge.name}
                      <Badge 
                        className={cn(
                          "ml-2 text-xs",
                          challenge.riskLevel === 'conservative' ? "bg-blue-500/20 text-blue-700" :
                          challenge.riskLevel === 'moderate' ? "bg-yellow-500/20 text-yellow-700" :
                          "bg-red-500/20 text-red-700"
                        )}
                      >
                        {challenge.riskLevel}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">{challenge.description}</CardDescription>
                  </div>
                  <Badge 
                    variant={
                      challenge.status === 'active' ? 'default' :
                      challenge.status === 'pending' ? 'outline' :
                      challenge.status === 'completed' ? 'secondary' : 'destructive'
                    }
                  >
                    {challenge.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Initial Budget</p>
                    <p className="text-xl font-semibold">${challenge.initialBudget.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                    <p className={cn(
                      "text-xl font-semibold",
                      challenge.currentValue > challenge.initialBudget ? "text-green-600" :
                      challenge.currentValue < challenge.initialBudget ? "text-red-600" : ""
                    )}>
                      ${challenge.currentValue.toFixed(2)}
                      {challenge.status !== 'pending' && (
                        <span className="text-sm ml-2">
                          ({calculateGainPercentage(challenge) > 0 ? '+' : ''}
                          {calculateGainPercentage(challenge).toFixed(2)}%)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-muted-foreground">
                      {challenge.status === 'active' ? 'Progress:' : 'Timeline:'}
                    </p>
                    <p className="text-xs">
                      {format(challenge.startDate, 'MMM d')} - {format(challenge.endDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Progress 
                    value={calculateProgress(challenge)} 
                    className="h-2"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="text-center p-2 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground">Objective</p>
                    <p className="text-sm font-medium">{challenge.objective}</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground">Trades</p>
                    <p className="text-sm font-medium">{challenge.trades}</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="text-sm font-medium">
                      {challenge.trades > 0 ? `${challenge.winRate.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-2 pt-0">
                {challenge.status === 'pending' && (
                  <Button 
                    size="sm" 
                    onClick={() => startChallenge(challenge.id)}
                    className="flex items-center"
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                
                {challenge.status === 'active' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => pauseChallenge(challenge.id)}
                    className="flex items-center"
                  >
                    <PauseCircle className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => resetChallenge(challenge.id)}
                >
                  Reset
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Testing period: {format(new Date(), 'MMM d')} - {format(addDays(new Date(), 7), 'MMM d, yyyy')}
        </p>
        <Button variant="outline" size="sm">
          <Gauge className="h-4 w-4 mr-2" />
          Compare Results
        </Button>
      </CardFooter>
    </Card>
  );
};
