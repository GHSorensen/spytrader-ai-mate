import React from 'react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, subMonths, subYears } from 'date-fns';
import type { PerformanceMetrics, PerformanceSummary, TradeAnalytics, PerformanceChartData, BacktestResult, TimeFrame, TradeHistoryEntry, StrategyPerformance, RiskToleranceType } from '@/lib/types/spy';

// Mock data for development
const mockPerformanceSummary: PerformanceSummary = {
  today: {
    profit: 1250.75,
    percentageChange: 2.3,
    tradesOpened: 5,
    tradesClosed: 3,
  },
  week: {
    profit: 3450.25,
    percentageChange: 5.8,
    tradesOpened: 12,
    tradesClosed: 10,
  },
  month: {
    profit: 8750.50,
    percentageChange: 12.4,
    tradesOpened: 45,
    tradesClosed: 42,
  },
  year: {
    profit: 42500.75,
    percentageChange: 35.2,
    tradesOpened: 215,
    tradesClosed: 205,
    winRate: 68.5,
  },
  allTime: {
    profit: 87500.25,
    percentageChange: 87.5,
    totalTrades: 450,
    winRate: 71.2,
    startDate: new Date('2022-01-01'),
  },
};

const mockTradeAnalytics: TradeAnalytics = {
  byStrategy: [
    {
      strategyId: '1',
      strategyName: 'Momentum Breakout',
      trades: 120,
      winRate: 72.5,
      averageReturn: 15.3,
      totalProfit: 25750.50,
    },
    {
      strategyId: '2',
      strategyName: 'Volatility Crush',
      trades: 85,
      winRate: 68.2,
      averageReturn: 12.8,
      totalProfit: 18250.75,
    },
    {
      strategyId: '3',
      strategyName: 'Mean Reversion',
      trades: 95,
      winRate: 65.8,
      averageReturn: 10.5,
      totalProfit: 15500.25,
    },
    {
      strategyId: '4',
      strategyName: 'Trend Following',
      trades: 150,
      winRate: 75.3,
      averageReturn: 18.2,
      totalProfit: 28000.50,
    },
  ],
  byOptionType: [
    {
      type: 'CALL',
      trades: 250,
      winRate: 73.5,
      averageReturn: 16.8,
      totalProfit: 48750.25,
    },
    {
      type: 'PUT',
      trades: 200,
      winRate: 68.5,
      averageReturn: 14.2,
      totalProfit: 38750.50,
    },
  ],
  byExpiry: [
    {
      expiry: 'daily',
      trades: 120,
      winRate: 65.8,
      averageReturn: 12.5,
      totalProfit: 22500.75,
    },
    {
      expiry: 'weekly',
      trades: 220,
      winRate: 72.5,
      averageReturn: 15.8,
      totalProfit: 42500.50,
    },
    {
      expiry: 'monthly',
      trades: 110,
      winRate: 75.2,
      averageReturn: 18.5,
      totalProfit: 22500.25,
    },
  ],
  byHoldingPeriod: [
    {
      period: '0-1 days',
      trades: 150,
      winRate: 68.5,
      averageReturn: 12.8,
      totalProfit: 28750.50,
    },
    {
      period: '1-3 days',
      trades: 180,
      winRate: 72.5,
      averageReturn: 15.3,
      totalProfit: 35500.25,
    },
    {
      period: '3-7 days',
      trades: 85,
      winRate: 75.8,
      averageReturn: 18.2,
      totalProfit: 18250.75,
    },
    {
      period: '>7 days',
      trades: 35,
      winRate: 62.5,
      averageReturn: 10.5,
      totalProfit: 5000.50,
    },
  ],
};

// Generate mock equity curve data
const generateEquityCurveData = (days: number, startValue: number = 100000) => {
  const data = [];
  let currentValue = startValue;
  let benchmarkValue = startValue;
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    
    // Random daily change between -2% and 3%
    const dailyChange = (Math.random() * 5 - 2) / 100;
    currentValue = currentValue * (1 + dailyChange);
    
    // Random benchmark change between -1.5% and 2%
    const benchmarkChange = (Math.random() * 3.5 - 1.5) / 100;
    benchmarkValue = benchmarkValue * (1 + benchmarkChange);
    
    data.push({
      date,
      value: Math.round(currentValue * 100) / 100,
      benchmarkValue: Math.round(benchmarkValue * 100) / 100,
    });
  }
  
  return data;
};

// Generate mock monthly performance data
const generateMonthlyPerformanceData = (months: number) => {
  const data = [];
  const currentDate = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(currentDate, i);
    const monthName = format(date, 'MMM yyyy');
    
    // Random monthly return between -15% and 20%
    const monthlyReturn = Math.round((Math.random() * 35 - 15) * 10) / 10;
    
    data.push({
      month: monthName,
      return: monthlyReturn,
    });
  }
  
  return data;
};

// Generate mock profit distribution data
const generateProfitDistributionData = () => {
  const ranges = [
    '-50% to -40%',
    '-40% to -30%',
    '-30% to -20%',
    '-20% to -10%',
    '-10% to 0%',
    '0% to 10%',
    '10% to 20%',
    '20% to 30%',
    '30% to 40%',
    '40% to 50%',
    '50%+',
  ];
  
  return ranges.map(range => ({
    range,
    count: Math.floor(Math.random() * 50) + (range.includes('-') ? 5 : 15), // More positive results
  }));
};

// Generate mock drawdowns data
const generateDrawdownsData = (count: number) => {
  const data = [];
  const currentDate = new Date();
  
  for (let i = 0; i < count; i++) {
    const startDate = subDays(currentDate, Math.floor(Math.random() * 365) + 30);
    const durationDays = Math.floor(Math.random() * 30) + 5;
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    data.push({
      startDate,
      endDate,
      duration: durationDays,
      depthPercent: Math.round((Math.random() * 25 + 5) * 10) / 10, // 5% to 30%
      recoveryDays: Math.floor(Math.random() * 45) + 5,
    });
  }
  
  // Sort by depth (largest first)
  return data.sort((a, b) => b.depthPercent - a.depthPercent);
};

// Mock performance chart data
const mockPerformanceChartData: PerformanceChartData = {
  equityCurve: generateEquityCurveData(365),
  profitDistribution: generateProfitDistributionData(),
  monthlyPerformance: generateMonthlyPerformanceData(24),
  drawdowns: generateDrawdownsData(10),
};

// Mock backtest results
const mockBacktestResults: BacktestResult[] = [
  {
    strategyId: '1',
    strategyName: 'Conservative Strategy',
    riskProfile: 'conservative',
    performanceMetrics: {
      totalTrades: 250,
      winRate: 68.5,
      profitFactor: 2.3,
      averageWin: 15.2,
      averageLoss: -8.5,
      netProfit: 35250.75,
      totalProfit: 48750.25,
      totalLoss: -13500.50,
      maxDrawdown: 12.5,
      sharpeRatio: 1.8,
      successfulTrades: 171,
      failedTrades: 79,
      averageDuration: 120, // in minutes
      bestTrade: 45.8,
      worstTrade: -22.5,
      consecutiveWins: 12,
      consecutiveLosses: 5,
      returnsVolatility: 15.2,
      sortinoRatio: 2.1,
      calmarRatio: 1.5,
      dailyReturns: Array(30).fill(0).map((_, i) => ({
        date: subDays(new Date(), i),
        return: (Math.random() * 6 - 2) / 100, // -2% to 4%
      })),
      monthlyReturns: Array(12).fill(0).map((_, i) => ({
        month: format(subMonths(new Date(), i), 'MMM yyyy'),
        return: (Math.random() * 15 - 5) / 100, // -5% to 10%
      })),
      annualReturns: Array(3).fill(0).map((_, i) => ({
        year: new Date().getFullYear() - i,
        return: (Math.random() * 40 - 10) / 100, // -10% to 30%
      })),
      riskAdjustedReturn: 18.5,
      kellyPercentage: 25.2,
      dollarReturn: 35250.75,
      percentageReturn: 35.25,
      benchmarkComparison: {
        spyReturn: 12.5,
        outperformance: 22.75,
      },
    },
    equityCurve: generateEquityCurveData(365, 100000).map(item => ({
      date: item.date,
      equity: item.value,
    })),
    trades: [], // Would contain actual trade data
    startDate: subYears(new Date(), 1),
    endDate: new Date(),
    initialCapital: 100000,
    finalCapital: 135250.75,
    maxDrawdown: {
      amount: 15250.50,
      percentage: 12.5,
      startDate: subMonths(new Date(), 6),
      endDate: subMonths(new Date(), 5),
    },
    annualizedReturn: 35.25,
    marketBenchmarkReturn: 12.5,
  },
  {
    strategyId: '2',
    strategyName: 'Moderate Strategy',
    riskProfile: 'moderate',
    performanceMetrics: {
      totalTrades: 350,
      winRate: 65.2,
      profitFactor: 2.1,
      averageWin: 18.5,
      averageLoss: -10.2,
      netProfit: 42500.50,
      totalProfit: 62500.75,
      totalLoss: -20000.25,
      maxDrawdown: 18.2,
      sharpeRatio: 1.6,
      successfulTrades: 228,
      failedTrades: 122,
      averageDuration: 180, // in minutes
      bestTrade: 55.2,
      worstTrade: -28.5,
      consecutiveWins: 10,
      consecutiveLosses: 6,
      returnsVolatility: 18.5,
      sortinoRatio: 1.9,
      calmarRatio: 1.3,
      dailyReturns: Array(30).fill(0).map((_, i) => ({
        date: subDays(new Date(), i),
        return: (Math.random() * 8 - 3) / 100, // -3% to 5%
      })),
      monthlyReturns: Array(12).fill(0).map((_, i) => ({
        month: format(subMonths(new Date(), i), 'MMM yyyy'),
        return: (Math.random() * 20 - 8) / 100, // -8% to 12%
      })),
      annualReturns: Array(3).fill(0).map((_, i) => ({
        year: new Date().getFullYear() - i,
        return: (Math.random() * 50 - 15) / 100, // -15% to 35%
      })),
      riskAdjustedReturn: 22.5,
      kellyPercentage: 28.5,
      dollarReturn: 42500.50,
      percentageReturn: 42.5,
      benchmarkComparison: {
        spyReturn: 12.5,
        outperformance: 30.0,
      },
    },
    equityCurve: generateEquityCurveData(365, 100000).map(item => ({
      date: item.date,
      equity: item.value,
    })),
    trades: [], // Would contain actual trade data
    startDate: subYears(new Date(), 1),
    endDate: new Date(),
    initialCapital: 100000,
    finalCapital: 142500.50,
    maxDrawdown: {
      amount: 22500.25,
      percentage: 18.2,
      startDate: subMonths(new Date(), 8),
      endDate: subMonths(new Date(), 7),
    },
    annualizedReturn: 42.5,
    marketBenchmarkReturn: 12.5,
  },
  {
    strategyId: '3',
    strategyName: 'Aggressive Strategy',
    riskProfile: 'aggressive',
    performanceMetrics: {
      totalTrades: 450,
      winRate: 62.5,
      profitFactor: 1.9,
      averageWin: 25.2,
      averageLoss: -15.5,
      netProfit: 55000.25,
      totalProfit: 85000.50,
      totalLoss: -30000.25,
      maxDrawdown: 25.5,
      sharpeRatio: 1.4,
      successfulTrades: 281,
      failedTrades: 169,
      averageDuration: 240, // in minutes
      bestTrade: 75.5,
      worstTrade: -38.2,
      consecutiveWins: 8,
      consecutiveLosses: 7,
      returnsVolatility: 22.5,
      sortinoRatio: 1.7,
      calmarRatio: 1.1,
      dailyReturns: Array(30).fill(0).map((_, i) => ({
        date: subDays(new Date(), i),
        return: (Math.random() * 10 - 4) / 100, // -4% to 6%
      })),
      monthlyReturns: Array(12).fill(0).map((_, i) => ({
        month: format(subMonths(new Date(), i), 'MMM yyyy'),
        return: (Math.random() * 25 - 10) / 100, // -10% to 15%
      })),
      annualReturns: Array(3).fill(0).map((_, i) => ({
        year: new Date().getFullYear() - i,
        return: (Math.random() * 60 - 20) / 100, // -20% to 40%
      })),
      riskAdjustedReturn: 28.5,
      kellyPercentage: 32.5,
      dollarReturn: 55000.25,
      percentageReturn: 55.0,
      benchmarkComparison: {
        spyReturn: 12.5,
        outperformance: 42.5,
      },
    },
    equityCurve: generateEquityCurveData(365, 100000).map(item => ({
      date: item.date,
      equity: item.value,
    })),
    trades: [], // Would contain actual trade data
    startDate: subYears(new Date(), 1),
    endDate: new Date(),
    initialCapital: 100000,
    finalCapital: 155000.25,
    maxDrawdown: {
      amount: 32500.50,
      percentage: 25.5,
      startDate: subMonths(new Date(), 5),
      endDate: subMonths(new Date(), 3),
    },
    annualizedReturn: 55.0,
    marketBenchmarkReturn: 12.5,
  },
];

const PerformanceDashboard = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1y');
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
  }, [timeFrame]);

  // Get selected backtest data
  const selectedBacktestData = useMemo(() => {
    return mockBacktestResults.find(result => result.strategyId === selectedBacktest) || mockBacktestResults[0];
  }, [selectedBacktest]);

  // Helper function to determine how many months to show based on time frame
  const getMonthsForTimeFrame = (tf: TimeFrame): number => {
    switch (tf) {
      case '1d':
      case '1w':
        return 1;
      case '1m':
        return 3;
      case '3m':
        return 6;
      case '6m':
        return 9;
      case '1y':
        return 12;
      case 'ytd':
        return new Date().getMonth() + 1; // Current month index + 1
      case 'all':
      default:
        return 24; // Show all available data
    }
  };

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
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockPerformanceSummary.allTime.profit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{mockPerformanceSummary.allTime.percentageChange}% all time
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPerformanceSummary.allTime.winRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {mockPerformanceSummary.allTime.totalTrades} total trades
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockPerformanceSummary.today.profit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {mockPerformanceSummary.today.percentageChange > 0 ? '+' : ''}{mockPerformanceSummary.today.percentageChange}% today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPerformanceSummary.today.tradesOpened - mockPerformanceSummary.today.tradesClosed}</div>
                <p className="text-xs text-muted-foreground">
                  {mockPerformanceSummary.today.tradesOpened} opened today
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
              <CardDescription>Portfolio value over time compared to SPY benchmark</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredData.equityCurve}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      if (timeFrame === '1d') return format(new Date(date), 'HH:mm');
                      if (timeFrame === '1w') return format(new Date(date), 'EEE');
                      if (timeFrame === '1m') return format(new Date(date), 'dd MMM');
                      return format(new Date(date), 'MMM yyyy');
                    }}
                  />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                    labelFormatter={(date) => format(new Date(date), 'PPP')}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    name="Portfolio"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="benchmarkValue" 
                    stroke="#82ca9d" 
                    fillOpacity={1} 
                    fill="url(#colorBenchmark)" 
                    name="SPY Benchmark"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Returns by month for the selected period</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData.monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Return']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="return">
                      {filteredData.monthlyPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.return >= 0 ? "#10b981" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Profit Distribution</CardTitle>
                <CardDescription>Distribution of trade returns</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredData.profitDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="range" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Trades" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Strategy Performance</CardTitle>
              <CardDescription>Comparison of different trading strategies</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockTradeAnalytics.byStrategy}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strategyName" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => `${value}%`} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="trades" name="Number of Trades" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="winRate" name="Win Rate (%)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trades by Strategy</CardTitle>
              <CardDescription>Performance breakdown by trading strategy</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockTradeAnalytics.byStrategy}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strategyName" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => `${value}%`} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalProfit" name="Total Profit ($)" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="winRate" name="Win Rate (%)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Trades by Option Type</CardTitle>
                <CardDescription>Performance breakdown by call vs put options</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockTradeAnalytics.byOptionType}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="type" />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Win Rate']}
                    />
                    <Legend />
                    <Bar dataKey="winRate" name="Win Rate">
                      {mockTradeAnalytics.byOptionType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.winRate >= 50 ? "#10b981" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trades by Expiry</CardTitle>
                <CardDescription>Performance breakdown by option expiration</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockTradeAnalytics.byExpiry}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="expiry" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Win Rate']} />
                    <Legend />
                    <Bar dataKey="winRate" name="Win Rate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Holding Period Analysis</CardTitle>
              <CardDescription>Performance by trade duration</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mockTradeAnalytics.byHoldingPeriod}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => `${value}%`} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="trades" name="Number of Trades" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="winRate" name="Win Rate (%)" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drawdowns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drawdown Analysis</CardTitle>
              <CardDescription>Historical drawdowns and recovery periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={filteredData.equityCurve}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                      />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                        labelFormatter={(date) => format(new Date(date), 'PPP')}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ef4444" 
                        fillOpacity={1} 
                        fill="url(#colorDrawdown)" 
                        name="Portfolio Value"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium border-b">
                    <div>Start Date</div>
                    <div>End Date</div>
                    <div>Duration (Days)</div>
                    <div>Depth (%)</div>
                    <div>Recovery (Days)</div>
                  </div>
                  {filteredData.drawdowns.slice(0, 5).map((drawdown, index) => (
                    <div key={index} className="grid grid-cols-5 p-4 border-b last:border-0">
                      <div>{format(drawdown.startDate, 'MMM d, yyyy')}</div>
                      <div>{format(drawdown.endDate, 'MMM d, yyyy')}</div>
                      <div>{drawdown.duration}</div>
                      <div className="text-red-500">-{drawdown.depthPercent}%</div>
                      <div>{drawdown.recoveryDays}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backtests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Backtest Results</h3>
            <Select value={selectedBacktest} onValueChange={setSelectedBacktest}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                {mockBacktestResults.map(result => (
                  <SelectItem key={result.strategyId} value={result.strategyId}>
                    {result.strategyName} ({result.riskProfile})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${selectedBacktestData.performanceMetrics.netProfit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedBacktestData.performanceMetrics.percentageReturn}% return
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedBacktestData.performanceMetrics.winRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {selectedBacktestData.performanceMetrics.successfulTrades} / {selectedBacktestData.performanceMetrics.totalTrades} trades
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">-{selectedBacktestData.maxDrawdown.percentage}%</div>
                <p className="text-xs text-muted-foreground">
                  ${selectedBacktestData.maxDrawdown.amount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedBacktestData.performanceMetrics.sharpeRatio.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Risk-adjusted return
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
              <CardDescription>Portfolio value over the backtest period</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={selectedBacktestData.equityCurve}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorBacktest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                  />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                    labelFormatter={(date) => format(new Date(date), 'PPP')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorBacktest)" 
                    name="Portfolio Value"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Returns</CardTitle>
                <CardDescription>Performance by month during backtest</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedBacktestData.performanceMetrics.monthlyReturns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value * 100}%`} />
                    <Tooltip 
                      formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, 'Return']}
                    />
                    <Legend />
                    <Bar dataKey="return" name="Monthly Return" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Detailed backtest statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Trades:</span>
                      <span className="font-medium">{selectedBacktestData.performanceMetrics.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win Rate:</span>
                      <span className="font-medium">{selectedBacktestData.performanceMetrics.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit Factor:</span>
                      <span className="font-medium">{selectedBacktestData.performanceMetrics.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Win:</span>
                      <span className="font-medium">{selectedBacktestData.performanceMetrics.averageWin}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Loss:</span>
                      <span className="font-medium">{selectedBacktestData.performanceMetrics.averageLoss}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best Trade:</span>
                      <span className="font-medium">{selectedBacktestData.performanceMetrics.bestTrade}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sharpe Ratio:</span>
                      <span className="font-medium">{selectedBacktestData.performanceMetrics.sharpeRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sortino Ratio:</span>
                      <span className="font-medium">{selectedBacktestData.performanceMetrics.sortinoRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Calmar Ratio:</span>
                      <span className="font-medium">{selectedBacktestData.performanceMetrics.calmarRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Drawdown:</span>
                      <span className="font-medium text-red-500">-{selectedBacktestData.maxDrawdown.percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annualized Return:</span>
                      <span className="font-medium">{selectedBacktestData.annualizedReturn}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">vs. Benchmark:</span>
                      <span className="font-medium text-green-500">+{selectedBacktestData.performanceMetrics.benchmarkComparison.outperformance}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
