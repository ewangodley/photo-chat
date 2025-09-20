"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthManager } from "@/lib/auth/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'moderator' | 'admin';
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  fallback 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = AuthManager.isAuthenticated();
      
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      const hasPermission = AuthManager.hasRole(requiredRole);
      
      if (!hasPermission) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}