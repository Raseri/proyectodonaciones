/**
 * Contexto de Autenticación — Estado global de sesión y permisos.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../base-de-datos/authService';
import { initializeMockData } from '../base-de-datos/mockData';
import { getPermissions } from '../utilidades/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar datos mock y restaurar sesión
  useEffect(() => {
    initializeMockData();
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    const result = authService.login(email, password);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const register = (userData) => {
    const result = authService.register(userData);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (updates) => {
    if (!user) return { success: false, error: 'No autenticado.' };
    const result = authService.updateProfile(user.id, updates);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const userPermissions = user ? getPermissions(user.role) : {};

  const value = {
    user,
    isAuthenticated,
    isLoading,
    userPermissions,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
