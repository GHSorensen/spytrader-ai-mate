
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, Server, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrokerSettings as BrokerSettingsType } from '@/lib/types/spy/broker';
import { toast } from '@/components/ui/use-toast';

interface BrokerSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSettings: BrokerSettingsType;
  onSave: (settings: BrokerSettingsType) => void;
}

export const BrokerSettings: React.FC<BrokerSettingsProps> = ({
  open,
  onOpenChange,
  currentSettings,
  onSave
}) => {
  // Local state to track form changes
  const [settings, setSettings] = useState<BrokerSettingsType>(currentSettings);
  const [activeTab, setActiveTab] = useState<'ib' | 'td' | 'none'>(
    currentSettings.type === 'interactive-brokers' ? 'ib' : 
    currentSettings.type === 'td-ameritrade' ? 'td' : 'none'
  );

  // Reset local state when dialog opens
  React.useEffect(() => {
    if (open) {
      setSettings(currentSettings);
      setActiveTab(
        currentSettings.type === 'interactive-brokers' ? 'ib' : 
        currentSettings.type === 'td-ameritrade' ? 'td' : 'none'
      );
    }
  }, [open, currentSettings]);

  const handleSave = () => {
    // Set the broker type based on the active tab
    const brokerType = 
      activeTab === 'ib' ? 'interactive-brokers' : 
      activeTab === 'td' ? 'td-ameritrade' : 'none';
    
    // Update the settings with the broker type
    const updatedSettings = {
      ...settings,
      type: brokerType,
      isConnected: brokerType !== 'none' && Boolean(
        settings.credentials.apiKey && 
        (brokerType === 'interactive-brokers' ? settings.credentials.accountId : true)
      ),
    };
    
    onSave(updatedSettings);
    onOpenChange(false);
    
    toast({
      title: "Broker Settings Saved",
      description: `Settings saved for ${
        brokerType === 'interactive-brokers' ? 'Interactive Brokers' : 
        brokerType === 'td-ameritrade' ? 'TD Ameritrade' : 'No Broker'
      }`,
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Update credentials in the settings state
  const updateCredential = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [key]: value
      }
    }));
  };

  // Toggle paper trading
  const togglePaperTrading = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      paperTrading: enabled
    }));
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
            Connect your brokerage account to execute trades automatically
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ib' | 'td' | 'none')}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="ib">Interactive Brokers</TabsTrigger>
            <TabsTrigger value="td">TD Ameritrade</TabsTrigger>
            <TabsTrigger value="none">No Broker</TabsTrigger>
          </TabsList>

          <TabsContent value="ib">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Brokers API</CardTitle>
                <CardDescription>
                  Enter your IBKR credentials to connect via the Client Portal API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ibkr-api-key">API Key</Label>
                  <Input 
                    id="ibkr-api-key" 
                    placeholder="Enter your IBKR API key"
                    value={settings.credentials.apiKey || ''}
                    onChange={(e) => updateCredential('apiKey', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ibkr-account-id">Account ID</Label>
                  <Input 
                    id="ibkr-account-id" 
                    placeholder="Enter your IBKR account ID"
                    value={settings.credentials.accountId || ''}
                    onChange={(e) => updateCredential('accountId', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="paper-trading">Paper Trading</Label>
                    <div className="text-sm text-muted-foreground">
                      Use paper trading account for testing
                    </div>
                  </div>
                  <Switch
                    id="paper-trading"
                    checked={settings.paperTrading}
                    onCheckedChange={togglePaperTrading}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="td">
            <Card>
              <CardHeader>
                <CardTitle>TD Ameritrade API</CardTitle>
                <CardDescription>
                  Enter your TD Ameritrade developer credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="td-api-key">Consumer Key</Label>
                  <Input 
                    id="td-api-key" 
                    placeholder="Enter your TD Ameritrade consumer key"
                    value={settings.credentials.apiKey || ''}
                    onChange={(e) => updateCredential('apiKey', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="td-secret-key">Redirect URI</Label>
                  <Input 
                    id="td-secret-key" 
                    placeholder="Enter your redirect URI"
                    value={settings.credentials.secretKey || ''}
                    onChange={(e) => updateCredential('secretKey', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="paper-trading-td">Paper Trading</Label>
                    <div className="text-sm text-muted-foreground">
                      Use paper trading account for testing
                    </div>
                  </div>
                  <Switch
                    id="paper-trading-td"
                    checked={settings.paperTrading}
                    onCheckedChange={togglePaperTrading}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="none">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <Server className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">No Broker Connection</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Without a broker connection, you'll need to execute trades manually
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          <Button 
            variant="outline" 
            onClick={handleCancel} 
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 sm:flex-none"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
