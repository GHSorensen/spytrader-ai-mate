
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
import { Shield, BarChart2, User, LineChart, UserPlus, ArrowRight } from 'lucide-react';

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
        <div className="container py-2 md:py-4 px-4">
          <SpyHeaderWithNotifications />
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Account Management Card with prominent Sign Up button */}
        <Card className="w-full shadow-sm">
          <CardHeader className="pb-2 md:pb-3 p-4 md:p-6 text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-lg md:text-xl">
              <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span>Account Management</span>
            </CardTitle>
            <CardDescription className="text-center text-xs md:text-sm">
              Manage your account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center p-4 md:p-6">
            <p className="text-xs md:text-sm text-muted-foreground mb-4 text-center max-w-md">
              Create an account to start trading with AI-powered strategies
            </p>
            <div className="grid grid-cols-1 gap-2 md:gap-3 max-w-md w-full">
              <Link to="/auth">
                <Button className="w-full bg-primary text-sm md:text-base" size="default">
                  <UserPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Create Account
                </Button>
              </Link>
              <div className="flex items-center gap-2 mt-2">
                <Link to="/auth" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">Sign In</Button>
                </Link>
                <Link to="/profile" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">Profile</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Today's Trades and Account Balance side by side for desktop, reversed order on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Balance - appears first on mobile, second on desktop */}
          <div className="md:order-2 order-1">
            <AccountBalance 
              balance={accountData.balance} 
              dailyPnL={accountData.dailyPnL} 
              allTimePnL={accountData.allTimePnL} 
            />
          </div>
          
          {/* Today's Trades - appears second on mobile, first on desktop */}
          <div className="md:order-1 order-2">
            <Card className="w-full shadow-sm">
              <CardHeader className="pb-2 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg md:text-xl">Today's Trades</CardTitle>
                  <Link to="/trades" className="text-xs md:text-sm text-primary flex items-center">
                    View All <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <TodaysTrades showHeader={false} />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <SpyOverview />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 md:my-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2 p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span>Risk Management</span>
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Monitor and manage trading risk
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Get real-time risk insights and automate risk management.
              </p>
              <Link to="/risk-console">
                <Button variant="outline" className="w-full text-xs md:text-sm">Risk Console</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2 p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BarChart2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span>Performance Analytics</span>
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Track your trading performance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                View detailed metrics, equity curves, and statistics.
              </p>
              <Link to="/detailed-performance">
                <Button variant="outline" className="w-full text-xs md:text-sm">Analytics Dashboard</Button>
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
      
      <footer className="border-t py-4 px-6 text-center text-xs md:text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} SPY Options AI</p>
      </footer>
    </div>
  );
};

export default Index;
