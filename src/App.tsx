import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TradeAutomation from './components/TradeAutomation';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import RiskConsole from './pages/RiskConsole';
import PerformanceDashboard from './components/spy/PerformanceDashboard';
import RiskMonitoringTest from './pages/RiskMonitoringTest';
import notificationService from './services/notification/notificationService';
import ErrorBoundary from './components/ErrorBoundary';
import SchwabIntegrationPage from './pages/SchwabIntegrationPage';
import IBKRIntegrationPage from './pages/IBKRIntegrationPage';
import IBKRCallbackPage from './pages/IBKRCallbackPage';
import DetailedPerformancePage from './components/performance/DetailedPerformancePage';
import { Toaster } from './components/ui/toaster';
import { toast } from './hooks/use-toast';
import AuthenticationPage from './components/auth/AuthenticationPage';
import UserProfilePage from './components/auth/UserProfilePage';
import { supabase } from './integrations/supabase/client';
import { SpyHeaderWithNotifications } from './components/spy/SpyHeaderWithNotifications';

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  // Set up auth state monitoring
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log("Initial session check:", session ? "Authenticated" : "Not authenticated");
      
      // If we have a session, fetch the user profile
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      
      // Fetch user profile when auth state changes
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Function to fetch user profile
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      console.log("Fetched user profile:", data);
      setUserProfile(data);
    } catch (error) {
      console.error("Error in profile fetch process:", error);
    }
  };

  // Set up initial notifications on app load
  useEffect(() => {
    try {
      // Expose toast for global access
      window.toast = toast;
      
      // Demo: Schedule daily portfolio updates
      const currentBalance = 125000; // This would come from your actual portfolio data
      
      // Initialize notification schedule (these would normally be at market open/close)
      notificationService.scheduleMorningUpdate(currentBalance, 0, 0);
      notificationService.scheduleEndOfDayUpdate(currentBalance, 1200, 0.96);
      
      // Sample initial notification on app startup
      notificationService.createNotification(
        'system_message',
        'Welcome back',
        'Your SPY trading AI system is active and monitoring the markets.',
        'low',
        ['in_app']
      );
    } catch (err) {
      console.error('Failed to setup notifications:', err);
    }
    
    // Cleanup toast when component unmounts
    return () => {
      window.toast = undefined;
    };
  }, []);

  // Creating a layout wrapper that includes the header for authenticated routes
  const AuthenticatedLayout = ({ children }) => (
    <>
      <header className="border-b">
        <div className="container py-4">
          <SpyHeaderWithNotifications userProfile={userProfile} />
        </div>
      </header>
      {children}
    </>
  );

  // A custom Route component for authenticated routes that includes the layout
  const AuthenticatedRoute = ({ element }) => {
    return session ? (
      <AuthenticatedLayout>
        {element}
      </AuthenticatedLayout>
    ) : (
      <Navigate to="/auth" replace />
    );
  };

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Index />} />
        <Route path="/dashboard" element={<AuthenticatedRoute element={<Dashboard />} />} />
        <Route path="/trade-automation" element={<AuthenticatedRoute element={<TradeAutomation />} />} />
        <Route path="/performance" element={<AuthenticatedRoute element={<PerformanceDashboard />} />} />
        <Route path="/detailed-performance" element={<AuthenticatedRoute element={<DetailedPerformancePage />} />} />
        <Route path="/risk-console" element={<AuthenticatedRoute element={<RiskConsole />} />} />
        <Route path="/risk-monitoring-test" element={<AuthenticatedRoute element={<RiskMonitoringTest />} />} />
        <Route path="/schwab-integration" element={<AuthenticatedRoute element={<SchwabIntegrationPage />} />} />
        <Route path="/ibkr-integration" element={<AuthenticatedRoute element={<IBKRIntegrationPage />} />} />
        <Route path="/auth/ibkr/callback" element={<IBKRCallbackPage />} />
        <Route path="/auth" element={session ? <Navigate to="/dashboard" replace /> : <AuthenticationPage />} />
        <Route path="/profile" element={<AuthenticatedRoute element={<UserProfilePage userProfile={userProfile} />} />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
      <Toaster />
    </ErrorBoundary>
  );
}

// Extend the Window interface to include our toast property
declare global {
  interface Window {
    toast?: typeof toast;
  }
}

export default App;
