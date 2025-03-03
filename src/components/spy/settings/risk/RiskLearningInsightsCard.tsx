
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LightbulbIcon } from 'lucide-react';
import { LearningInsight } from '@/lib/types/spy/riskMonitoring';
import { InsightItem } from './components/InsightItem';
import { NoInsightsMessage } from './components/NoInsightsMessage';
import { Skeleton } from "@/components/ui/skeleton";

interface RiskLearningInsightsCardProps {
  insights: LearningInsight[];
  isLoading: boolean;
}

export const RiskLearningInsightsCard: React.FC<RiskLearningInsightsCardProps> = ({
  insights,
  isLoading
}) => {
  const [insightFilter, setInsightFilter] = useState<'all' | 'successful' | 'unsuccessful'>('all');
  
  // Filter insights based on selected filter
  const filteredInsights = insights.filter(insight => {
    if (insightFilter === 'all') return true;
    if (insightFilter === 'successful') return insight.successRate >= 0.6;
    if (insightFilter === 'unsuccessful') return insight.successRate < 0.6;
    return true;
  });
  
  // Sort insights by timestamp (newest first)
  const sortedInsights = [...filteredInsights].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-primary" />
            Learning Insights
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-2/3" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-4" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5 text-primary" />
          Learning Insights
        </CardTitle>
        <CardDescription>
          AI-powered patterns and insights from your trading history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => 
          setInsightFilter(value as 'all' | 'successful' | 'unsuccessful')
        }>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All Insights</TabsTrigger>
            <TabsTrigger value="successful">Successful</TabsTrigger>
            <TabsTrigger value="unsuccessful">Needs Improvement</TabsTrigger>
          </TabsList>
          
          <TabsContent value={insightFilter} className="mt-0">
            <ScrollArea className="h-[300px] pr-4">
              {sortedInsights.length === 0 ? (
                <NoInsightsMessage />
              ) : (
                sortedInsights.map((insight) => (
                  <InsightItem key={insight.id} insight={insight} />
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
