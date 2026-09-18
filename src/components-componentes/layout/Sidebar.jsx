/**
 * Sidebar — Navegación lateral con opciones condicionales por rol.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context-estado-global/AuthContext';
import { usePermissions } from '../../hooks-personalizados/usePermissions';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { can, isAdmin } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Logo / Título */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">💝</div>
          <div>
            <h2 className="sidebar-title">Donaciones</h2>
            <span className="sidebar-version">v1.0</span>
          </div>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.nombre} {user?.apellido}</span>
            <span className={`badge badge-${user?.role?.toLowerCase()}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <span className="sidebar-section-label">General</span>
            <NavLink to="/dashboard" className="sidebar-link" onClick={onClose}>
              <span className="sidebar-link-icon">📊</span>
              Dashboard
            </NavLink>
            <NavLink to="/perfil" className="sidebar-link" onClick={onClose}>
              <span className="sidebar-link-icon">👤</span>
              Mi Perfil
            </NavLink>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-label">Donaciones</span>
            <NavLink to="/donaciones" className="sidebar-link" onClick={onClose}>
              <span className="sidebar-link-icon">📦</span>
              {isAdmin ? 'Todas las Donaciones' : 'Mis Donaciones'}
            </NavLink>
            {can('createDonation') && (
              <NavLink to="/donaciones/nueva" className="sidebar-link" onClick={onClose}>
                <span className="sidebar-link-icon">➕</span>
                Nueva Donación
              </NavLink>
            )}
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-label">Organizaciones</span>
            <NavLink to="/organizaciones" className="sidebar-link" onClick={onClose}>
              <span className="sidebar-link-icon">🏢</span>
              Organizaciones
            </NavLink>
          </div>

          {/* Sección Admin — Solo visible para ADMIN */}
          {isAdmin && (
            <div className="sidebar-section">
              <span className="sidebar-section-label">Administración</span>
              {can('viewOtherUsers') && (
                <NavLink to="/admin/usuarios" className="sidebar-link" onClick={onClose}>
                  <span className="sidebar-link-icon">👥</span>
                  Gestión de Usuarios
                </NavLink>
              )}
              {can('createOrganization') && (
                <NavLink to="/admin/organizaciones" className="sidebar-link" onClick={onClose}>
                  <span className="sidebar-link-icon">🏗️</span>
                  Gestión de Organizaciones
                </NavLink>
              )}
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-link-icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
