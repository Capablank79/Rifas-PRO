import { Routes, Route } from 'react-router-dom';
import { RaffleProvider } from './context/RaffleContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SellersPage from './pages/SellersPage';
import RealtimeSalesPage from './pages/RealtimeSalesPage';
import TransparentRafflesPage from './pages/TransparentRafflesPage';
import SmartNotificationsPage from './pages/SmartNotificationsPage';
import AdvancedAnalyticsPage from './pages/AdvancedAnalyticsPage';
import BuyerRegistryPage from './pages/BuyerRegistryPage';
import WebAccessPage from './pages/WebAccessPage';
import HomePage from './pages/HomePage';
import CreateRafflePage from './pages/CreateRafflePage';
import RaffleManagementPage from './pages/RaffleManagementPage';
import SellPage from './pages/SellPage';
import BuyerPage from './pages/BuyerPage';
import ConfirmationPage from './pages/ConfirmationPage';
import WebpayPage from './pages/WebpayPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';
import { useEffect, useState } from 'react';

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

function App() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { type, title, message, duration = 5000 } = event.detail;
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, type, title, message, duration }]);
      
      // Auto-remove toast after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    };

    window.addEventListener('show-toast', handleShowToast as EventListener);

    return () => {
      window.removeEventListener('show-toast', handleShowToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <AuthProvider>
      <RaffleProvider>
        <div className="App d-flex flex-column min-vh-100">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/sellers" element={<SellersPage />} />
            <Route path="/realtime-sales" element={<RealtimeSalesPage />} />
            <Route path="/transparent-raffles" element={<TransparentRafflesPage />} />
            <Route path="/smart-notifications" element={<SmartNotificationsPage />} />
          <Route path="/advanced-analytics" element={<AdvancedAnalyticsPage />} />
          <Route path="/buyer-registry" element={<BuyerRegistryPage />} />
          <Route path="/web-access" element={<WebAccessPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Navbar />
                <main className="flex-grow-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/create" element={<CreateRafflePage />} />
                    <Route path="/rafflemanagement/:id" element={<RaffleManagementPage />} />
                    <Route path="/sell/:raffleId/:vendorId" element={<SellPage />} />
                    <Route path="/comprar/:raffleId/:vendorId" element={<BuyerPage />} />
                    <Route path="/confirmation" element={<ConfirmationPage />} />
                    <Route path="/webpay" element={<WebpayPage />} />
                  </Routes>
                </main>
                <Footer />
              </ProtectedRoute>
            } />
          </Routes>
          
          {/* Toast Container */}
          <div className="toast-container">
            {toasts.map(toast => (
              <div
                key={toast.id}
                className={`toast-custom toast-${toast.type} toast-show`}
              >
                <div className="toast-header">
                  <i className={`bi ${getToastIcon(toast.type)} me-2`}></i>
                  <strong className="me-auto">{toast.title}</strong>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => removeToast(toast.id)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="toast-body">
                  {toast.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      </RaffleProvider>
    </AuthProvider>
  );
}

function getToastIcon(type: string) {
  const icons = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  };
  return icons[type as keyof typeof icons] || 'bi-info-circle-fill';
}

export default App;
