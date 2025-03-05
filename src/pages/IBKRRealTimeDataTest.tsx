
import React from 'react';
import { IBKRRealTimeDataTestView } from '@/components/ibkr/test/IBKRRealTimeDataTestView';

const IBKRRealTimeDataTest: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">IBKR Real-Time Data Test Environment</h1>
      <p className="mb-6 text-slate-600">
        This page is used to test the integration with Interactive Brokers' real-time data services.
        It provides a visual representation of how the data flows through the application and allows
        for manual testing of various features.
      </p>
      
      <IBKRRealTimeDataTestView />
      
      <div className="mt-8 p-4 bg-slate-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Test Documentation</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Refresh Data</strong>: Manually triggers a refresh of market data and options
          </li>
          <li>
            <strong>Check Connection</strong>: Tests the connection to IBKR services
          </li>
          <li>
            <strong>Reconnect</strong>: Attempts to reestablish a connection if it was lost
          </li>
          <li>
            <strong>Market Data Tab</strong>: Shows current SPY market data
          </li>
          <li>
            <strong>Options Chain Tab</strong>: Displays available SPY options
          </li>
          <li>
            <strong>Diagnostics Tab</strong>: Shows connection information for debugging
          </li>
        </ul>
      </div>
    </div>
  );
};

export default IBKRRealTimeDataTest;
