/**
 * AppRoutes — Definición de todas las rutas de la aplicación.
 *
 * IMPORTANTE:
 * Los permisos definidos en el frontend NO constituyen un mecanismo de seguridad.
 * Cuando exista backend, cada endpoint deberá validar el JWT y los permisos/rol
 * del usuario antes de ejecutar cualquier operación.
 */

import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../components-componentes/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Páginas — Autenticación
import LoginPage from '../pages-paginas/auth-autenticacion/LoginPage';
import RegisterPage from '../pages-paginas/auth-autenticacion/RegisterPage';

// Páginas — Dashboard
import DashboardPage from '../pages-paginas/dashboard-panel/DashboardPage';

// Páginas — Donaciones
import DonacionesPage from '../pages-paginas/donaciones-donations/DonacionesPage';
import NuevaDonacionPage from '../pages-paginas/donaciones-donations/NuevaDonacionPage';
import DetalleDonacionPage from '../pages-paginas/donaciones-donations/DetalleDonacionPage';

// Páginas — Organizaciones
import OrganizacionesPage from '../pages-paginas/organizaciones-organizations/OrganizacionesPage';
import AdminOrganizacionesPage from '../pages-paginas/organizaciones-organizations/AdminOrganizacionesPage';

// Páginas — Usuarios (Admin)
import UsuariosPage from '../pages-paginas/usuarios-users/UsuariosPage';

// Páginas — Perfil
import ProfilePage from '../pages-paginas/perfil-profile/ProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas protegidas — Dentro del layout principal */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        {/* Dashboard — USER y ADMIN */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Perfil — USER y ADMIN */}
        <Route path="/perfil" element={<ProfilePage />} />

        {/* Donaciones — USER y ADMIN */}
        <Route path="/donaciones" element={<DonacionesPage />} />
        <Route path="/donaciones/nueva" element={<NuevaDonacionPage />} />
        <Route path="/donaciones/:id" element={<DetalleDonacionPage />} />

        {/* Organizaciones — Consulta pública */}
        <Route path="/organizaciones" element={<OrganizacionesPage />} />

        {/* ═══════════════════════════════════════════
            RUTAS ADMINISTRATIVAS — Solo ADMIN
            Un USER NO puede acceder escribiendo la URL.
           ═══════════════════════════════════════════ */}
        <Route path="/admin/usuarios" element={
          <ProtectedRoute requiredPermission="accessAdminRoutes">
            <UsuariosPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/organizaciones" element={
          <ProtectedRoute requiredPermission="accessAdminRoutes">
            <AdminOrganizacionesPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Redirigir raíz y rutas no encontradas */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
