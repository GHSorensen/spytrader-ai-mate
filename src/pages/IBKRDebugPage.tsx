
import React from 'react';
import IBKRConnectionDebugger from '@/components/ibkr/IBKRConnectionDebugger';

const IBKRDebugPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">IBKR Connection Diagnostics</h1>
      <p className="mb-6">Use these tools to troubleshoot your connection to Interactive Brokers.</p>
      
      <div className="mt-6">
        <IBKRConnectionDebugger />
      </div>
    </div>
  );
};

export default IBKRDebugPage;
