
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
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log("Initial session check:", session ? "Authenticated" : "Not authenticated");
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  useEffect(() => {
    try {
      window.toast = toast;
      
      const currentBalance = 125000;
      
      notificationService.scheduleMorningUpdate(currentBalance, 0, 0);
      notificationService.scheduleEndOfDayUpdate(currentBalance, 1200, 0.96);
      
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
    
    return () => {
      window.toast = undefined;
    };
  }, []);

  // Don't render anything until auth is ready to prevent flash
  if (!isAuthReady) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  const AuthenticatedLayout = ({ children }) => (
    <>
      <header className="border-b">
        <div className="container py-4">
          <SpyHeaderWithNotifications 
            userProfile={userProfile} 
            setIsAISettingsOpen={setIsAISettingsOpen}
          />
        </div>
      </header>
      {children}
    </>
  );

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
        <Route path="/auth" element={<AuthenticationPage />} />
        <Route path="/profile" element={session ? <UserProfilePage userProfile={userProfile} /> : <Navigate to="/auth" replace />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
      <Toaster />
    </ErrorBoundary>
  );
}

declare global {
  interface Window {
    toast?: typeof toast;
  }
}

export default App;
