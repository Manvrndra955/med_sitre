import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchMe } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('medstore_token');
      if (token) {
        try {
          const u = await fetchMe();
          setUser(u);
        } catch (e) {
          console.error(e);
          localStorage.removeItem('medstore_token');
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('medstore_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('medstore_token');
    setUser(null);
  };

  const updateUserAddress = (newAddress) => {
    if (user) {
      setUser({ ...user, address: newAddress });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserAddress, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
