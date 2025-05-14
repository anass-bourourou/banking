
import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  children?: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuth();

  // Vérifier l'authentification à chaque rendu du composant
  useEffect(() => {
    // Ne vérifie que si on n'est pas déjà en train de charger
    if (!isLoading) {
      checkAuthStatus();
    }
  }, [checkAuthStatus, isLoading]);

  // Show loading state or spinner if auth is still being checked
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-bank-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
