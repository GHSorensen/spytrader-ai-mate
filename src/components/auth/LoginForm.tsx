
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface LoginFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  switchToSignup?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isLoading, setIsLoading, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);
    
    try {
      console.log("Attempting to log in with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful:", data);
      toast.success('Successfully logged in');
      // Navigation will be handled by the auth state change listener
    } catch (error: any) {
      console.error("Error in login process:", error);
      
      if (error.message?.includes('Email not confirmed')) {
        setLoginError('Please verify your email before logging in. Check your inbox for a verification link.');
        toast.error('Email not confirmed. Please check your inbox for the verification link.');
      } else if (error.message?.includes('Invalid login credentials')) {
        setLoginError('Invalid email or password');
        toast.error('Invalid email or password');
      } else {
        setLoginError(error.message || 'Error logging in');
        toast.error(error.message || 'Error logging in');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth',
      });
      if (error) throw error;
      toast.success('Password reset email sent. Please check your inbox');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Use signUp with the same email to trigger a new verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      
      if (error) throw error;
      
      toast.success('Verification email resent. Please check your inbox');
    } catch (error: any) {
      // Rate limit error handling
      if (error.message?.includes('rate limit')) {
        toast.error('Too many requests. Please try again in a few minutes.');
      } else {
        toast.error(error.message || 'Failed to resend verification email');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="your@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button 
            variant="link" 
            className="px-0 text-xs h-auto" 
            type="button"
            onClick={handlePasswordReset}
          >
            Forgot password?
          </Button>
        </div>
        <Input 
          id="password" 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      {loginError && (
        <div className="text-sm text-red-500 mt-2">
          {loginError}
          {loginError.includes('verify') && (
            <div className="mt-1">
              <Button 
                variant="link" 
                className="p-0 text-xs h-auto" 
                type="button"
                onClick={handleResendVerification}
              >
                Resend verification email
              </Button>
            </div>
          )}
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
      
      {switchToSignup && (
        <div className="text-center text-sm mt-4">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Button 
            variant="link" 
            className="p-0 h-auto" 
            type="button"
            onClick={switchToSignup}
          >
            Sign up
          </Button>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
