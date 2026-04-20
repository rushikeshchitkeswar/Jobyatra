import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUser, clearAuthData, setUser } from '../utils/authUtils';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setAuthState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state by verifying session cookie on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        // First check if we have user in localStorage for immediate UI (optional but good for UX)
        const savedUser = getUser();
        if (savedUser) {
          setAuthState(savedUser);
          setIsAuthenticated(true);
        }

        // Always verify with backend
        const userData = await authService.getMe();
        if (userData) {
          // console.log(userData, "userData");
          setAuthState(userData);
          setIsAuthenticated(true);
          // console.log('[AuthContext] Session verified via cookie:', userData);
        } else {
          setAuthState(null);
          setIsAuthenticated(false);
          // console.log('[AuthContext] No active session found');
        }
      } catch (err) {
        console.error('[AuthContext] Auth initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      if (data && data.success) {
        setAuthState(data.user || null);
        setIsAuthenticated(true);
        // console.log('[AuthContext] Login successful, state updated');
        return data;
      }
      throw new Error(data.message || 'Invalid response from server');
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);

      // Recruiters are pending approval — do NOT auto-login them.
      // Only auto-login candidates and other non-recruiter roles.
      if (data.success && data.user && !data.recruiterPending) {
        setAuthState(data.user);
        setIsAuthenticated(true);
      }

      return data;
    } catch (error) {
      console.error('[AuthContext] Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setAuthState(null);
      setIsAuthenticated(false);
      // console.log('[AuthContext] Logout successful, state cleared');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    }
  };

  // Update specific fields in local user state for real-time sync
  const updateUser = (updates) => {
    setAuthState(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...updates };
      // Sync with localStorage so it persists across refreshes
      setUser(newUser);
      return newUser;
    });
  };

  // Refresh user data manually
  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      if (userData) {
        setAuthState(userData);
      }
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, register, refreshUser, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
