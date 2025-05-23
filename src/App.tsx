
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import CreateAccount from '@/pages/CreateAccount';
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
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import MoroccanBills from '@/pages/MoroccanBills';
import Receipts from '@/pages/Receipts';
import Complaints from '@/pages/Complaints';
import Notifications from '@/pages/Notifications';
import Statements from '@/pages/Statements';
import Payments from '@/pages/Payments';
import Scan from '@/pages/Scan';
import SessionTimeoutComponent from '@/components/auth/SessionTimeoutComponent';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="bankwise-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SessionTimeoutComponent />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
              <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
              <Route path="/beneficiaries" element={<ProtectedRoute><Beneficiaries /></ProtectedRoute>} />
              <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/statements" element={<ProtectedRoute><Statements /></ProtectedRoute>} />
              <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
              <Route path="/e-documents" element={<ProtectedRoute><EDocuments /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/moroccan-bills" element={<ProtectedRoute><MoroccanBills /></ProtectedRoute>} />
              <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
              <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
