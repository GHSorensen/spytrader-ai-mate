
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TimeFrame, BacktestResult } from '@/lib/types/spy';

// Import components
import { OverviewTabContent } from './performance/tabs/OverviewTabContent';
import { TradeAnalysisTabContent } from './performance/tabs/TradeAnalysisTabContent';
import { DrawdownsTabContent } from './performance/tabs/DrawdownsTabContent';
import { BacktestsTabContent } from './performance/tabs/BacktestsTabContent';

// Import hooks
import { useMockPerformanceData } from './performance/hooks/useMockPerformanceData';
import { useFilteredData, getMonthsForTimeFrame } from './performance/hooks/useFilteredData';

const PerformanceDashboard = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1y');
  const { 
    mockPerformanceSummary, 
    mockTradeAnalytics, 
    mockPerformanceChartData, 
    mockBacktestResults 
  } = useMockPerformanceData();
  
  const [selectedBacktest, setSelectedBacktest] = useState<string>(mockBacktestResults[0].strategyId);

  // Filter data based on selected time frame
  const filteredData = useFilteredData(mockPerformanceChartData, timeFrame);

  // Get selected backtest data
  const selectedBacktestData = useMemo(() => {
    return mockBacktestResults.find(result => result.strategyId === selectedBacktest) || mockBacktestResults[0];
  }, [selectedBacktest, mockBacktestResults]);

  const handleTimeFrameChange = (value: string) => {
    setTimeFrame(value as TimeFrame);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Analyze your trading performance and strategy effectiveness
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeFrame} onValueChange={handleTimeFrameChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="1w">1 Week</SelectItem>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 md:w-[600px] mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trades">Trade Analysis</TabsTrigger>
          <TabsTrigger value="drawdowns">Drawdowns</TabsTrigger>
          <TabsTrigger value="backtests">Backtests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTabContent 
            performanceSummary={mockPerformanceSummary}
            tradeAnalytics={mockTradeAnalytics}
            filteredData={filteredData}
          />
        </TabsContent>
        
        <TabsContent value="trades">
          <TradeAnalysisTabContent tradeAnalytics={mockTradeAnalytics} />
        </TabsContent>
        
        <TabsContent value="drawdowns">
          <DrawdownsTabContent 
            equityCurve={filteredData.equityCurve}
            drawdowns={filteredData.drawdowns}
          />
        </TabsContent>
        
        <TabsContent value="backtests">
          <BacktestsTabContent 
            backtestResults={mockBacktestResults}
            selectedBacktest={selectedBacktest}
            onSelectBacktest={setSelectedBacktest}
            selectedBacktestData={selectedBacktestData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
