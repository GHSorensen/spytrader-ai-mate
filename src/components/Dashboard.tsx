
import React from 'react';
import { SpyOverview } from './spy/SpyOverview';
import { AccountBalance } from './spy/AccountBalance';
import { TodaysTrades } from './spy/TodaysTrades';
import { ActiveTrades } from './spy/ActiveTrades';
import { TradeJournal } from './spy/TradeJournal';

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full">
          <SpyOverview />
        </div>
        
        <div>
          <AccountBalance 
            balance={125000} 
            dailyPnL={1200} 
            allTimePnL={15000}
          />
        </div>
        
        <div>
          <TodaysTrades />
        </div>
        
        <div>
          <ActiveTrades />
        </div>
        
        <div className="md:col-span-2">
          <TradeJournal />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
