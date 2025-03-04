
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InteractiveBrokersService } from '@/services/dataProviders/interactiveBrokersService';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { toast } from 'sonner';

const IBKRConnectionDebugger: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [hostInput, setHostInput] = useState('localhost');
  const [portInput, setPortInput] = useState('7496');
  const [isPaperTrading, setIsPaperTrading] = useState(true);

  const runConnectionTest = async () => {
    setIsLoading(true);
    setConnectionStatus('idle');
    setDiagnosticResults(null);

    try {
      const config: DataProviderConfig = {
        type: 'interactive-brokers',
        connectionMethod: 'tws',
        twsHost: hostInput,
        twsPort: portInput,
        paperTrading: isPaperTrading
      };

      const service = new InteractiveBrokersService(config);
      const connected = await service.connect();
      
      // Get diagnostics
      const diagnostics = service.getDiagnostics();
      setDiagnosticResults(diagnostics);

      if (connected) {
        setConnectionStatus('success');
        toast.success('Connection test successful');
      } else {
        setConnectionStatus('error');
        toast.error('Connection test failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setDiagnosticResults({ error: error instanceof Error ? error.message : String(error) });
      toast.error('Connection test error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = () => {
    runConnectionTest();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Connection Tester
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Host</label>
            <input
              type="text"
              value={hostInput}
              onChange={(e) => setHostInput(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="localhost"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Port</label>
            <input
              type="text"
              value={portInput}
              onChange={(e) => setPortInput(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="7496 for live, 7497 for paper"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPaperTrading}
              onChange={(e) => setIsPaperTrading(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Paper Trading</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Use port 7497 for paper trading and 7496 for live trading
          </p>
        </div>
        
        <Button 
          onClick={handleTestConnection}
          disabled={isLoading} 
          className="w-full mb-6"
        >
          {isLoading ? 'Testing Connection...' : 'Test Connection'}
        </Button>
        
        {connectionStatus === 'success' && (
          <Alert className="bg-green-50 border-green-200 mb-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Connection Successful</AlertTitle>
            <AlertDescription className="text-green-600">
              Successfully connected to Interactive Brokers at {hostInput}:{portInput}
            </AlertDescription>
          </Alert>
        )}
        
        {connectionStatus === 'error' && (
          <Alert className="bg-red-50 border-red-200 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-600">Connection Failed</AlertTitle>
            <AlertDescription className="text-red-600">
              {diagnosticResults?.error || 'Could not connect to Interactive Brokers. Check your settings and try again.'}
            </AlertDescription>
          </Alert>
        )}
        
        {diagnosticResults && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Diagnostic Results:</h3>
            <div className="bg-gray-50 p-3 rounded-md border overflow-auto max-h-[300px]">
              <pre className="text-xs">{JSON.stringify(diagnosticResults, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IBKRConnectionDebugger;
