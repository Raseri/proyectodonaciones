/**
 * NuevaDonacionPage — Formulario para crear una nueva donación.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context-estado-global/AuthContext';
import { donacionesService } from '../../services-datos-mock/donacionesService';
import { organizacionesService } from '../../services-datos-mock/organizacionesService';
import { DONATION_CATEGORIES } from '../../utils-herramientas/constants';

export default function NuevaDonacionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgs = organizacionesService.getActive();

  const [form, setForm] = useState({
    titulo: '', descripcion: '', organizacionId: '', categoria: '', cantidad: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.organizacionId) {
      setError('Selecciona una organización beneficiaria.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = donacionesService.create({
        ...form,
        usuarioId: user.id,
        usuarioNombre: `${user.nombre} ${user.apellido}`,
      });

      if (result.success) {
        navigate('/donaciones');
      } else {
        setError(result.error || 'Error al crear la donación.');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Nueva Donación</h1>
          <p className="page-subtitle">Registra una nueva donación para una organización beneficiaria</p>
        </div>
        <Link to="/donaciones" className="btn btn-secondary">← Volver</Link>
      </div>

      <div className="card" style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="don-titulo">Título de la donación *</label>
            <input id="don-titulo" type="text" className="form-input"
              placeholder="Ej: Ropa de invierno"
              value={form.titulo} onChange={e => update('titulo', e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="don-desc">Descripción *</label>
            <textarea id="don-desc" className="form-textarea"
              placeholder="Describe los artículos que deseas donar..."
              value={form.descripcion} onChange={e => update('descripcion', e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="don-cat">Categoría *</label>
              <select id="don-cat" className="form-select"
                value={form.categoria} onChange={e => update('categoria', e.target.value)} required>
                <option value="">Seleccionar...</option>
                {DONATION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="don-cant">Cantidad *</label>
              <input id="don-cant" type="text" className="form-input"
                placeholder="Ej: 3 cajas, 10 unidades"
                value={form.cantidad} onChange={e => update('cantidad', e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="don-org">Organización beneficiaria *</label>
            <select id="don-org" className="form-select"
              value={form.organizacionId} onChange={e => update('organizacionId', e.target.value)} required>
              <option value="">Seleccionar organización...</option>
              {orgs.map(o => (
                <option key={o.id} value={o.id}>{o.nombre} — {o.categoria}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Link to="/donaciones" className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creando...' : '📦 Crear Donación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
