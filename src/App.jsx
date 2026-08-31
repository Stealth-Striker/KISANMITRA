import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
// Farmer pages
import FarmerDashboard from '@/pages/FarmerDashboard';
import CropDoctor from '@/pages/CropDoctor';
import OutbreakRadar from '@/pages/OutbreakRadar';
import HarvestGuardian from '@/pages/HarvestGuardian';
import MarketCopilot from '@/pages/MarketCopilot';
import ConversationHistory from '@/pages/ConversationHistory';
import Preferences from '@/pages/Preferences';
// Admin pages
import AdminDashboard from '@/pages/AdminDashboard';
import AdminFarmers from '@/pages/AdminFarmers';
import AdminDiseaseAlerts from '@/pages/AdminDiseaseAlerts';
import AdminMarketData from '@/pages/AdminMarketData';
import AdminConversations from '@/pages/AdminConversations';
import AdminAudit from '@/pages/AdminAudit';
// Layouts
import FarmerLayout from '@/components/kisan/FarmerLayout';
import AdminLayout from '@/components/kisan/AdminLayout';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-[hsl(var(--km-green))] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected farmer routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<FarmerLayout />}>
          <Route path="/dashboard" element={<FarmerDashboard />} />
          <Route path="/crop-doctor" element={<CropDoctor />} />
          <Route path="/outbreak-radar" element={<OutbreakRadar />} />
          <Route path="/harvest-guardian" element={<HarvestGuardian />} />
          <Route path="/market-copilot" element={<MarketCopilot />} />
          <Route path="/conversations" element={<ConversationHistory />} />
          <Route path="/preferences" element={<Preferences />} />
        </Route>
        {/* Protected admin routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/farmers" element={<AdminFarmers />} />
          <Route path="/admin/disease-alerts" element={<AdminDiseaseAlerts />} />
          <Route path="/admin/market-data" element={<AdminMarketData />} />
          <Route path="/admin/conversations" element={<AdminConversations />} />
          <Route path="/admin/audit" element={<AdminAudit />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App