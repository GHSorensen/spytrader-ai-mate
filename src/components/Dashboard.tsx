
import React from 'react';
import { SpyOverview } from './spy/SpyOverview';
import { AccountBalance } from './spy/AccountBalance';
import { TodaysTrades } from './spy/TodaysTrades';
import { ActiveTrades } from './spy/ActiveTrades';
import { TradeJournal } from './spy/TradeJournal';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowDownSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  // Using the account balance of $1600 as you mentioned you're changing it to
  const accountData = {
    balance: 1600, 
    dailyPnL: 0,
    allTimePnL: 0,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <SpyOverview />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AccountBalance 
            balance={accountData.balance} 
            dailyPnL={accountData.dailyPnL} 
            allTimePnL={accountData.allTimePnL}
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
    </div>
  );
};

export default Dashboard;
