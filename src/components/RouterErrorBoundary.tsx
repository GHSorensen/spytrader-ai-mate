
import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

const RouterErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = 'An unexpected error occurred';
  let errorStatus = '';
  
  if (isRouteErrorResponse(error)) {
    errorStatus = `${error.status}`;
    if (error.status === 404) {
      errorMessage = 'The page you are looking for does not exist.';
    } else if (error.status === 401) {
      errorMessage = 'You are not authorized to access this page.';
    } else if (error.status === 503) {
      errorMessage = 'The service is temporarily unavailable.';
    } else if (error.status === 418) {
      errorMessage = "I'm a teapot. Don't ask me to brew coffee.";
    } else {
      errorMessage = error.statusText || errorMessage;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            {errorStatus ? `Error ${errorStatus}` : 'Application Error'}
          </CardTitle>
          <CardDescription>
            {errorStatus === '404' ? 'Page not found' : 'Something went wrong'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-3 rounded-md text-sm overflow-auto max-h-[200px]">
            <p className="font-mono">{errorMessage}</p>
          </div>
          <p className="text-sm text-gray-600">
            {errorStatus === '404' 
              ? 'The page you were looking for doesn\'t exist or may have been moved.'
              : 'The application has encountered an unexpected error. You can try returning to the previous page or going to the home page.'}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          <Button variant="outline" onClick={handleGoBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={handleGoHome} className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RouterErrorBoundary;
