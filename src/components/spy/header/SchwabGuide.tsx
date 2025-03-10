
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { schwabDocumentation } from '@/services/dataProviders/schwab/documentation';

export const SchwabGuide: React.FC = () => {
  return (
    <div className="hidden sm:relative sm:block group">
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs hidden sm:inline-flex"
        onClick={() => schwabDocumentation.openUserGuide()}
      >
        Schwab Guide
      </Button>
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <button 
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => schwabDocumentation.openUserGuide()}
        >
          View Guide
        </button>
        <button 
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => schwabDocumentation.downloadUserGuide()}
        >
          Download Guide
        </button>
        <Link 
          to="/schwab-integration"
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Setup Integration
        </Link>
      </div>
    </div>
  );
};

export default SchwabGuide;
