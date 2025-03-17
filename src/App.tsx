
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Accounts from "./pages/Accounts";
import Transfers from "./pages/Transfers";
import Beneficiaries from "./pages/Beneficiaries";
import Payments from "./pages/Payments";
import Statements from "./pages/Statements";
import Receipts from "./pages/Receipts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Initialize the query client with some default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // disable refetching on window focus by default
      retry: 1, // only retry failed queries once
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/accounts" element={
              <ProtectedRoute>
                <Accounts />
              </ProtectedRoute>
            } />
            
            <Route path="/transfers" element={
              <ProtectedRoute>
                <Transfers />
              </ProtectedRoute>
            } />
            
            <Route path="/beneficiaries" element={
              <ProtectedRoute>
                <Beneficiaries />
              </ProtectedRoute>
            } />
            
            <Route path="/payments" element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            } />
            
            <Route path="/statements" element={
              <ProtectedRoute>
                <Statements />
              </ProtectedRoute>
            } />
            
            <Route path="/receipts" element={
              <ProtectedRoute>
                <Receipts />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
