import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import FounderDashboard from './components/Dashboard/FounderDashboard';
import TalentDashboard from './components/Dashboard/TalentDashboard';
import MarketplacePage from './components/Campaigns/MarketplacePage';
import CampaignsPage from './components/Campaigns/CampaignsPage';
import OrdersPage from './components/Orders/OrdersPage';
import MyJobsPage from './components/Jobs/MyJobsPage';
import ReviewsPage from './components/Reviews/ReviewsPage';
import EWalletPage from './components/Wallet/EWalletPage';
import EarningsPage from './components/Earnings/EarningsPage';
import FoundersPage from './components/Admin/FoundersPage';
import TalentsPage from './components/Admin/TalentsPage';
import AdminCampaignsPage from './components/Admin/CampaignsPage';
import PaymentsPage from './components/Admin/PaymentsPage';
import AnalyticsPage from './components/Admin/AnalyticsPage';
import FounderProfileModal from './components/Profile/FounderProfileModal';
import TalentProfileModal from './components/Profile/TalentProfileModal';
import AdminProfileModal from './components/Profile/AdminProfileModal';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Listen for profile modal events from navbar
  useEffect(() => {
    const handleOpenProfileModal = () => {
      setShowProfileModal(true);
    };

    window.addEventListener('openProfileModal', handleOpenProfileModal);
    return () => {
      window.removeEventListener('openProfileModal', handleOpenProfileModal);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        if (user.role === 'admin') return <AdminDashboard />;
        if (user.role === 'founder') return <FounderDashboard />;
        if (user.role === 'talent') return <TalentDashboard />;
        break;
      case 'founders':
        if (user.role === 'admin') return <FoundersPage />;
        // Redirect non-admins to dashboard
        setCurrentPage('dashboard');
        return user.role === 'founder' ? <FounderDashboard /> : <TalentDashboard />;
      case 'talents':
        if (user.role === 'admin') return <TalentsPage />;
        // Redirect non-admins to dashboard
        setCurrentPage('dashboard');
        return user.role === 'founder' ? <FounderDashboard /> : <TalentDashboard />;
      case 'payments':
        if (user.role === 'admin') return <PaymentsPage />;
        // Redirect non-admins to dashboard
        setCurrentPage('dashboard');
        return user.role === 'founder' ? <FounderDashboard /> : <TalentDashboard />;
      case 'analytics':
        if (user.role === 'admin') return <AnalyticsPage />;
        // Redirect non-admins to dashboard
        setCurrentPage('dashboard');
        return user.role === 'founder' ? <FounderDashboard /> : <TalentDashboard />;
      case 'marketplace':
        // Only allow talents to access marketplace
        if (user.role === 'talent') {
          return <MarketplacePage />;
        } else {
          // Redirect founders and admins to dashboard
          setCurrentPage('dashboard');
          return user.role === 'founder' ? <FounderDashboard /> : <AdminDashboard />;
        }
      case 'campaigns':
        if (user.role === 'founder') return <CampaignsPage />;
        if (user.role === 'admin') return <AdminCampaignsPage />;
        // Redirect talents to dashboard
        setCurrentPage('dashboard');
        return <TalentDashboard />;
      case 'orders':
        if (user.role === 'founder') return <OrdersPage />;
        // Redirect non-founders to dashboard
        setCurrentPage('dashboard');
        return user.role === 'admin' ? <AdminDashboard /> : <TalentDashboard />;
      case 'jobs':
        if (user.role === 'talent') return <MyJobsPage />;
        // Redirect non-talents to dashboard
        setCurrentPage('dashboard');
        return user.role === 'admin' ? <AdminDashboard /> : <FounderDashboard />;
      case 'reviews':
        if (user.role === 'founder') return <ReviewsPage />;
        // Redirect non-founders to dashboard
        setCurrentPage('dashboard');
        return user.role === 'admin' ? <AdminDashboard /> : <TalentDashboard />;
      case 'wallet':
        if (user.role === 'founder') return <EWalletPage />;
        // Redirect non-founders to dashboard
        setCurrentPage('dashboard');
        return user.role === 'admin' ? <AdminDashboard /> : <TalentDashboard />;
      case 'earnings':
        if (user.role === 'talent') return <EarningsPage />;
        // Redirect non-talents to dashboard
        setCurrentPage('dashboard');
        return user.role === 'admin' ? <AdminDashboard /> : <FounderDashboard />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h2>
              <p className="text-gray-600">This page is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 p-6">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Profile Modals */}
      {showProfileModal && user.role === 'founder' && (
        <FounderProfileModal onClose={() => setShowProfileModal(false)} />
      )}
      
      {showProfileModal && user.role === 'talent' && (
        <TalentProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      {showProfileModal && user.role === 'admin' && (
        <AdminProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;