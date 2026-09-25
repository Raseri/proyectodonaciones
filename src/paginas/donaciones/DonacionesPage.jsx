/**
 * DonacionesPage — Lista de donaciones.
 * USER ve solo las suyas, ADMIN ve todas.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexto/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { donacionesService } from '../../base-de-datos/donacionesService';
import StatusBadge from '../../componentes/ui/StatusBadge';
import Modal from '../../componentes/ui/Modal';
import { DONATION_STATUS, DONATION_STATUS_LABELS } from '../../utilidades/constants';

export default function DonacionesPage() {
  const { user } = useAuth();
  const { isAdmin, canCancel, can, allowedTransitions } = usePermissions();
  const navigate = useNavigate();

  const [donations, setDonations] = useState(() => donacionesService.getAll(user.id, user.role));
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [statusModal, setStatusModal] = useState({ open: false, donation: null });
  const [message, setMessage] = useState('');

  const reload = () => setDonations(donacionesService.getAll(user.id, user.role));

  const filtered = donations.filter(d => {
    if (filterStatus && d.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return d.titulo.toLowerCase().includes(s) ||
        d.organizacionNombre.toLowerCase().includes(s) ||
        d.usuarioNombre.toLowerCase().includes(s);
    }
    return true;
  });

  const handleCancel = (donation) => {
    if (!canCancel(donation.status, donation.usuarioId)) return;
    donacionesService.changeStatus(donation.id, DONATION_STATUS.CANCELADA);
    setMessage('Donación cancelada correctamente.');
    reload();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (donationId) => {
    if (!can('deleteDonations')) return;
    donacionesService.delete(donationId);
    setMessage('Donación eliminada.');
    reload();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleStatusChange = (newStatus) => {
    if (!statusModal.donation) return;
    donacionesService.changeStatus(statusModal.donation.id, newStatus);
    setStatusModal({ open: false, donation: null });
    setMessage(`Estado actualizado a ${DONATION_STATUS_LABELS[newStatus]}.`);
    reload();
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'Todas las Donaciones' : 'Mis Donaciones'}</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Gestión completa de donaciones del sistema' : 'Consulta y gestiona tus donaciones'}
          </p>
        </div>
        {can('createDonation') && (
          <Link to="/donaciones/nueva" className="btn btn-primary">➕ Nueva Donación</Link>
        )}
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>}

      {/* Filtros */}
      <div className="filter-bar">
        <input type="text" className="form-input" placeholder="Buscar donación..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(DONATION_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <p className="empty-state-title">No hay donaciones</p>
            <p className="empty-state-text">
              {search || filterStatus ? 'No se encontraron resultados con los filtros aplicados.' : 'Crea tu primera donación para empezar.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                {isAdmin && <th>Donante</th>}
                <th>Organización</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.titulo}</strong></td>
                  {isAdmin && <td>{d.usuarioNombre}</td>}
                  <td>{d.organizacionNombre}</td>
                  <td>{d.categoria}</td>
                  <td><StatusBadge status={d.status} type="donation" /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                    {new Date(d.fechaCreacion).toLocaleDateString('es-MX')}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/donaciones/${d.id}`)}>
                        👁️ Ver
                      </button>

                      {/* Mapa de rastreo — Visible para todos excepto CANCELADA */}
                      {d.status !== 'CANCELADA' && (
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/donaciones/${d.id}`)}
                          title="Ver mapa de rastreo"
                          style={{ color: d.status === 'EN_TRANSITO' ? '#8b5cf6' : d.status === 'ENTREGADA' ? '#10b981' : d.status === 'ACEPTADA' ? '#3b82f6' : '#f59e0b' }}>
                          🗺️ Mapa
                        </button>
                      )}

                      {/* Cambiar estado — Solo ADMIN */}
                      {can('changeDonationStatus') && allowedTransitions(d.status).length > 0 && (
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => setStatusModal({ open: true, donation: d })}>
                          🔄 Estado
                        </button>
                      )}

                      {/* Cancelar — USER su propia o ADMIN */}
                      {canCancel(d.status, d.usuarioId) && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(d)}>
                          ✕ Cancelar
                        </button>
                      )}

                      {/* Eliminar — Solo ADMIN */}
                      {can('deleteDonations') && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal cambio de estado */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, donation: null })}
        title="Cambiar Estado de Donación"
      >
        {statusModal.donation && (
          <div>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <strong>{statusModal.donation.titulo}</strong><br />
              Estado actual: <StatusBadge status={statusModal.donation.status} type="donation" />
            </p>
            <p style={{ marginBottom: '1rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Selecciona el nuevo estado:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {allowedTransitions(statusModal.donation.status).map(status => (
                <button key={status} className="btn btn-secondary" onClick={() => handleStatusChange(status)}>
                  {DONATION_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
