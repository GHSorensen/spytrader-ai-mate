
import React, { useEffect, useState } from 'react';
import { SpyHeaderWithNotifications } from '@/components/spy/SpyHeaderWithNotifications';
import { supabase } from '@/integrations/supabase/client';

const IBKRHeader: React.FC<{ userProfile?: any }> = ({ userProfile }) => {
  const [currentUserProfile, setCurrentUserProfile] = useState(userProfile);
  
  // Check if we're in a nested layout
  const isNestedLayout = window.location.pathname.includes('/ibkr-integration');
  
  useEffect(() => {
    // If no profile is provided, try to fetch from session
    if (!userProfile) {
      const fetchUserData = async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
              
            if (profileData) {
              setCurrentUserProfile(profileData);
            } else {
              // If no profile exists, use email as name
              setCurrentUserProfile({
                name: data.session.user.email?.split('@')[0] || 'User'
              });
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }
      };
      
      fetchUserData();
    }
  }, [userProfile]);
  
  if (isNestedLayout) {
    return null; // Don't render duplicate header
  }
  
  return (
    <header className="border-b">
      <div className="container py-4">
        <SpyHeaderWithNotifications userProfile={currentUserProfile || userProfile} />
      </div>
    </header>
  );
};

export default IBKRHeader;
