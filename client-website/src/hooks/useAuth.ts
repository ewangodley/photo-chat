"use client";

import { useState, useEffect } from 'react';
import { AuthManager, authApi } from '@/lib/auth/auth';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userData = AuthManager.getUser();
      const isAuthenticated = AuthManager.isAuthenticated();
      
      if (isAuthenticated && userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response.success) {
        const userData = AuthManager.getUser();
        setUser(userData);
        return { success: true };
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthManager.clearAuth();
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      AuthManager.setUser(updatedUser);
      setUser(updatedUser);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser
  };
}