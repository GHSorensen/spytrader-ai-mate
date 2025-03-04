
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const BrokerageMenu: React.FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          <span>Brokerages</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 shadow-md">
        <DropdownMenuItem asChild>
          <Link to="/ibkr-integration" className="w-full cursor-pointer">
            IBKR Connect
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/schwab-integration" className="w-full cursor-pointer">
            Schwab Connect
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BrokerageMenu;
