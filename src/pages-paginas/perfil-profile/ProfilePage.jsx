/**
 * ProfilePage — Ver y editar el perfil del usuario actual.
 */

import { useState } from 'react';
import { useAuth } from '../../context-estado-global/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    const result = updateProfile(form);
    if (result.success) {
      setMessage('Perfil actualizado correctamente.');
      setEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleCancel = () => {
    setForm({
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono || '',
      direccion: user.direccion || '',
    });
    setEditing(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-subtitle">Consulta y edita tu información personal</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Editar</button>
        )}
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="card" style={{ maxWidth: '600px' }}>
        {/* Avatar y rol */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--accent-gradient)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: '#fff', flexShrink: 0,
            boxShadow: 'var(--accent-glow)'
          }}>
            {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
              {user?.nombre} {user?.apellido}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className={`badge badge-${user?.role?.toLowerCase()}`}>{user?.role}</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Miembro desde {new Date(user?.fechaCreacion).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-input" value={form.nombre}
                  onChange={e => update('nombre', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input type="text" className="form-input" value={form.apellido}
                  onChange={e => update('apellido', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input type="email" className="form-input" value={user?.email} disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <span className="form-error" style={{ color: 'var(--text-muted)' }}>El email no se puede cambiar.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input type="text" className="form-input" value={form.telefono}
                  onChange={e => update('telefono', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input type="text" className="form-input" value={form.direccion}
                  onChange={e => update('direccion', e.target.value)} />
              </div>
            </div>

            {/* Nota sobre contraseña */}
            <div className="alert alert-warning">
              ⚠️ El cambio de contraseña estará disponible cuando exista backend.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
              <button type="submit" className="btn btn-primary">💾 Guardar Cambios</button>
            </div>
          </form>
        ) : (
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Nombre</span>
              <span className="detail-value">{user?.nombre}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Apellido</span>
              <span className="detail-value">{user?.apellido}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Teléfono</span>
              <span className="detail-value">{user?.telefono || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Dirección</span>
              <span className="detail-value">{user?.direccion || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Rol</span>
              <span className="detail-value">{user?.role}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
