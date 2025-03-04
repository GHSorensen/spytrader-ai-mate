
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
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Dashboard</h1>
      
      <SpyOverview />
      
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
            <CardHeader className="pb-2 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg md:text-xl">Today's Trades</CardTitle>
                <Link to="/trades" className="text-xs md:text-sm text-primary flex items-center">
                  View All <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <TodaysTrades />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2 p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <ArrowDownSquare className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                Active Trades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <ActiveTrades />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2 p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Trade Journal</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <TradeJournal />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 md:my-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span>Risk Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <p className="text-xs md:text-sm text-muted-foreground mb-4">
              Get real-time risk insights and automate risk management.
            </p>
            <Link to="/risk-console">
              <Button variant="outline" className="w-full text-sm md:text-base">Risk Console</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <BarChart2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span>Performance Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <p className="text-xs md:text-sm text-muted-foreground mb-4">
              View detailed metrics, equity curves, and statistics.
            </p>
            <Link to="/detailed-performance">
              <Button variant="outline" className="w-full text-sm md:text-base">Analytics Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
