
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trade, TradeDirection } from '@/lib/types';
import { executeTrade, generateTrade } from '@/lib/tradeLogic';
import { Play, PauseCircle, Settings, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function TradeAutomation() {
  const [isAutoTrading, setIsAutoTrading] = useState(false);
  const [riskLevel, setRiskLevel] = useState(5);
  const [maxPositions, setMaxPositions] = useState(10);
  const [symbol, setSymbol] = useState('SPY');
  const [direction, setDirection] = useState<TradeDirection>('CALL');
  const [isExecuting, setIsExecuting] = useState(false);
  
  const toggleAutoTrading = () => {
    setIsAutoTrading(!isAutoTrading);
    
    if (!isAutoTrading) {
      toast.success('Auto-trading activated', {
        description: 'The system will now execute trades based on your configured strategies',
      });
    } else {
      toast.info('Auto-trading deactivated', {
        description: 'The system has stopped executing automated trades',
      });
    }
  };
  
  const handleManualTrade = async () => {
    setIsExecuting(true);
    
    try {
      const newTrade = generateTrade(symbol, direction);
      await executeTrade(newTrade);
      
      toast.success('Trade executed successfully', {
        description: `${direction} option on ${symbol} at $${newTrade.entryPrice.toFixed(2)}`,
      });
    } catch (error) {
      toast.error('Failed to execute trade', {
        description: 'There was an error processing your request. Please try again.',
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <section id="automation" className="py-8 max-w-[1800px] mx-auto animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-card h-full">
            <CardHeader>
              <CardTitle>Trade Automation</CardTitle>
              <CardDescription>Configure and control automated trading strategies</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="config">
                <TabsList className="mb-6">
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                  <TabsTrigger value="manual">Manual Trading</TabsTrigger>
                  <TabsTrigger value="schedule">Trading Schedule</TabsTrigger>
                </TabsList>
                
                <TabsContent value="config">
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Automated Trading</h3>
                        <p className="text-sm text-muted-foreground">Enable or disable the AI trading system</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={isAutoTrading} 
                          onCheckedChange={toggleAutoTrading} 
                          id="auto-trading"
                        />
                        <Label htmlFor="auto-trading" className={isAutoTrading ? 'text-primary' : 'text-muted-foreground'}>
                          {isAutoTrading ? 'Active' : 'Inactive'}
                        </Label>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Risk Level</h4>
                        <div className="flex items-center space-x-4">
                          <p className="text-sm text-muted-foreground w-10">Low</p>
                          <Slider 
                            value={[riskLevel]} 
                            min={1} 
                            max={10} 
                            step={1} 
                            onValueChange={(value) => setRiskLevel(value[0])} 
                            className="flex-1"
                          />
                          <p className="text-sm text-muted-foreground w-10">High</p>
                          <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-md">
                            {riskLevel}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Maximum Open Positions</h4>
                        <div className="flex items-center space-x-4">
                          <p className="text-sm text-muted-foreground w-10">1</p>
                          <Slider 
                            value={[maxPositions]} 
                            min={1} 
                            max={20} 
                            step={1} 
                            onValueChange={(value) => setMaxPositions(value[0])} 
                            className="flex-1"
                          />
                          <p className="text-sm text-muted-foreground w-10">20</p>
                          <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-md">
                            {maxPositions}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-2">
                          <Label htmlFor="max-loss">Maximum Daily Loss ($)</Label>
                          <Input id="max-loss" type="number" placeholder="1000" />
                          <p className="text-xs text-muted-foreground">System will pause trading if this loss is reached</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="take-profit">Take Profit (%)</Label>
                          <Input id="take-profit" type="number" placeholder="20" />
                          <p className="text-xs text-muted-foreground">Default profit target for trades</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="stop-loss">Stop Loss (%)</Label>
                          <Input id="stop-loss" type="number" placeholder="10" />
                          <p className="text-xs text-muted-foreground">Default stop loss for trades</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confidence">Minimum Confidence (%)</Label>
                          <Input id="confidence" type="number" placeholder="70" />
                          <p className="text-xs text-muted-foreground">Minimum AI confidence score to execute</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="manual">
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <h3 className="text-lg font-medium mb-4">Manual Trade Entry</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="symbol">Symbol</Label>
                          <Select value={symbol} onValueChange={setSymbol}>
                            <SelectTrigger id="symbol">
                              <SelectValue placeholder="Select symbol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SPY">SPY</SelectItem>
                              <SelectItem value="QQQ">QQQ</SelectItem>
                              <SelectItem value="AAPL">AAPL</SelectItem>
                              <SelectItem value="MSFT">MSFT</SelectItem>
                              <SelectItem value="AMZN">AMZN</SelectItem>
                              <SelectItem value="TSLA">TSLA</SelectItem>
                              <SelectItem value="NVDA">NVDA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="direction">Direction</Label>
                          <Select value={direction} onValueChange={(value) => setDirection(value as TradeDirection)}>
                            <SelectTrigger id="direction">
                              <SelectValue placeholder="Select direction" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CALL">CALL</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry</Label>
                          <Select defaultValue="7d">
                            <SelectTrigger id="expiry">
                              <SelectValue placeholder="Select expiry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1d">1 Day</SelectItem>
                              <SelectItem value="7d">7 Days</SelectItem>
                              <SelectItem value="14d">14 Days</SelectItem>
                              <SelectItem value="30d">30 Days</SelectItem>
                              <SelectItem value="60d">60 Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input id="quantity" type="number" placeholder="1" min="1" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="take-profit-manual">Take Profit (%)</Label>
                          <Input id="take-profit-manual" type="number" placeholder="20" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="stop-loss-manual">Stop Loss (%)</Label>
                          <Input id="stop-loss-manual" type="number" placeholder="10" />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button 
                          onClick={handleManualTrade} 
                          disabled={isExecuting}
                          className="relative overflow-hidden group"
                        >
                          {isExecuting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Executing...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Execute Trade
                              <span className="absolute inset-0 h-full w-0 bg-white/20 transition-all duration-300 group-hover:w-full"></span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30">
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-800/30 text-amber-800 dark:text-amber-200 mr-3">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">Manual Trading Notice</h4>
                          <p className="text-xs mt-1 text-amber-800/80 dark:text-amber-200/80">
                            Manual trades bypass AI analysis. Consider using AI-assisted trading for optimal results.
                            These trades will not affect your automated strategy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="schedule">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <h3 className="text-lg font-medium mb-4">Trading Schedule</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Define when the AI should actively trade. The system will only enter positions during these hours.
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                          <div key={day} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={day}>{day}</Label>
                              <Switch id={day} defaultChecked={true} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Select defaultValue="9:30">
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder="Start" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="9:30">9:30 AM</SelectItem>
                                  <SelectItem value="10:00">10:00 AM</SelectItem>
                                  <SelectItem value="11:00">11:00 AM</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select defaultValue="16:00">
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder="End" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15:00">3:00 PM</SelectItem>
                                  <SelectItem value="15:30">3:30 PM</SelectItem>
                                  <SelectItem value="16:00">4:00 PM</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Trading Around Events</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Switch id="earnings" />
                            <Label htmlFor="earnings">Pause trading before earnings announcements</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="fomc" defaultChecked />
                            <Label htmlFor="fomc">Pause trading during FOMC announcements</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="high-volatility" defaultChecked />
                            <Label htmlFor="high-volatility">Reduce position size during high market volatility</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-card h-full">
            <CardHeader>
              <CardTitle>Trading Status</CardTitle>
              <CardDescription>Current automation settings and status</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">System Status</h3>
                    <div className={`px-3 py-1 rounded-full text-xs ${isAutoTrading ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {isAutoTrading ? 'Running' : 'Paused'}
                    </div>
                  </div>
                  
                  <div className="bg-muted/40 p-4 rounded-lg border border-border/60">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isAutoTrading ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {isAutoTrading ? <Play size={24} /> : <PauseCircle size={24} />}
                      </div>
                      <div>
                        <h4 className="font-medium">{isAutoTrading ? 'AI Trading Active' : 'AI Trading Paused'}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isAutoTrading 
                            ? 'System is actively monitoring and executing trades' 
                            : 'System is monitoring but not executing trades'}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={toggleAutoTrading}
                    >
                      {isAutoTrading ? 'Pause Trading' : 'Activate Trading'}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Active Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                      <p className="text-xs text-muted-foreground">Risk Level</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-md flex items-center justify-center text-sm font-medium">
                          {riskLevel}
                        </div>
                        <p className="text-sm font-medium">{riskLevel <= 3 ? 'Low' : riskLevel <= 7 ? 'Medium' : 'High'}</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                      <p className="text-xs text-muted-foreground">Max Positions</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-md flex items-center justify-center text-sm font-medium">
                          {maxPositions}
                        </div>
                        <p className="text-sm font-medium">Trades</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                      <p className="text-xs text-muted-foreground">Current Positions</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-md flex items-center justify-center text-sm font-medium">
                          3
                        </div>
                        <p className="text-sm font-medium">Open</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                      <p className="text-xs text-muted-foreground">Available Cash</p>
                      <p className="text-sm font-medium mt-1">$24,568.32</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Active Strategies</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/60">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-md flex items-center justify-center mr-3">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="m2 12 5-3-5-3v6Z"></path>
                            <path d="M7 9v6"></path>
                            <path d="M11 6v12h4"></path>
                            <path d="m15 9 6 6"></path>
                            <path d="M15 15h6"></path>
                          </svg>
                        </div>
                        <p className="text-sm font-medium">Momentum Breakout</p>
                      </div>
                      <ArrowRight size={16} className="text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/60">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-md flex items-center justify-center mr-3">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                          </svg>
                        </div>
                        <p className="text-sm font-medium">Trend Following</p>
                      </div>
                      <ArrowRight size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button variant="outline" className="w-full" size="sm">
                <Settings size={16} className="mr-2" />
                Advanced Settings
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default TradeAutomation;
