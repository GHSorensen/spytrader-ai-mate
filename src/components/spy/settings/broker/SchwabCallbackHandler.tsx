import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QueryClientProvider from '@/components/QueryClientProvider';

export const SchwabCallbackHandler: React.FC = () => {
  return (
    <QueryClientProvider>
      <SchwabCallbackContent />
    </QueryClientProvider>
  );
};

const SchwabCallbackContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  React.useEffect(() => {
    if (code && state) {
      console.log('Authorization code:', code);
      console.log('State:', state);

      // Here you would typically send the code and state to your backend
      // to exchange them for an access token.
      // For demonstration purposes, we'll just navigate to a different page.

      // Example: navigate('/dashboard');
      // Replace '/dashboard' with the appropriate route in your application.
    } else {
      console.error('Code or state missing from callback URL');
      // Handle the error appropriately, e.g., navigate to an error page
    }
  }, [code, state, navigate]);

  const handleReturn = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-96">
        <CardContent className="p-4">
          {code && state ? (
            <>
              <p className="text-green-600 font-semibold mb-4">
                Authorization successful!
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Code: {code}
                <br />
                State: {state}
              </p>
              <p className="text-gray-700 mb-4">
                Your application has successfully received the authorization code from Schwab.
                The next step is to send this code to your backend server to exchange it for an access token.
              </p>
              <Button onClick={handleReturn}>Return to Dashboard</Button>
            </>
          ) : (
            <>
              <p className="text-red-600 font-semibold mb-4">
                Authorization failed.
              </p>
              <p className="text-gray-700">
                Authorization code or state is missing. Please try again.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
