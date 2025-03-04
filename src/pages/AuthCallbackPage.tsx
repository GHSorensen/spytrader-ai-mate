
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get('code');
    const state = query.get('state');
    const error = query.get('error');

    if (error) {
      setStatus('error');
      setMessage(`Authentication error: ${error}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      return;
    }

    // Here we would typically process the authentication
    // This is a placeholder for actual auth processing
    setTimeout(() => {
      setStatus('success');
      setMessage('Authentication successful! Redirecting...');

      // Redirect based on path
      if (location.pathname.includes('td-ameritrade')) {
        setTimeout(() => navigate('/td-ameritrade'), 2000);
      } else if (location.pathname.includes('ibkr')) {
        setTimeout(() => navigate('/ibkr'), 2000);
      } else {
        setTimeout(() => navigate('/'), 2000);
      }
    }, 2000);
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {status === 'processing' && 'Processing Authentication'}
            {status === 'success' && 'Authentication Successful'}
            {status === 'error' && 'Authentication Error'}
          </h1>
          <div className="mt-4 text-gray-600">{message}</div>
          
          {status === 'processing' && (
            <div className="flex justify-center mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {status === 'error' && (
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
