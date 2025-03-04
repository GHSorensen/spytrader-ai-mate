import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (data.session) {
          console.log("User already logged in, redirecting to dashboard");
          navigate('/dashboard');
          toast.success('You are already logged in');
        }
      } catch (err) {
        console.error("Failed to check session:", err);
      }
    };
    
    checkSession();
    
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      console.log("Detected auth callback in URL");
      setDefaultTab('login');
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, redirecting to dashboard");
        navigate('/dashboard');
        toast.success('Successfully logged in');
      }
      else if (event === 'SIGNED_OUT') {
        toast.info('You have been signed out');
      }
      else if (event === 'USER_UPDATED') {
        toast.info('Your account has been updated');
      }
      else if (event === 'PASSWORD_RECOVERY') {
        toast.info('Password recovery initiated');
      }
      else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed");
      }
      else if (event.toLowerCase() === 'user_deleted') {
        toast.info('Your account has been deleted');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
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
