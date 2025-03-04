
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ibkrDocumentation } from '@/services/dataProviders/interactiveBrokers/documentation';

export const IBKRGuide: React.FC = () => {
  return (
    <div className="hidden sm:relative sm:block group">
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs hidden sm:inline-flex"
        onClick={() => ibkrDocumentation.openUserGuide()}
      >
        IBKR Guide
      </Button>
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <button 
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => ibkrDocumentation.openUserGuide()}
        >
          View Guide
        </button>
        <button 
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => ibkrDocumentation.downloadUserGuide()}
        >
          Download Guide
        </button>
        <button 
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => ibkrDocumentation.openClientPortalDocs()}
        >
          Client Portal API
        </button>
        <Link 
          to="/ibkr-integration"
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Setup Integration
        </Link>
      </div>
    </div>
  );
};

export default IBKRGuide;
