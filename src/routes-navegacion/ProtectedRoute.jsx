/**
 * ProtectedRoute — Guardia de ruta por autenticación y permisos.
 *
 * IMPORTANTE:
 * Los permisos definidos en el frontend NO constituyen un mecanismo de seguridad.
 * Cuando exista backend, cada endpoint deberá validar el JWT y los permisos/rol
 * del usuario antes de ejecutar cualquier operación.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context-estado-global/AuthContext';
import { hasPermission } from '../utils-herramientas/permissions';

/**
 * @param {string} requiredPermission - Permiso requerido para acceder a la ruta (opcional)
 * @param {string} requiredRole - Rol exacto requerido (opcional)
 */
export default function ProtectedRoute({ children, requiredPermission, requiredRole }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si se requiere un permiso específico
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
