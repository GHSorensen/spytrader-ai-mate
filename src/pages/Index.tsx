
import React from 'react';
import { Link } from 'react-router-dom';
import { SpyHeaderWithNotifications } from '@/components/spy/SpyHeaderWithNotifications';
import { SpyOverview } from '@/components/spy/SpyOverview';
import { OptionChain } from '@/components/spy/OptionChain';
import { TradeJournal } from '@/components/spy/TradeJournal';
import { AccountBalance } from '@/components/spy/AccountBalance';
import { TodaysTrades } from '@/components/spy/TodaysTrades';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, BarChart2, Settings, User, History, LineChart } from 'lucide-react';

export const Index = () => {
  // Mock data for account balance - in a real app, this would come from a data source
  const accountData = {
    balance: 124750.25,
    dailyPnL: 1250.75,
    allTimePnL: 24750.25,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container py-4">
          <SpyHeaderWithNotifications />
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Account Management Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span>Account Management</span>
              </CardTitle>
              <CardDescription>
                Manage your account and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Update your profile, security settings, and notification preferences.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/auth">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full">Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Account Balance */}
        <div className="my-6">
          <AccountBalance 
            balance={accountData.balance} 
            dailyPnL={accountData.dailyPnL} 
            allTimePnL={accountData.allTimePnL} 
          />
        </div>
        
        <SpyOverview />
        
        {/* Today's Trades - shown on all screen sizes but optimized for mobile */}
        <div className="my-6">
          <TodaysTrades />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Risk Management</span>
              </CardTitle>
              <CardDescription>
                Monitor and manage your trading risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get real-time risk insights and automate risk management for your portfolio.
              </p>
              <Link to="/risk-console">
                <Button variant="outline" className="w-full">Risk Console</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
                <span>Performance Analytics</span>
              </CardTitle>
              <CardDescription>
                Track your trading performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View detailed performance metrics, equity curves, and trade statistics.
              </p>
              <Link to="/detailed-performance">
                <Button variant="outline" className="w-full">Analytics Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Option Chain - hidden on mobile, shown on larger screens */}
          <div className="hidden md:block">
            <OptionChain />
          </div>
          
          {/* Full Trade Journal - hidden on mobile (replaced by Today's Trades), shown on larger screens */}
          <div className="hidden md:block">
            <TradeJournal />
          </div>
        </div>
      </main>
      
      <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} SPY Options AI</p>
      </footer>
    </div>
  );
};

export default Index;
