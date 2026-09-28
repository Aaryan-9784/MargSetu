import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getMeApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('roadsetu_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('roadsetu_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('roadsetu_token');
      if (savedToken) {
        try {
          const res = await getMeApi();
          setUser(res.user);
          localStorage.setItem('roadsetu_user', JSON.stringify(res.user));
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const data = await loginApi({ email, password });
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('roadsetu_token', data.token);
      localStorage.setItem('roadsetu_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('roadsetu_token');
    localStorage.removeItem('roadsetu_user');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isInspector = user?.role === 'FIELD_INSPECTOR';
  const isOfficer = user?.role === 'MAINTENANCE_OFFICER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isInspector,
        isOfficer,
        role: user?.role,
      }}
    >
      {children}
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
