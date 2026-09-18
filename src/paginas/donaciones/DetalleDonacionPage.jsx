/**
 * DetalleDonacionPage — Detalle de una donación con acciones según permisos.
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexto/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { donacionesService } from '../../base-de-datos/donacionesService';
import StatusBadge from '../../componentes/ui/StatusBadge';
import { DONATION_STATUS, DONATION_STATUS_LABELS } from '../../utilidades/constants';

export default function DetalleDonacionPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isAdmin, isOwner, canCancel, can, allowedTransitions } = usePermissions();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const d = donacionesService.getById(id);
    if (!d) {
      navigate('/donaciones');
      return;
    }
    // USER solo puede ver sus propias donaciones
    if (!isAdmin && d.usuarioId !== user.id) {
      navigate('/donaciones');
      return;
    }
    setDonation(d);
  }, [id]);

  if (!donation) return null;

  const handleStatusChange = (newStatus) => {
    donacionesService.changeStatus(donation.id, newStatus);
    setDonation(donacionesService.getById(donation.id));
    setMessage(`Estado actualizado a ${DONATION_STATUS_LABELS[newStatus]}.`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancel = () => {
    donacionesService.changeStatus(donation.id, DONATION_STATUS.CANCELADA);
    setDonation(donacionesService.getById(donation.id));
    setMessage('Donación cancelada.');
    setTimeout(() => setMessage(''), 3000);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Detalle de Donación</h1>
          <p className="page-subtitle">ID: {donation.id}</p>
        </div>
        <Link to="/donaciones" className="btn btn-secondary">← Volver</Link>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>}

      <div className="card" style={{ maxWidth: '720px' }}>
        {/* Header con título y estado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '0.25rem' }}>
              {donation.titulo}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              {donation.descripcion}
            </p>
          </div>
          <StatusBadge status={donation.status} type="donation" />
        </div>

        {/* Detalles */}
        <div className="detail-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="detail-item">
            <span className="detail-label">Donante</span>
            <span className="detail-value">{donation.usuarioNombre}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Organización</span>
            <span className="detail-value">{donation.organizacionNombre}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Categoría</span>
            <span className="detail-value">{donation.categoria}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Cantidad</span>
            <span className="detail-value">{donation.cantidad}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fecha de Creación</span>
            <span className="detail-value">{formatDate(donation.fechaCreacion)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Última Actualización</span>
            <span className="detail-value">{formatDate(donation.fechaActualizacion)}</span>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Cambiar estado — Solo ADMIN */}
          {can('changeDonationStatus') && allowedTransitions(donation.status).map(status => (
            <button key={status} className="btn btn-secondary btn-sm" onClick={() => handleStatusChange(status)}>
              → {DONATION_STATUS_LABELS[status]}
            </button>
          ))}

          {/* Cancelar */}
          {canCancel(donation.status, donation.usuarioId) && (
            <button className="btn btn-danger btn-sm" onClick={handleCancel}>
              ✕ Cancelar Donación
            </button>
          )}

          {/* Eliminar — Solo ADMIN */}
          {can('deleteDonations') && (
            <button className="btn btn-danger btn-sm" onClick={() => {
              donacionesService.delete(donation.id);
              navigate('/donaciones');
            }}>
              🗑️ Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
