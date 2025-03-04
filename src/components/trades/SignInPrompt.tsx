
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogIn, RefreshCw } from "lucide-react";
import { Link } from 'react-router-dom';
import { useAccountBalance } from '@/hooks/useAccountBalance';

interface SignInPromptProps {
  onRefreshBalance: () => void;
}

const SignInPrompt: React.FC<SignInPromptProps> = ({ onRefreshBalance }) => {
  const accountData = useAccountBalance();

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Trades</h1>
          <p className="text-sm text-muted-foreground">
            Manage your trading activity and orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 md:px-3 py-1 rounded-md bg-muted text-xs md:text-sm flex items-center">
            <span>Balance: ${accountData.balance?.toLocaleString() || "0"}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 md:h-6 md:w-6 ml-1"
              onClick={onRefreshBalance}
              disabled={accountData.isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${accountData.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-muted rounded-lg gap-3 md:gap-4">
        <h2 className="text-lg md:text-xl font-medium">Sign In Required</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          You need to sign in to access your trades and create test trades.
        </p>
        <Link to="/auth">
          <Button className="mt-2 md:mt-4 text-sm md:text-base">
            <LogIn className="mr-2 h-3 w-3 md:h-4 md:w-4" />
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SignInPrompt;
