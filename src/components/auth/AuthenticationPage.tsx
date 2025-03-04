
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpyHeaderWithNotifications } from '@/components/spy/SpyHeaderWithNotifications';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthenticationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [defaultTab, setDefaultTab] = useState('signup');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check if the user is already logged in
    const checkSession = async () => {
      try {
        setIsCheckingSession(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsCheckingSession(false);
          return;
        }
        
        // If user is logged in, navigate to dashboard
        if (data.session) {
          console.log("User already logged in, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
          return; // Don't set isCheckingSession to false - we're navigating away
        }
        
        setIsCheckingSession(false);
      } catch (err) {
        console.error("Failed to check session:", err);
        setIsCheckingSession(false);
      }
    };
    
    checkSession();
    
    // Check if there's an access token in the URL hash (for OAuth)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      console.log("Detected auth callback in URL");
      setDefaultTab('login');
    }
  }, [navigate]); // <-- Removed location dependency to avoid re-runs
  
  // Set up auth state change listener in a separate useEffect to avoid conflicts
  useEffect(() => {
    // Only set up the listener if we're not checking the session
    if (isCheckingSession) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session) {
        const returnPath = location.state?.returnTo || '/dashboard';
        console.log("User signed in, redirecting to:", returnPath);
        navigate(returnPath, { replace: true });
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location, isCheckingSession]);
  
  const switchToLogin = () => {
    setDefaultTab('login');
  };

  const switchToSignup = () => {
    setDefaultTab('signup');
  };

  const handleSignupSuccess = () => {
    switchToLogin();
    toast.info('Please log in with your new account');
  };
  
  // Don't render anything while checking session to prevent flashes
  if (isCheckingSession) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container py-4">
          <SpyHeaderWithNotifications minimal={true} />
        </div>
      </header>
      
      <main className="flex-1 container mx-auto flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">SPY Trading AI</CardTitle>
            <CardDescription className="text-center">
              Join thousands of traders using AI to optimize SPY options trades
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={defaultTab} defaultValue={defaultTab} onValueChange={(value) => setDefaultTab(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signup" className="text-base py-2">Sign Up</TabsTrigger>
                <TabsTrigger value="login" className="text-base py-2">Login</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signup">
                <div className="space-y-4">
                  <SignupForm 
                    isLoading={isLoading} 
                    setIsLoading={setIsLoading}
                    onSignupSuccess={handleSignupSuccess}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="login">
                <div className="space-y-4">
                  <LoginForm 
                    isLoading={isLoading} 
                    setIsLoading={setIsLoading}
                    switchToSignup={switchToSignup}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AuthenticationPage;
