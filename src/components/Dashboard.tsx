
import React from 'react';
import { SpyOverview } from './spy/SpyOverview';
import { AccountBalance } from './spy/AccountBalance';
import { TodaysTrades } from './spy/TodaysTrades';
import { ActiveTrades } from './spy/ActiveTrades';
import { TradeJournal } from './spy/TradeJournal';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowDownSquare, BarChart2, LineChart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAccountBalance } from '@/hooks/useAccountBalance';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { balance, dailyPnL, allTimePnL, isLoading, lastUpdated, error } = useAccountBalance();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <SpyOverview />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AccountBalance 
            balance={balance} 
            dailyPnL={dailyPnL} 
            allTimePnL={allTimePnL}
            isLoading={isLoading}
            lastUpdated={lastUpdated ? format(lastUpdated, 'h:mm:ss a') : undefined}
            error={error}
          />
        </div>
        
        <div className="lg:col-span-2">
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Today's Trades</CardTitle>
                <Link to="/trades" className="text-sm text-primary flex items-center">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <TodaysTrades />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <ArrowDownSquare className="h-5 w-5 text-primary" />
                Active Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActiveTrades />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Trade Journal</CardTitle>
            </CardHeader>
            <CardContent>
              <TradeJournal />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              <span>Risk Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get real-time risk insights and automate risk management.
            </p>
            <Link to="/risk-console">
              <Button variant="outline" className="w-full">Risk Console</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart2 className="h-5 w-5 text-primary" />
              <span>Performance Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View detailed metrics, equity curves, and statistics.
            </p>
            <Link to="/detailed-performance">
              <Button variant="outline" className="w-full">Analytics Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
