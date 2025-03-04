
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a TD Ameritrade or IBKR callback
    const processCallback = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        
        if (location.pathname.includes('td-ameritrade')) {
          // Process TD Ameritrade callback
          setMessage('Processing TD Ameritrade authentication...');
          // Here you would normally process the auth code with your backend
          
          // Simulate successful authentication
          setTimeout(() => {
            setStatus('success');
            setMessage('TD Ameritrade authentication successful. Redirecting...');
            setTimeout(() => navigate('/td-ameritrade'), 2000);
          }, 1500);
        } else if (location.pathname.includes('ibkr')) {
          // Process IBKR callback
          setMessage('Processing Interactive Brokers authentication...');
          // Here you would normally process the auth token with your backend
          
          // Simulate successful authentication
          setTimeout(() => {
            setStatus('success');
            setMessage('Interactive Brokers authentication successful. Redirecting...');
            setTimeout(() => navigate('/ibkr'), 2000);
          }, 1500);
        } else {
          throw new Error('Unknown authentication provider');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('error');
        setMessage(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    processCallback();
  }, [location, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-center text-2xl font-bold">Authentication Callback</h1>
        
        <div className="my-8 flex justify-center">
          {status === 'processing' && (
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
          )}
          {status === 'success' && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        
        <p className="text-center text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
