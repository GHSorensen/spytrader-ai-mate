
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  PerformanceMetrics, 
  PerformanceSummary, 
  TradeAnalytics,
  PerformanceChartData,
  TimeFrame
} from '@/lib/types/spyOptions';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Percent,
  BarChart2,
  LineChart,
  TimerIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Mock data (to be replaced with real data from an API or state)
const mockPerformanceSummary: PerformanceSummary = {
  today: {
    profit: 1250.75,
    percentageChange: 2.3,
    tradesOpened: 5,
    tradesClosed: 3
  },
  week: {
    profit: 3420.50,
    percentageChange: 4.7,
    tradesOpened: 12,
    tradesClosed: 10
  },
  month: {
    profit: 9875.25,
    percentageChange: 8.2,
    tradesOpened: 45,
    tradesClosed: 42
  },
  year: {
    profit: 58450.75,
    percentageChange: 32.5,
    tradesOpened: 215,
    tradesClosed: 205,
    winRate: 67.3
  },
  allTime: {
    profit: 124550.25,
    percentageChange: 78.4,
    totalTrades: 512,
    winRate: 64.8,
    startDate: new Date(2021, 0, 1)
  }
};

const mockPerformanceMetrics: PerformanceMetrics = {
  totalTrades: 512,
  winRate: 64.8,
  profitFactor: 2.75,
  averageWin: 1856.32,
  averageLoss: -687.45,
  netProfit: 124550.25,
  totalProfit: 186532.50,
  totalLoss: -61982.25,
  maxDrawdown: 18425.75,
  sharpeRatio: 1.82,
  successfulTrades: 332,
  failedTrades: 180,
  averageDuration: 1240, // minutes
  bestTrade: 12450.75,
  worstTrade: -4532.25,
  consecutiveWins: 14,
  consecutiveLosses: 5,
  returnsVolatility: 22.5,
  sortinoRatio: 2.34,
  calmarRatio: 1.37,
  dailyReturns: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2023, 0, i + 1),
    return: Math.random() * 5 - 1.5
  })),
  monthlyReturns: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2023, i, 1).toLocaleString('default', { month: 'short' }),
    return: Math.random() * 10 - 2.5
  })),
  annualReturns: [
    { year: 2021, return: 18.7 },
    { year: 2022, return: 14.3 },
    { year: 2023, return: 28.2 }
  ],
  riskAdjustedReturn: 1.68,
  kellyPercentage: 32.4,
  dollarReturn: 124550.25,
  percentageReturn: 78.4,
  benchmarkComparison: {
    spyReturn: 42.6,
    outperformance: 35.8
  }
};

const mockChartData: PerformanceChartData = {
  equityCurve: Array.from({ length: 365 }, (_, i) => {
    const date = new Date(2023, 0, 1);
    date.setDate(date.getDate() + i);
    const baseValue = 100000 + (i * 150);
    return {
      date,
      value: baseValue + (Math.random() * 10000 - 3000),
      benchmarkValue: 100000 + (i * 100) + (Math.random() * 5000 - 1500)
    };
  }),
  profitDistribution: [
    { range: '-50% to -40%', count: 5 },
    { range: '-40% to -30%', count: 11 },
    { range: '-30% to -20%', count: 24 },
    { range: '-20% to -10%', count: 42 },
    { range: '-10% to 0%', count: 98 },
    { range: '0% to 10%', count: 126 },
    { range: '10% to 20%', count: 88 },
    { range: '20% to 30%', count: 64 },
    { range: '30% to 40%', count: 33 },
    { range: '40% to 50%', count: 15 },
    { range: '50%+', count: 6 }
  ],
  monthlyPerformance: Array.from({ length: 24 }, (_, i) => {
    const date = new Date(2022, 0, 1);
    date.setMonth(date.getMonth() + i);
    return {
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      return: Math.random() * 20 - 5
    };
  }),
  drawdowns: [
    {
      startDate: new Date(2023, 1, 15),
      endDate: new Date(2023, 2, 10),
      duration: 24,
      depthPercent: 15.4,
      recoveryDays: 18
    },
    {
      startDate: new Date(2023, 5, 3),
      endDate: new Date(2023, 5, 28),
      duration: 25,
      depthPercent: 12.8,
      recoveryDays: 22
    },
    {
      startDate: new Date(2023, 9, 10),
      endDate: new Date(2023, 10, 5),
      duration: 26,
      depthPercent: 18.2,
      recoveryDays: 32
    }
  ]
};

const mockTradeAnalytics: TradeAnalytics = {
  byStrategy: [
    {
      strategyId: 'momentum',
      strategyName: 'Momentum',
      trades: 182,
      winRate: 68.5,
      averageReturn: 3.2,
      totalProfit: 53240.50
    },
    {
      strategyId: 'trend-following',
      strategyName: 'Trend Following',
      trades: 156,
      winRate: 61.2,
      averageReturn: 2.8,
      totalProfit: 42318.75
    },
    {
      strategyId: 'vol-breakout',
      strategyName: 'Volatility Breakout',
      trades: 98,
      winRate: 58.4,
      averageReturn: 3.4,
      totalProfit: 24786.25
    },
    {
      strategyId: 'mean-reversion',
      strategyName: 'Mean Reversion',
      trades: 76,
      winRate: 70.3,
      averageReturn: 2.3,
      totalProfit: 18205.75
    }
  ],
  byOptionType: [
    {
      type: 'CALL',
      trades: 302,
      winRate: 67.2,
      averageReturn: 3.1,
      totalProfit: 72482.50
    },
    {
      type: 'PUT',
      trades: 210,
      winRate: 61.4,
      averageReturn: 2.9,
      totalProfit: 52068.75
    }
  ],
  byExpiry: [
    {
      expiry: 'daily',
      trades: 124,
      winRate: 58.2,
      averageReturn: 4.2,
      totalProfit: 32568.25
    },
    {
      expiry: 'weekly',
      trades: 298,
      winRate: 65.8,
      averageReturn: 2.8,
      totalProfit: 68743.50
    },
    {
      expiry: 'monthly',
      trades: 90,
      winRate: 72.3,
      averageReturn: 2.3,
      totalProfit: 23238.50
    }
  ],
  byHoldingPeriod: [
    {
      period: '0-1 days',
      trades: 186,
      winRate: 61.8,
      averageReturn: 2.6,
      totalProfit: 42580.25
    },
    {
      period: '1-3 days',
      trades: 214,
      winRate: 65.4,
      averageReturn: 3.1,
      totalProfit: 56432.75
    },
    {
      period: '3-7 days',
      trades: 85,
      winRate: 68.2,
      averageReturn: 2.9,
      totalProfit: 20438.50
    },
    {
      period: '>7 days',
      trades: 27,
      winRate: 70.4,
      averageReturn: 2.4,
      totalProfit: 5098.75
    }
  ]
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const PerformanceDashboard = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1m');

  // Filter chart data based on selected time frame
  const getFilteredChartData = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeFrame) {
      case '1d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        break;
      case '1w':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        return mockChartData.equityCurve;
    }
    
    return mockChartData.equityCurve.filter(point => point.date >= startDate);
  };

  const equityCurveData = getFilteredChartData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
        <p className="text-muted-foreground">
          Track the performance of your AI-powered SPY options trading.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total P&L
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockPerformanceSummary.allTime.profit)}
            </div>
            <div className="flex items-center pt-1">
              {mockPerformanceSummary.allTime.percentageChange > 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-rose-500" />
              )}
              <p className={`text-xs ${mockPerformanceSummary.allTime.percentageChange > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatPercentage(mockPerformanceSummary.allTime.percentageChange)}
              </p>
              <p className="text-xs text-muted-foreground ml-2">
                since {formatDate(mockPerformanceSummary.allTime.startDate)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Win Rate
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(mockPerformanceSummary.allTime.winRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockPerformanceSummary.allTime.totalTrades} total trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sharpe Ratio
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPerformanceMetrics.sharpeRatio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Max Drawdown
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(mockPerformanceMetrics.maxDrawdown / mockPerformanceMetrics.netProfit * 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(mockPerformanceMetrics.maxDrawdown)} peak to trough
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equity Growth</CardTitle>
          <CardDescription>
            Performance compared to SPY benchmark
          </CardDescription>
          <div className="flex space-x-2 pt-2">
            {(['1d', '1w', '1m', '3m', '6m', '1y', 'ytd', 'all'] as TimeFrame[]).map((tf) => (
              <Button 
                key={tf}
                variant={timeFrame === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFrame(tf)}
                className="h-8"
              >
                {tf.toUpperCase()}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={equityCurveData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return d.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    ...(timeFrame === '1y' || timeFrame === 'all' ? { year: '2-digit' } : {})
                  });
                }}
                tick={{ fontSize: 12 }}
                minTickGap={20}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, undefined]}
                labelFormatter={(date) => formatDate(new Date(date))}
              />
              <Area 
                type="monotone" 
                name="AI Strategy" 
                dataKey="value" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorPortfolio)" 
              />
              <Area 
                type="monotone" 
                name="SPY Benchmark" 
                dataKey="benchmarkValue" 
                stroke="#82ca9d" 
                fillOpacity={1}
                fill="url(#colorBenchmark)" 
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Starting: <span className="font-medium">{formatCurrency(equityCurveData[0]?.value || 0)}</span>
            </div>
            <div className="flex space-x-2">
              <div>
                Current: <span className="font-medium">{formatCurrency(equityCurveData[equityCurveData.length - 1]?.value || 0)}</span>
              </div>
              <div>|</div>
              <div>
                Change: <span className={`font-medium ${equityCurveData[equityCurveData.length - 1]?.value - equityCurveData[0]?.value > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {formatPercentage((equityCurveData[equityCurveData.length - 1]?.value / equityCurveData[0]?.value - 1) * 100)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Performance Summary</TabsTrigger>
          <TabsTrigger value="analysis">Strategy Analysis</TabsTrigger>
          <TabsTrigger value="distribution">Return Distribution</TabsTrigger>
          <TabsTrigger value="drawdowns">Drawdowns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Key Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Profit Factor</p>
                      <p className="text-xl font-semibold">{mockPerformanceMetrics.profitFactor.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Calmar Ratio</p>
                      <p className="text-xl font-semibold">{mockPerformanceMetrics.calmarRatio.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Average Win</p>
                      <p className="text-xl font-semibold">{formatCurrency(mockPerformanceMetrics.averageWin)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Average Loss</p>
                      <p className="text-xl font-semibold">{formatCurrency(Math.abs(mockPerformanceMetrics.averageLoss))}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Best Trade</p>
                      <p className="text-xl font-semibold text-emerald-500">{formatCurrency(mockPerformanceMetrics.bestTrade)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Worst Trade</p>
                      <p className="text-xl font-semibold text-rose-500">{formatCurrency(Math.abs(mockPerformanceMetrics.worstTrade))}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Monthly Returns</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={mockPerformanceMetrics.monthlyReturns}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `${value}%`}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11 }}
                          width={30}
                        />
                        <Tooltip 
                          formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Return']}
                          cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar 
                          dataKey="return" 
                          fill={(data) => data.return >= 0 ? "#10b981" : "#ef4444"} 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Time Period Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mockPerformanceSummary).map(([period, data]) => {
                    if (period === 'allTime') return null;
                    
                    return (
                      <div key={period} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium capitalize">{period}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.tradesOpened} trades opened, {data.tradesClosed} closed
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(data.profit)}</p>
                          <p className={`text-sm ${data.percentageChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {data.percentageChange >= 0 ? '+' : ''}{data.percentageChange.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 rounded-lg bg-muted p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">Compared to Benchmark</p>
                      <p className="text-2xl font-bold mt-1">
                        {mockPerformanceMetrics.benchmarkComparison.outperformance >= 0 ? '+' : ''}
                        {mockPerformanceMetrics.benchmarkComparison.outperformance.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-right text-muted-foreground">SPY Return</p>
                      <p className="text-right">{mockPerformanceMetrics.benchmarkComparison.spyReturn.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TimerIcon className="mr-2 h-5 w-5" />
                Trade Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                  <p className="text-xl font-semibold">{mockPerformanceMetrics.totalTrades}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Winning Trades</p>
                  <p className="text-xl font-semibold text-emerald-500">{mockPerformanceMetrics.successfulTrades}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Losing Trades</p>
                  <p className="text-xl font-semibold text-rose-500">{mockPerformanceMetrics.failedTrades}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Average Duration</p>
                  <p className="text-xl font-semibold">
                    {(mockPerformanceMetrics.averageDuration / 60).toFixed(1)} hrs
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Consecutive Wins</p>
                  <p className="text-xl font-semibold">{mockPerformanceMetrics.consecutiveWins}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Consecutive Losses</p>
                  <p className="text-xl font-semibold">{mockPerformanceMetrics.consecutiveLosses}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kelly Percentage</p>
                  <p className="text-xl font-semibold">{mockPerformanceMetrics.kellyPercentage.toFixed(1)}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Risk-Adjusted Return</p>
                  <p className="text-xl font-semibold">{mockPerformanceMetrics.riskAdjustedReturn.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Performance by Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTradeAnalytics.byStrategy.map((strategy) => (
                    <div key={strategy.strategyId} className="flex justify-between items-start border-b pb-3">
                      <div>
                        <p className="font-medium">{strategy.strategyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {strategy.trades} trades, {strategy.winRate.toFixed(1)}% win rate
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(strategy.totalProfit)}</p>
                        <p className="text-sm text-muted-foreground">
                          {strategy.averageReturn.toFixed(1)}% avg return
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Performance by Option Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockTradeAnalytics.byOptionType}
                      layout="vertical"
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis 
                        dataKey="type" 
                        type="category" 
                        tick={{ fontSize: 12 }} 
                        width={50}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}`, undefined]}
                        labelFormatter={(label) => `${label} Options`}
                      />
                      <Legend />
                      <Bar name="Win Rate (%)" dataKey="winRate" fill="#10b981" />
                      <Bar name="Avg Return (%)" dataKey="averageReturn" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-2 gap-4">
                  {mockTradeAnalytics.byOptionType.map((data) => (
                    <div key={data.type} className="space-y-1">
                      <p className="font-medium">{data.type} Options</p>
                      <p className="text-sm">Total Profit: <span className="font-semibold">{formatCurrency(data.totalProfit)}</span></p>
                      <p className="text-sm text-muted-foreground">
                        {data.trades} trades
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Expiry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTradeAnalytics.byExpiry.map((expiry) => (
                    <div key={expiry.expiry} className="flex justify-between items-start border-b pb-3">
                      <div>
                        <p className="font-medium capitalize">{expiry.expiry}</p>
                        <p className="text-sm text-muted-foreground">
                          {expiry.trades} trades, {expiry.winRate.toFixed(1)}% win rate
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(expiry.totalProfit)}</p>
                        <p className="text-sm text-muted-foreground">
                          {expiry.averageReturn.toFixed(1)}% avg return
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance by Holding Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTradeAnalytics.byHoldingPeriod.map((period) => (
                    <div key={period.period} className="flex justify-between items-start border-b pb-3">
                      <div>
                        <p className="font-medium">{period.period}</p>
                        <p className="text-sm text-muted-foreground">
                          {period.trades} trades, {period.winRate.toFixed(1)}% win rate
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(period.totalProfit)}</p>
                        <p className="text-sm text-muted-foreground">
                          {period.averageReturn.toFixed(1)}% avg return
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="distribution" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Return Distribution</CardTitle>
              <CardDescription>
                Distribution of trade returns by percentage range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={mockChartData.profitDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} trades`, 'Count']}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill={(data) => {
                      if (data.range.includes('-')) return '#ef4444';
                      if (data.range === '0% to 10%') return '#10b981';
                      return '#10b981';
                    }}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mean Return:</span>
                    <span className="font-medium">{(mockPerformanceMetrics.netProfit / mockPerformanceMetrics.totalTrades / 1000).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Median Return:</span>
                    <span className="font-medium">2.15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard Deviation:</span>
                    <span className="font-medium">{mockPerformanceMetrics.returnsVolatility.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Positive Trade %:</span>
                    <span className="font-medium">{mockPerformanceMetrics.winRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drawdowns" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Major Drawdowns</CardTitle>
              <CardDescription>
                Periods of significant decrease in portfolio value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockChartData.drawdowns.map((drawdown, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Drawdown #{index + 1}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(drawdown.startDate)} to {formatDate(drawdown.endDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-rose-500">-{drawdown.depthPercent.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">
                          {drawdown.duration} days, {drawdown.recoveryDays} days to recover
                        </p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-rose-500 h-2.5 rounded-full"
                        style={{ width: `${Math.min(100, drawdown.depthPercent * 3)}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{drawdown.duration} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Depth</p>
                        <p className="font-medium">-{drawdown.depthPercent.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Recovery</p>
                        <p className="font-medium">{drawdown.recoveryDays} days</p>
                      </div>
                    </div>
                    
                    {index < mockChartData.drawdowns.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
