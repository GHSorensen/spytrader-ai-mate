
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, subMonths, subYears } from 'date-fns';
import type { 
  PerformanceMetrics, 
  TimeFrame, 
  BacktestResult 
} from '@/lib/types/spy';

import { PerformanceHeader } from './PerformanceHeader';
import { PerformanceSummaryCards } from './PerformanceSummaryCards';
import { EquityCurveChart } from './charts/EquityCurveChart';
import { MonthlyPerformanceChart } from './charts/MonthlyPerformanceChart';
import { ProfitDistributionChart } from './charts/ProfitDistributionChart';
import { StrategyPerformanceChart } from './charts/StrategyPerformanceChart';
import { TradeAnalysisContent } from './tabs/TradeAnalysisContent';
import { DrawdownsContent } from './tabs/DrawdownsContent';
import { BacktestsContent } from './tabs/BacktestsContent';
import { useMockData } from './hooks/useMockData';

const PerformanceDashboard = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1y');
  const { 
    mockPerformanceSummary, 
    mockTradeAnalytics, 
    mockPerformanceChartData, 
    mockBacktestResults,
    getMonthsForTimeFrame 
  } = useMockData();
  
  const [selectedBacktest, setSelectedBacktest] = useState<string>(mockBacktestResults[0].strategyId);

  // Filter data based on selected time frame
  const filteredData = useMemo(() => {
    let startDate: Date;
    
    switch (timeFrame) {
      case '1d':
        startDate = subDays(new Date(), 1);
        break;
      case '1w':
        startDate = subDays(new Date(), 7);
        break;
      case '1m':
        startDate = subMonths(new Date(), 1);
        break;
      case '3m':
        startDate = subMonths(new Date(), 3);
        break;
      case '6m':
        startDate = subMonths(new Date(), 6);
        break;
      case 'ytd':
        startDate = new Date(new Date().getFullYear(), 0, 1); // January 1st of current year
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // Just use a far back date
        break;
      case '1y':
      default:
        startDate = subYears(new Date(), 1);
        break;
    }
    
    return {
      equityCurve: mockPerformanceChartData.equityCurve.filter(item => item.date >= startDate),
      monthlyPerformance: mockPerformanceChartData.monthlyPerformance.slice(-getMonthsForTimeFrame(timeFrame)),
      profitDistribution: mockPerformanceChartData.profitDistribution,
      drawdowns: mockPerformanceChartData.drawdowns.filter(item => item.startDate >= startDate),
    };
  }, [timeFrame, mockPerformanceChartData, getMonthsForTimeFrame]);

  // Get selected backtest data
  const selectedBacktestData = useMemo(() => {
    return mockBacktestResults.find(result => result.strategyId === selectedBacktest) || mockBacktestResults[0];
  }, [selectedBacktest, mockBacktestResults]);

  const handleTimeFrameChange = (value: string) => {
    setTimeFrame(value as TimeFrame);
  };

  return (
    <div className="w-full space-y-4">
      <PerformanceHeader 
        timeFrame={timeFrame} 
        onTimeFrameChange={handleTimeFrameChange} 
      />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 md:w-[600px] mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trades">Trade Analysis</TabsTrigger>
          <TabsTrigger value="drawdowns">Drawdowns</TabsTrigger>
          <TabsTrigger value="backtests">Backtests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <PerformanceSummaryCards summary={mockPerformanceSummary} />
          
          <Card>
            <EquityCurveChart data={filteredData.equityCurve} />
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <MonthlyPerformanceChart data={filteredData.monthlyPerformance} />
            </Card>
            
            <Card>
              <ProfitDistributionChart data={filteredData.profitDistribution} />
            </Card>
          </div>
          
          <Card>
            <StrategyPerformanceChart strategies={mockTradeAnalytics.byStrategy} />
          </Card>
        </TabsContent>
        
        <TabsContent value="trades" className="space-y-4">
          <TradeAnalysisContent tradeAnalytics={mockTradeAnalytics} />
        </TabsContent>
        
        <TabsContent value="drawdowns" className="space-y-4">
          <DrawdownsContent 
            equityCurve={filteredData.equityCurve} 
            drawdowns={filteredData.drawdowns} 
          />
        </TabsContent>
        
        <TabsContent value="backtests" className="space-y-4">
          <BacktestsContent 
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
