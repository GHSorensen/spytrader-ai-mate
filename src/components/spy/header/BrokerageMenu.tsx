
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { getSchwabCredentials } from '@/services/dataProviders/schwab/utils/credentialUtils';
import { ArrowUpRight, Briefcase } from 'lucide-react';

export function BrokerageMenu() {
  const schwabConfig = getSchwabCredentials();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Briefcase className="h-4 w-4" />
          <span>Brokerages</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem asChild>
          <Link to="/ibkr-integration" className="flex items-center justify-between">
            <span>Interactive Brokers</span>
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/schwab-integration" className="flex items-center justify-between">
            <div className="flex flex-col">
              <span>Charles Schwab</span>
              {schwabConfig?.apiKey && (
                <span className="text-xs text-muted-foreground">
                  {schwabConfig.apiKey.substring(0, 5)}...
                </span>
              )}
            </div>
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
