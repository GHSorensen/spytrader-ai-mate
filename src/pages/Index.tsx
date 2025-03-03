
import React from 'react';
import { SpyHeader } from '@/components/spy/SpyHeader';
import { SpyOverview } from '@/components/spy/SpyOverview';
import { OptionChain } from '@/components/spy/OptionChain';
import { TradeJournal } from '@/components/spy/TradeJournal';

export const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SpyHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <SpyOverview />
        
        <div className="grid grid-cols-1 gap-6">
          <OptionChain />
          <TradeJournal />
        </div>
      </main>
      
      <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} SPY Options AI</p>
      </footer>
    </div>
  );
};

export default Index;
