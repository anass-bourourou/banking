
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Index from '@/pages/Index';
import Accounts from '@/pages/Accounts';
import Transfers from '@/pages/Transfers';
import Beneficiaries from '@/pages/Beneficiaries';
import Dashboard from '@/pages/Dashboard';
import Bills from '@/pages/Bills';
import EDocuments from '@/pages/EDocuments';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import MoroccanBills from '@/pages/MoroccanBills';
import Receipts from '@/pages/Receipts';
import Complaints from '@/pages/Complaints';
import Notifications from '@/pages/Notifications';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const SessionTimeout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const timeoutDuration = 20 * 60 * 1000; // 20 minutes in milliseconds

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > timeoutDuration) {
        logout();
        navigate('/login');
        toast.error("Session expirée", {
          description: "Votre session a expiré en raison d'inactivité. Veuillez vous reconnecter."
        });
      }
    }, 60000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(intervalId);
    };
  }, [isAuthenticated, lastActivity, logout, navigate]);

  return null;
};

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="bankwise-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
              <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
              <Route path="/beneficiaries" element={<ProtectedRoute><Beneficiaries /></ProtectedRoute>} />
              <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
              <Route path="/e-documents" element={<ProtectedRoute><EDocuments /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/moroccan-bills" element={<ProtectedRoute><MoroccanBills /></ProtectedRoute>} />
              <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
              <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SessionTimeout />
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
