import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api/config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('krishi_demo_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('krishi_demo_token') || null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Set default axios header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const loginAs = async (role = 'FARMER') => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await axios.post(`${API_URL}/demo/login`, { role });
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setUser(newUser);
        setToken(newToken);
        localStorage.setItem('krishi_demo_user', JSON.stringify(newUser));
        localStorage.setItem('krishi_demo_token', newToken);
        return newUser;
      }
    } catch (err) {
      setAuthError(err.response?.data?.error?.message || 'Login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('krishi_demo_user');
    localStorage.removeItem('krishi_demo_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      authError,
      loginAs,
      loginAsRole: loginAs,
      logout,
      isFarmer: user?.role === 'FARMER',
      isOfficer: user?.role === 'OFFICER',
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
