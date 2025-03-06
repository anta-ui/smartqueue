// contexts/SuperAdminContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const SuperAdminContext = createContext();

export function SuperAdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification au chargement
    const token = localStorage.getItem('super_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('super_admin_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('super_admin_token');
    setIsAuthenticated(false);
  };

  return (
    <SuperAdminContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export const useSuperAdmin = () => useContext(SuperAdminContext);