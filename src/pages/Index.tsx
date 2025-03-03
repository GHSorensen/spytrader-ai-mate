
import React from 'react';
import { SpyHeader } from '@/components/spy/SpyHeader';
import { SpyOverview } from '@/components/spy/SpyOverview';
import { OptionChain } from '@/components/spy/OptionChain';
import { ActiveTrades } from '@/components/spy/ActiveTrades';
import { Button } from '@/components/ui/button';
import { ChevronDown, RefreshCw, Settings, Sliders } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <SpyHeader />
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="icon" className="md:hidden">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">SPY Options Dashboard</h2>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  Risk Tolerance
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Conservative</DropdownMenuItem>
                <DropdownMenuItem>Moderate</DropdownMenuItem>
                <DropdownMenuItem>Aggressive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="gap-1">
              <Sliders className="h-4 w-4 mr-1" />
              AI Settings
            </Button>
          </div>
        </div>
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpyOverview />
          <ActiveTrades />
          <OptionChain />
        </div>
      </main>
    </div>
  );
};

export default Index;
