
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { config } from '@/config/environment';

interface SignupFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSignupSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ isLoading, setIsLoading, onSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    
    if (password !== confirmPassword) {
      setSignupError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting to sign up with email:", email);
      
      // Use the configured redirectTo URL from the environment
      const redirectUrl = `${window.location.origin}/auth`;
      console.log("Using redirect URL:", redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: redirectUrl,
        },
      });
      
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      console.log("Sign up response:", data);
      
      if (data?.user) {
        setVerificationSent(true);
        
        // Check if email confirmation is required
        if (!data.session) {
          toast.success('Account created! Please check your email to verify your account before logging in.');
          console.log("Email verification required");
        } else {
          // If no email confirmation is needed, we can consider the user signed in
          toast.success('Account created and logged in successfully!');
          if (onSignupSuccess) {
            onSignupSuccess();
          }
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error("Error in signup process:", error);
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        setSignupError('This email is already registered. Please log in instead.');
        toast.error('This email is already registered. Please log in instead.');
      } else {
        setSignupError(error.message || 'Error creating account');
        toast.error(error.message || 'Error creating account');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      
      if (error) throw error;
      
      toast.success('Verification email resent. Please check your inbox.');
    } catch (error: any) {
      console.error("Error resending verification:", error);
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (verificationSent) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium">Verification Email Sent</h3>
        <p>We've sent a verification email to <strong>{email}</strong></p>
        <p className="text-sm text-muted-foreground">
          Please check your inbox and click the verification link to complete your registration.
          If you don't see the email, check your spam folder.
        </p>
        <div className="space-y-2 mt-6">
          <Button 
            onClick={handleResendVerification} 
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Resend verification email'}
          </Button>
          
          <Button 
            onClick={() => setVerificationSent(false)} 
            variant="ghost"
            className="w-full mt-2"
          >
            Use a different email
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          placeholder="John Doe" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="your@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input 
          id="signup-password" 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input 
          id="confirm-password" 
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          required
        />
      </div>
      
      {signupError && (
        <div className="text-sm text-red-500 mt-2">
          {signupError}
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
};

export default SignupForm;
