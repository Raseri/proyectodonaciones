/**
 * Header — Barra superior con título y botón de menú móvil.
 */

import { useAuth } from '../../context-estado-global/AuthContext';
import './Header.css';

export default function Header({ onToggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="header">
      <button className="header-menu-btn" onClick={onToggleSidebar} aria-label="Abrir menú">
        ☰
      </button>
      <div className="header-spacer" />
      <div className="header-user">
        <span className="header-greeting">
          Hola, <strong>{user?.nombre}</strong>
        </span>
        <div className="header-avatar">
          {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
        </div>
      </div>
    </header>
  );
}
