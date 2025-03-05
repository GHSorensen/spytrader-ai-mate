
import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import IBKRTestDashboard from './components/ibkr/test/IBKRTestDashboard';

/**
 * Additional routes for testing purposes
 */
export const testRoutes: RouteObject[] = [
  {
    path: '/ibkr-test',
    element: <IBKRTestDashboard />,
  }
];
