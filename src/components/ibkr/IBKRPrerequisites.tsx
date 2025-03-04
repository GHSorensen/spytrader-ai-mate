
import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const IBKRPrerequisites: React.FC = () => {
  const prerequisites = [
    {
      id: 'login',
      title: 'Log in to Interactive Brokers',
      description: 'Make sure you are logged in to your IBKR account'
    },
    {
      id: 'tws',
      title: 'For TWS users: Configure API settings',
      description: 'Enable API connections in TWS API settings'
    },
    {
      id: 'settings',
      title: 'Confirm TWS API Settings',
      description: 'Go to TWS > Edit > Global Configuration > API > Settings and ensure:'
    }
  ];
  
  const twsSettings = [
    { text: 'Enable ActiveX and Socket Clients is checked', key: 'enable' },
    { text: 'Socket port is correct (7496 for live, 7497 for paper trading)', key: 'port' },
    { text: 'Allow connections from localhost only is recommended', key: 'localhost' },
    { text: 'Uncheck Read-Only API if you want to place trades', key: 'readonly' }
  ];
  
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Before you connect</AlertTitle>
        <AlertDescription>
          <div className="text-sm space-y-2 mt-2">
            {prerequisites.map((item) => (
              <div key={item.id} className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground">{item.description}</p>
                  
                  {item.id === 'settings' && (
                    <ul className="mt-2 space-y-1 text-sm">
                      {twsSettings.map((setting) => (
                        <li key={setting.key} className="flex items-start">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-2"></span>
                          {setting.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default IBKRPrerequisites;
