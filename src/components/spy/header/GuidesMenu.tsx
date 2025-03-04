
import React from 'react';
import { Book, ChevronDown, Download, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { schwabDocumentation } from '@/services/dataProviders/schwab/documentation';
import { ibkrDocumentation } from '@/services/dataProviders/interactiveBrokers/documentation';

export const GuidesMenu: React.FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Book className="h-4 w-4" />
          <span>User Guides</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 shadow-md">
        <DropdownMenuItem className="font-medium">Schwab Resources</DropdownMenuItem>
        <DropdownMenuItem onClick={() => schwabDocumentation.openUserGuide()}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View Guide
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => schwabDocumentation.downloadUserGuide()}>
          <Download className="h-4 w-4 mr-2" />
          Download Guide
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="font-medium">IBKR Resources</DropdownMenuItem>
        <DropdownMenuItem onClick={() => ibkrDocumentation.openUserGuide()}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View Guide
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => ibkrDocumentation.downloadUserGuide()}>
          <Download className="h-4 w-4 mr-2" />
          Download Guide
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => ibkrDocumentation.openClientPortalDocs()}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Client Portal API
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GuidesMenu;
