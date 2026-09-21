/**
 * Contexto de Autenticación — Estado global de sesión y permisos.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../base-de-datos/authService';
import { getPermissions } from '../utilidades/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then(savedUser => {
      if (savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
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

  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'No autenticado.' };
    const result = await authService.updateProfile(user.id, updates);
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
