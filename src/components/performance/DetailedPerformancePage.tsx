
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SpyHeaderWithNotifications } from '@/components/spy/SpyHeaderWithNotifications';
import { BarChart, LineChart, ResponsiveContainer, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, Calendar } from 'lucide-react';

// Mock data for charts
const equityCurveData = [
  { date: 'Jan', value: 10000, benchmark: 10000 },
  { date: 'Feb', value: 10300, benchmark: 10100 },
  { date: 'Mar', value: 10500, benchmark: 10150 },
  { date: 'Apr', value: 10800, benchmark: 10200 },
  { date: 'May', value: 11200, benchmark: 10400 },
  { date: 'Jun', value: 11000, benchmark: 10300 },
  { date: 'Jul', value: 11500, benchmark: 10500 },
  { date: 'Aug', value: 11800, benchmark: 10600 },
  { date: 'Sep', value: 12000, benchmark: 10550 },
  { date: 'Oct', value: 12600, benchmark: 10700 },
  { date: 'Nov', value: 12200, benchmark: 10800 },
  { date: 'Dec', value: 12800, benchmark: 10900 },
];

const monthlyReturnsData = [
  { month: 'Jan', return: 3 },
  { month: 'Feb', return: 2 },
  { month: 'Mar', return: 1.9 },
  { month: 'Apr', return: 2.8 },
  { month: 'May', return: 3.7 },
  { month: 'Jun', return: -1.7 },
  { month: 'Jul', return: 4.5 },
  { month: 'Aug', return: 2.6 },
  { month: 'Sep', return: 1.7 },
  { month: 'Oct', return: 5 },
  { month: 'Nov', return: -3.2 },
  { month: 'Dec', return: 4.9 },
];

const drawdownsData = [
  { date: 'Jan', drawdown: 0 },
  { date: 'Feb', drawdown: -1.2 },
  { date: 'Mar', drawdown: -0.5 },
  { date: 'Apr', drawdown: 0 },
  { date: 'May', drawdown: 0 },
  { date: 'Jun', drawdown: -3.8 },
  { date: 'Jul', drawdown: -1.2 },
  { date: 'Aug', drawdown: 0 },
  { date: 'Sep', drawdown: -0.8 },
  { date: 'Oct', drawdown: 0 },
  { date: 'Nov', drawdown: -5.2 },
  { date: 'Dec', drawdown: -2.1 },
];

const strategyPerformanceData = [
  { name: 'Bull Strategy', win: 68, loss: 32 },
  { name: 'Bear Strategy', win: 52, loss: 48 },
  { name: 'Volatility Strategy', win: 75, loss: 25 },
  { name: 'Theta Decay', win: 81, loss: 19 },
  { name: 'Momentum', win: 61, loss: 39 },
];

const DetailedPerformancePage: React.FC = () => {
  const [timeframe, setTimeframe] = useState('1y');

  const performanceMetrics = {
    totalTrades: 156,
    winRate: 72.4,
    profitFactor: 3.2,
    averageWin: 342,
    averageLoss: -156,
    netProfit: 28000,
    maxDrawdown: 5.2,
    sharpeRatio: 2.3
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container py-4">
          <SpyHeaderWithNotifications />
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Performance Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive analysis of your trading performance
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Date Range</span>
            </Button>
            
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1w">1 Week</SelectItem>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
        
        {/* Performance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${performanceMetrics.netProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+28% from initial capital</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.winRate}%</div>
              <p className="text-xs text-muted-foreground">{performanceMetrics.totalTrades} total trades</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.profitFactor}</div>
              <p className="text-xs text-muted-foreground">Ratio of gross profit to gross loss</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.maxDrawdown}%</div>
              <p className="text-xs text-muted-foreground">Largest peak-to-trough decline</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="drawdowns">Drawdowns</TabsTrigger>
            <TabsTrigger value="strategy">Strategy Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Equity Curve</CardTitle>
                  <CardDescription>
                    Portfolio value over time compared to benchmark
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={equityCurveData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" name="Portfolio" />
                        <Line type="monotone" dataKey="benchmark" stroke="#82ca9d" name="SPY Benchmark" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Returns</CardTitle>
                  <CardDescription>
                    Performance breakdown by month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyReturnsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis unit="%" />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Return']}
                        />
                        <Bar dataKey="return" name="Monthly Return" fill="#8884d8">
                          {monthlyReturnsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#4ade80' : '#f43f5e'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceMetrics.sharpeRatio}</div>
                  <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Win</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${performanceMetrics.averageWin}</div>
                  <p className="text-xs text-muted-foreground">Average winning trade</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Loss</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${performanceMetrics.averageLoss}</div>
                  <p className="text-xs text-muted-foreground">Average losing trade</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceMetrics.totalTrades}</div>
                  <p className="text-xs text-muted-foreground">Completed trades</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="returns">
            <Card>
              <CardHeader>
                <CardTitle>Returns Analysis</CardTitle>
                <CardDescription>Detailed breakdown of trading returns</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Returns analysis content will go here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="drawdowns">
            <Card>
              <CardHeader>
                <CardTitle>Drawdown Analysis</CardTitle>
                <CardDescription>Portfolio drawdowns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={drawdownsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis unit="%" />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Drawdown']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="drawdown" 
                        stroke="#ef4444" 
                        name="Drawdown" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">Major Drawdowns</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Start Date</th>
                          <th className="text-left py-2">End Date</th>
                          <th className="text-left py-2">Depth (%)</th>
                          <th className="text-left py-2">Duration (Days)</th>
                          <th className="text-left py-2">Recovery (Days)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Nov 15, 2023</td>
                          <td className="py-2">Nov 28, 2023</td>
                          <td className="py-2">-5.2%</td>
                          <td className="py-2">13</td>
                          <td className="py-2">18</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Jun 5, 2023</td>
                          <td className="py-2">Jun 12, 2023</td>
                          <td className="py-2">-3.8%</td>
                          <td className="py-2">7</td>
                          <td className="py-2">12</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Feb 10, 2023</td>
                          <td className="py-2">Feb 14, 2023</td>
                          <td className="py-2">-1.2%</td>
                          <td className="py-2">4</td>
                          <td className="py-2">6</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="strategy">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance</CardTitle>
                <CardDescription>Performance metrics by trading strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={strategyPerformanceData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                      <Legend />
                      <Bar dataKey="win" stackId="a" fill="#4ade80" name="Win Rate %" />
                      <Bar dataKey="loss" stackId="a" fill="#f43f5e" name="Loss Rate %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">Strategy Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Strategy</th>
                          <th className="text-left py-2">Trades</th>
                          <th className="text-left py-2">Win Rate</th>
                          <th className="text-left py-2">Profit Factor</th>
                          <th className="text-left py-2">Avg Return</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Bull Strategy</td>
                          <td className="py-2">42</td>
                          <td className="py-2">68%</td>
                          <td className="py-2">3.1</td>
                          <td className="py-2">+2.4%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Bear Strategy</td>
                          <td className="py-2">25</td>
                          <td className="py-2">52%</td>
                          <td className="py-2">1.8</td>
                          <td className="py-2">+1.1%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Volatility Strategy</td>
                          <td className="py-2">36</td>
                          <td className="py-2">75%</td>
                          <td className="py-2">4.2</td>
                          <td className="py-2">+3.6%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Theta Decay</td>
                          <td className="py-2">32</td>
                          <td className="py-2">81%</td>
                          <td className="py-2">5.1</td>
                          <td className="py-2">+1.8%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Momentum</td>
                          <td className="py-2">21</td>
                          <td className="py-2">61%</td>
                          <td className="py-2">2.7</td>
                          <td className="py-2">+2.1%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DetailedPerformancePage;
