
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
        <div className="container py-4">
          <SpyHeaderWithNotifications />
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Account Management Card with prominent Sign Up button */}
        <Card className="w-full shadow-sm">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <User className="h-5 w-5 text-primary" />
              <span>Account Management</span>
            </CardTitle>
            <CardDescription>
              Manage your account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Create an account to start trading with AI-powered strategies
            </p>
            <div className="grid grid-cols-1 gap-3 max-w-md w-full">
              <Link to="/auth">
                <Button className="w-full bg-primary" size="lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Account
                </Button>
              </Link>
              <div className="flex items-center gap-2 mt-2">
                <Link to="/auth" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link to="/profile" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Profile</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Today's Trades and Account Balance side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Today's Trades */}
          <Card className="w-full shadow-sm">
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
          
          {/* Account Balance */}
          <Card className="w-full bg-blue-50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <LineChart className="h-5 w-5 text-primary" />
                <span>Account Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-4xl font-bold mb-2">
                ${accountData.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-muted-foreground">Daily:</div>
                  <div className="text-positive text-lg font-semibold flex items-center">
                    ↑ ${accountData.dailyPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-sm ml-1">(+{(accountData.dailyPnL / (accountData.balance - accountData.dailyPnL) * 100).toFixed(2)}%)</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">All Time:</div>
                  <div className="text-positive text-lg font-semibold flex items-center">
                    ↑ ${accountData.allTimePnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-sm ml-1">(+{(accountData.allTimePnL / (accountData.balance - accountData.allTimePnL) * 100).toFixed(2)}%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <SpyOverview />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                <span>Risk Management</span>
              </CardTitle>
              <CardDescription>
                Monitor and manage trading risk
              </CardDescription>
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
              <CardDescription>
                Track your trading performance
              </CardDescription>
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
