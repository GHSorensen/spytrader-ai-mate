
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMarketData, getRecentTrades } from '@/lib/tradeLogic';
import { MarketData, Trade } from '@/lib/types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  BarChart3, 
  AlertCircle 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { time: '9:30', value: 432.21 },
  { time: '10:00', value: 432.89 },
  { time: '10:30', value: 431.54 },
  { time: '11:00', value: 430.80 },
  { time: '11:30', value: 432.35 },
  { time: '12:00', value: 433.73 },
  { time: '12:30', value: 434.21 },
  { time: '13:00', value: 434.68 },
  { time: '13:30', value: 435.12 },
  { time: '14:00', value: 436.25 },
  { time: '14:30', value: 437.84 },
  { time: '15:00', value: 437.12 },
  { time: '15:30', value: 438.45 },
  { time: '16:00', value: 439.73 }
];

export function Dashboard() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setMarketData(getMarketData());
      setRecentTrades(getRecentTrades());
      setIsLoading(false);
    };
    
    fetchData();
  }, []);
  
  const getStatusColor = (status: Trade['status']): string => {
    switch (status) {
      case 'executed': return 'bg-emerald-500/10 text-emerald-600';
      case 'pending': return 'bg-blue-500/10 text-blue-600';
      case 'closed': return 'bg-neutral/10 text-neutral';
      case 'cancelled': return 'bg-red-500/10 text-red-600';
      default: return 'bg-neutral/10 text-neutral';
    }
  };
  
  return (
    <section id="dashboard" className="py-8 max-w-[1800px] mx-auto animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Overview */}
        <Card className="col-span-1 lg:col-span-3 shadow-card animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle>Market Overview</CardTitle>
            <CardDescription>Real-time market data and trends</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-chart-bg rounded-lg">
                  <div className="animate-pulse-slow">Loading chart data...</div>
                </div>
              ) : (
                <Tabs defaultValue="spy">
                  <TabsList className="mb-4">
                    <TabsTrigger value="spy">SPY</TabsTrigger>
                    <TabsTrigger value="qqq">QQQ</TabsTrigger>
                    <TabsTrigger value="iwm">IWM</TabsTrigger>
                    <TabsTrigger value="dia">DIA</TabsTrigger>
                  </TabsList>
                  <TabsContent value="spy" className="mt-0">
                    <div className="bg-chart-bg p-4 rounded-lg h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="time" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          />
                          <YAxis 
                            domain={['dataMin - 1', 'dataMax + 1']} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            width={50}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))', 
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  <TabsContent value="qqq" className="mt-0">
                    <div className="bg-chart-bg p-4 rounded-lg h-[250px] flex items-center justify-center">
                      <p className="text-muted-foreground">QQQ chart data coming soon</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="iwm" className="mt-0">
                    <div className="bg-chart-bg p-4 rounded-lg h-[250px] flex items-center justify-center">
                      <p className="text-muted-foreground">IWM chart data coming soon</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="dia" className="mt-0">
                    <div className="bg-chart-bg p-4 rounded-lg h-[250px] flex items-center justify-center">
                      <p className="text-muted-foreground">DIA chart data coming soon</p>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
            
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="bg-card/50 shadow-none border border-border/60">
                <CardContent className="p-4 flex items-center">
                  <div className="p-2 rounded-full bg-emerald-500/10 mr-4">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">SPY</p>
                    <h3 className="text-xl font-semibold mt-1">$432.65</h3>
                    <p className="text-xs text-emerald-500 mt-1">+3.21 (0.74%)</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 shadow-none border border-border/60">
                <CardContent className="p-4 flex items-center">
                  <div className="p-2 rounded-full bg-emerald-500/10 mr-4">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">QQQ</p>
                    <h3 className="text-xl font-semibold mt-1">$378.12</h3>
                    <p className="text-xs text-emerald-500 mt-1">+5.45 (1.46%)</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 shadow-none border border-border/60">
                <CardContent className="p-4 flex items-center">
                  <div className="p-2 rounded-full bg-red-500/10 mr-4">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">IWM</p>
                    <h3 className="text-xl font-semibold mt-1">$195.83</h3>
                    <p className="text-xs text-red-500 mt-1">-1.25 (0.63%)</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 shadow-none border border-border/60">
                <CardContent className="p-4 flex items-center">
                  <div className="p-2 rounded-full bg-emerald-500/10 mr-4">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">DIA</p>
                    <h3 className="text-xl font-semibold mt-1">$384.56</h3>
                    <p className="text-xs text-emerald-500 mt-1">+2.74 (0.72%)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        {/* Market Movers */}
        <Card className="col-span-1 shadow-card animate-fade-in animate-delay-200">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Market Movers</CardTitle>
              <BarChart3 className="text-muted-foreground h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-muted rounded-md animate-pulse"></div>
                      <div className="ml-3">
                        <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-5 w-20 bg-muted rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {marketData.slice(0, 5).map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${stock.change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground">${stock.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${stock.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Trades */}
      <div className="mt-6">
        <Card className="shadow-card animate-fade-in animate-delay-300">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Recent Trades</CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </div>
            <CardDescription>Latest activity from your automated trading strategies</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="font-medium p-3">Symbol</th>
                      <th className="font-medium p-3">Type</th>
                      <th className="font-medium p-3">Entry Price</th>
                      <th className="font-medium p-3">Target</th>
                      <th className="font-medium p-3">Stop Loss</th>
                      <th className="font-medium p-3">Status</th>
                      <th className="font-medium p-3">Profit/Loss</th>
                      <th className="font-medium p-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(3)].map((_, i) => (
                      <tr key={i} className="text-sm">
                        <td className="p-3"><div className="h-5 w-12 bg-muted rounded animate-pulse"></div></td>
                        <td className="p-3"><div className="h-5 w-14 bg-muted rounded animate-pulse"></div></td>
                        <td className="p-3"><div className="h-5 w-16 bg-muted rounded animate-pulse"></div></td>
                        <td className="p-3"><div className="h-5 w-16 bg-muted rounded animate-pulse"></div></td>
                        <td className="p-3"><div className="h-5 w-16 bg-muted rounded animate-pulse"></div></td>
                        <td className="p-3"><div className="h-5 w-20 bg-muted rounded animate-pulse"></div></td>
                        <td className="p-3"><div className="h-5 w-16 bg-muted rounded animate-pulse"></div></td>
                        <td className="p-3"><div className="h-5 w-20 bg-muted rounded animate-pulse"></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border/30">
                      <th className="font-medium p-3">Symbol</th>
                      <th className="font-medium p-3">Type</th>
                      <th className="font-medium p-3">Entry Price</th>
                      <th className="font-medium p-3">Target</th>
                      <th className="font-medium p-3">Stop Loss</th>
                      <th className="font-medium p-3">Status</th>
                      <th className="font-medium p-3">Profit/Loss</th>
                      <th className="font-medium p-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrades.map((trade) => (
                      <tr key={trade.id} className="text-sm border-b border-border/20 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{trade.symbol}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${trade.direction === 'CALL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {trade.direction}
                          </span>
                        </td>
                        <td className="p-3">${trade.entryPrice.toFixed(2)}</td>
                        <td className="p-3 text-emerald-500">${trade.targetPrice.toFixed(2)}</td>
                        <td className="p-3 text-red-500">${trade.stopLoss.toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(trade.status)}`}>
                            {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-3">
                          {trade.profit !== undefined ? (
                            <span className={trade.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                              {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="w-24 bg-muted rounded-full h-1.5 mr-2">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  trade.confidence >= 0.7 ? 'bg-emerald-500' :
                                  trade.confidence >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${trade.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs">{(trade.confidence * 100).toFixed()}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Alerts Section */}
      <div className="mt-6">
        <Card className="shadow-card animate-fade-in animate-delay-400">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Market Alerts</CardTitle>
              <AlertCircle className="text-muted-foreground h-4 w-4" />
            </div>
            <CardDescription>Important events and potential trading opportunities</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">SPY options showing increased volatility</p>
                  <p className="text-xs mt-1">Implied volatility has increased by 15% in the last hour. Potential trading opportunity detected.</p>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 flex items-start">
                <TrendingUp className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">AAPL breaking out of consolidation pattern</p>
                  <p className="text-xs mt-1">Price has crossed above the 20-day moving average with increasing volume. Strategy detected possible entry point.</p>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200 flex items-start">
                <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Fed interest rate decision - Mark your calendar</p>
                  <p className="text-xs mt-1">The next Federal Reserve announcement is scheduled for 2:00 PM ET next Wednesday. Plan your trades accordingly.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default Dashboard;
