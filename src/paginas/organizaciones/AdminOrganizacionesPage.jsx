/**
 * AdminOrganizacionesPage — Gestión CRUD de organizaciones (solo ADMIN).
 */

import { useState } from 'react';
import { organizacionesService } from '../../base-de-datos/organizacionesService';
import StatusBadge from '../../componentes/ui/StatusBadge';
import Modal from '../../componentes/ui/Modal';

const emptyForm = { nombre: '', descripcion: '', email: '', telefono: '', direccion: '', categoria: '' };

export default function AdminOrganizacionesPage() {
  const [orgs, setOrgs] = useState(() => organizacionesService.getAll());
  const [modal, setModal] = useState({ open: false, mode: 'create', org: null });
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const reload = () => setOrgs(organizacionesService.getAll());
  const update = (field, value) => setForm({ ...form, [field]: value });
  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ open: true, mode: 'create', org: null });
  };

  const openEdit = (org) => {
    setForm({ nombre: org.nombre, descripcion: org.descripcion, email: org.email, telefono: org.telefono, direccion: org.direccion, categoria: org.categoria });
    setModal({ open: true, mode: 'edit', org });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modal.mode === 'create') {
      organizacionesService.create(form);
      showMsg('Organización creada correctamente.');
    } else {
      organizacionesService.update(modal.org.id, form);
      showMsg('Organización actualizada.');
    }
    setModal({ open: false, mode: 'create', org: null });
    reload();
  };

  const handleToggle = (orgId) => {
    organizacionesService.toggleStatus(orgId);
    showMsg('Estado actualizado.');
    reload();
  };

  const handleDelete = (orgId) => {
    organizacionesService.delete(orgId);
    showMsg('Organización eliminada.');
    reload();
  };

  const filtered = orgs.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.nombre.toLowerCase().includes(s) || o.categoria.toLowerCase().includes(s);
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Organizaciones</h1>
          <p className="page-subtitle">Administra las organizaciones beneficiarias del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>➕ Nueva Organización</button>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>}

      <div className="filter-bar">
        <input type="text" className="form-input" placeholder="Buscar..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(org => (
              <tr key={org.id}>
                <td><strong>{org.nombre}</strong></td>
                <td>{org.categoria}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{org.email}</td>
                <td><StatusBadge status={org.status} type="organization" /></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(org)}>✏️ Editar</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(org.id)}>
                      {org.status === 'ACTIVA' ? '🔒 Desactivar' : '🔓 Activar'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(org.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal crear/editar */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', org: null })}
        title={modal.mode === 'create' ? 'Nueva Organización' : 'Editar Organización'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input type="text" className="form-input" value={form.nombre} onChange={e => update('nombre', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción *</label>
            <textarea className="form-textarea" value={form.descripcion} onChange={e => update('descripcion', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input type="text" className="form-input" value={form.telefono} onChange={e => update('telefono', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Dirección *</label>
            <input type="text" className="form-input" value={form.direccion} onChange={e => update('direccion', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Categoría *</label>
            <input type="text" className="form-input" value={form.categoria} onChange={e => update('categoria', e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal({ open: false, mode: 'create', org: null })}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {modal.mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
