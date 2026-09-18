/**
 * UsuariosPage — Gestión de usuarios (solo ADMIN).
 */

import { useState } from 'react';
import { useAuth } from '../../contexto/AuthContext';
import { usuariosService } from '../../base-de-datos/usuariosService';
import StatusBadge from '../../componentes/ui/StatusBadge';
import Modal from '../../componentes/ui/Modal';
import { ROLES } from '../../utilidades/constants';

export default function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState(() => usuariosService.getAll());
  const [modal, setModal] = useState({ open: false, user: null });
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const reload = () => setUsers(usuariosService.getAll());
  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const stats = usuariosService.getStats();

  const openEdit = (u) => {
    setForm({ nombre: u.nombre, apellido: u.apellido, email: u.email, telefono: u.telefono, direccion: u.direccion });
    setModal({ open: true, user: u });
  };

  const handleSave = (e) => {
    e.preventDefault();
    usuariosService.update(modal.user.id, form);
    showMsg('Usuario actualizado.');
    setModal({ open: false, user: null });
    reload();
  };

  const handleToggle = (userId) => {
    // No permitir desactivarse a sí mismo
    if (userId === currentUser.id) return;
    usuariosService.toggleStatus(userId);
    showMsg('Estado del usuario actualizado.');
    reload();
  };

  const handleRoleChange = (userId, newRole) => {
    if (userId === currentUser.id) return;
    usuariosService.changeRole(userId, newRole);
    showMsg(`Rol cambiado a ${newRole}.`);
    reload();
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.nombre.toLowerCase().includes(s) ||
      u.apellido.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s);
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Administra los usuarios del sistema</p>
        </div>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>}

      {/* Stats */}
      <div className="grid-stats" style={{ marginBottom: '1.5rem' }}>
        <div className="stats-card">
          <div className="stats-card-icon" style={{ background: 'rgba(102,126,234,0.12)', color: 'var(--accent-primary)' }}>👥</div>
          <div className="stats-card-value">{stats.total}</div>
          <div className="stats-card-label">Total Usuarios</div>
        </div>
        <div className="stats-card">
          <div className="stats-card-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>✅</div>
          <div className="stats-card-value">{stats.activos}</div>
          <div className="stats-card-label">Activos</div>
        </div>
        <div className="stats-card">
          <div className="stats-card-icon" style={{ background: 'var(--color-purple-bg)', color: 'var(--color-purple)' }}>🛡️</div>
          <div className="stats-card-value">{stats.admins}</div>
          <div className="stats-card-label">Administradores</div>
        </div>
        <div className="stats-card">
          <div className="stats-card-icon" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>👤</div>
          <div className="stats-card-value">{stats.users}</div>
          <div className="stats-card-label">Usuarios</div>
        </div>
      </div>

      <div className="filter-bar">
        <input type="text" className="form-input" placeholder="Buscar usuario..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0
                    }}>
                      {u.nombre.charAt(0)}{u.apellido.charAt(0)}
                    </div>
                    <strong>{u.nombre} {u.apellido}</strong>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td><StatusBadge status={u.role} type="role" /></td>
                <td><StatusBadge status={u.activo} type="user-status" /></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                  {new Date(u.fechaCreacion).toLocaleDateString('es-MX')}
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>✏️ Editar</button>

                    {u.id !== currentUser.id && (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(u.id)}>
                          {u.activo ? '🔒' : '🔓'}
                        </button>
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => handleRoleChange(u.id, u.role === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN)}>
                          {u.role === ROLES.ADMIN ? '👤 → USER' : '🛡️ → ADMIN'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal editar */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, user: null })}
        title="Editar Usuario"
      >
        {modal.user && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-input" value={form.nombre || ''}
                  onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input type="text" className="form-input" value={form.apellido || ''}
                  onChange={e => setForm({ ...form, apellido: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email || ''}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input type="text" className="form-input" value={form.telefono || ''}
                onChange={e => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input type="text" className="form-input" value={form.direccion || ''}
                onChange={e => setForm({ ...form, direccion: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModal({ open: false, user: null })}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
