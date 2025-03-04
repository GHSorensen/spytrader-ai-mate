
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTradesAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const isAuthed = !!data.session;
      console.log("useTradesAuth - Auth check:", isAuthed);
      setIsAuthenticated(isAuthed);
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        const newAuthState = !!session;
        console.log('Auth state changed in useTradesAuth:', event, newAuthState);
        setIsAuthenticated(newAuthState);
      });
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, []);

  return { isAuthenticated };
};
