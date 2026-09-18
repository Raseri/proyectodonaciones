/**
 * Header — Barra superior con selector de tema global, saludo y menú móvil.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexto/AuthContext';
import './Header.css';

export default function Header({ onToggleSidebar }) {
  const { user } = useAuth();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('app_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header className="header">
      <button className="header-menu-btn" onClick={onToggleSidebar} aria-label="Abrir menú">
        ☰
      </button>

      <div className="header-spacer" />

      <div className="header-actions">
        {/* Selector Global de Tema para toda la aplicación */}
        <button
          type="button"
          className="header-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          aria-label="Cambiar tema global"
        >
          <span className="header-theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="header-theme-label">{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>

        <div className="header-user">
          <span className="header-greeting">
            Hola, <strong>{user?.nombre}</strong>
          </span>
          <div className="header-avatar" title={`${user?.nombre} ${user?.apellido}`}>
            {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
