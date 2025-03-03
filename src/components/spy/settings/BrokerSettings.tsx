
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrokerType, BrokerSettings } from '@/lib/types/spy/broker';
import { Link, Server, Key, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface BrokerSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSettings?: BrokerSettings;
  onSave: (settings: BrokerSettings) => void;
}

const defaultSettings: BrokerSettings = {
  type: 'none',
  isConnected: false,
  credentials: {},
  paperTrading: true
};

export const BrokerSettings: React.FC<BrokerSettingsProps> = ({
  open,
  onOpenChange,
  currentSettings,
  onSave
}) => {
  const [settings, setSettings] = useState<BrokerSettings>(currentSettings || defaultSettings);
  const [apiKey, setApiKey] = useState(settings.credentials.apiKey || '');
  const [secretKey, setSecretKey] = useState(settings.credentials.secretKey || '');
  const [accountId, setAccountId] = useState(settings.credentials.accountId || '');
  const [testing, setTesting] = useState(false);

  const handleBrokerChange = (type: BrokerType) => {
    setSettings({
      ...settings,
      type,
      isConnected: false,
      credentials: {}
    });
    setApiKey('');
    setSecretKey('');
    setAccountId('');
  };

  const handlePaperTradingChange = (enabled: boolean) => {
    setSettings({
      ...settings,
      paperTrading: enabled
    });
  };

  const handleTest = async () => {
    setTesting(true);
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = apiKey.length > 0; // For demo, just check if API key is not empty
    
    if (success) {
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${getBrokerName(settings.type)}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Connection Failed",
        description: "Please check your API credentials and try again",
        variant: "destructive",
      });
    }
    
    setTesting(false);
  };

  const handleSave = () => {
    const updatedSettings: BrokerSettings = {
      ...settings,
      credentials: {
        apiKey,
        secretKey,
        accountId
      },
      isConnected: apiKey.length > 0, // For demo purposes
      lastConnected: new Date()
    };
    
    onSave(updatedSettings);
    toast({
      title: "Broker Settings Saved",
      description: `Your ${getBrokerName(settings.type)} settings have been updated`,
    });
    onOpenChange(false);
  };

  const getBrokerName = (type: BrokerType): string => {
    switch (type) {
      case 'interactive-brokers':
        return 'Interactive Brokers';
      case 'td-ameritrade':
        return 'TD Ameritrade';
      default:
        return 'No Broker';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Broker Connection Settings
          </DialogTitle>
          <DialogDescription>
            Configure your connection to trading platforms for executing real or paper trades.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          defaultValue={settings.type !== 'none' ? settings.type : 'interactive-brokers'} 
          onValueChange={(value) => handleBrokerChange(value as BrokerType)}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="interactive-brokers">Interactive Brokers</TabsTrigger>
            <TabsTrigger value="td-ameritrade">TD Ameritrade</TabsTrigger>
          </TabsList>
          
          <TabsContent value="interactive-brokers" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Interactive Brokers Connection</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to the IBKR API for automated trading
                  </p>
                </div>
                {settings.type === 'interactive-brokers' && settings.isConnected ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <XCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Not Connected</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="ibkr-api-key" className="flex items-center gap-1">
                    <Key className="h-3.5 w-3.5" /> API Key
                  </Label>
                  <Input 
                    id="ibkr-api-key" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your IBKR API key" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="ibkr-secret-key" className="flex items-center gap-1">
                    <Key className="h-3.5 w-3.5" /> Secret Key
                  </Label>
                  <Input 
                    id="ibkr-secret-key" 
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter your IBKR secret key" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="ibkr-account-id" className="flex items-center gap-1">
                    <Link className="h-3.5 w-3.5" /> Account ID
                  </Label>
                  <Input 
                    id="ibkr-account-id" 
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="Enter your IBKR account ID" 
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="ibkr-paper-trading" 
                  checked={settings.paperTrading}
                  onCheckedChange={handlePaperTradingChange}
                />
                <Label htmlFor="ibkr-paper-trading" className="cursor-pointer">
                  Enable Paper Trading Mode
                </Label>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    To get your IBKR API credentials, log in to your IBKR account, go to User Settings > API Settings, and generate a new API key.
                    Make sure to enable the required permissions for options trading.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="td-ameritrade" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">TD Ameritrade Connection</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to the TD Ameritrade API for automated trading
                  </p>
                </div>
                {settings.type === 'td-ameritrade' && settings.isConnected ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <XCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Not Connected</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="td-api-key" className="flex items-center gap-1">
                    <Key className="h-3.5 w-3.5" /> API Key
                  </Label>
                  <Input 
                    id="td-api-key" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your TD Ameritrade API key" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="td-account-id" className="flex items-center gap-1">
                    <Link className="h-3.5 w-3.5" /> Account ID
                  </Label>
                  <Input 
                    id="td-account-id" 
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="Enter your TD Ameritrade account ID" 
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="td-paper-trading" 
                  checked={settings.paperTrading}
                  onCheckedChange={handlePaperTradingChange}
                />
                <Label htmlFor="td-paper-trading" className="cursor-pointer">
                  Enable Paper Trading Mode
                </Label>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    To get your TD Ameritrade API credentials, visit the TD Ameritrade Developer portal, 
                    register your application, and generate API keys with the appropriate permissions.
                    Make sure to enable options trading permissions.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleTest}
              disabled={testing || !apiKey}
              className="flex-1 sm:flex-none relative"
            >
              {testing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing
                </>
              ) : (
                <>Test Connection</>
              )}
            </Button>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={testing || !apiKey}
            className="flex-1 sm:flex-none"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
