'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on client mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken =
          localStorage.getItem('accessToken') || localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
          setAccessToken(storedToken);
          setRefreshToken(storedRefreshToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }

          // Verify token validity with backend /api/auth/me
          try {
            const res = await authApi.getMe();
            if (res.data) {
              setUser(res.data);
              localStorage.setItem('user', JSON.stringify(res.data));
            }
          } catch (err) {
            console.warn('[Auth] Session validation failed:', err.message);
          }
        }
      } catch (err) {
        console.error('[Auth] Failed to initialize auth state:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const {
        user: loggedInUser,
        accessToken: accessTok,
        token: legacyTok,
        refreshToken: refreshTok,
      } = response.data;

      const tokenToSave = accessTok || legacyTok;

      setAccessToken(tokenToSave);
      setRefreshToken(refreshTok);
      setUser(loggedInUser);

      localStorage.setItem('accessToken', tokenToSave);
      localStorage.setItem('token', tokenToSave);
      if (refreshTok) {
        localStorage.setItem('refreshToken', refreshTok);
      }
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      return { success: true, user: loggedInUser };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed. Please check your credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Signup handler (strictly creates citizen)
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await authApi.signup({ name, email, password });
      const {
        user: newUser,
        accessToken: accessTok,
        token: legacyTok,
        refreshToken: refreshTok,
      } = response.data;

      const tokenToSave = accessTok || legacyTok;

      setAccessToken(tokenToSave);
      setRefreshToken(refreshTok);
      setUser(newUser);

      localStorage.setItem('accessToken', tokenToSave);
      localStorage.setItem('token', tokenToSave);
      if (refreshTok) {
        localStorage.setItem('refreshToken', refreshTok);
      }
      localStorage.setItem('user', JSON.stringify(newUser));

      return { success: true, user: newUser };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Signup failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Update Profile handler
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await authApi.updateProfile(profileData);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update profile. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    token: accessToken,
    accessToken,
    refreshToken,
    loading,
    isAuthenticated: !!accessToken && !!user,
    isOfficer: user?.role === 'officer',
    isCitizen: user?.role === 'citizen',
    isTechnician: user?.role === 'technician',
    isSuperOfficer: user?.role === 'officer' && user?.isSuperOfficer === true,
    login,
    signup,
    updateProfile,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
