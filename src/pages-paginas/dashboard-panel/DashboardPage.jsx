/**
 * DashboardPage — Panel principal.
 * Muestra dashboard personal (USER) o administrativo (ADMIN) según el rol.
 */

import { useAuth } from '../../context-estado-global/AuthContext';
import { usePermissions } from '../../hooks-personalizados/usePermissions';
import { donacionesService } from '../../services-datos-mock/donacionesService';
import { organizacionesService } from '../../services-datos-mock/organizacionesService';
import { usuariosService } from '../../services-datos-mock/usuariosService';
import StatusBadge from '../../components-componentes/ui/StatusBadge';
import { DONATION_STATUS_LABELS } from '../../utils-herramientas/constants';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();

  const donationStats = donacionesService.getStats(user.id, user.role);
  const donations = donacionesService.getAll(user.id, user.role);
  const recentDonations = [...donations]
    .sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion))
    .slice(0, 5);

  const orgs = organizacionesService.getActive();

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isAdmin ? 'Dashboard Administrativo' : 'Mi Dashboard'}
          </h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'Resumen general del sistema de donaciones'
              : 'Resumen de tu actividad de donaciones'
            }
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-stats">
        {isAdmin && (
          <>
            <DashboardStatCard icon="👥" value={usuariosService.getStats().total}
              label="Total Usuarios" color="var(--color-info)" />
            <DashboardStatCard icon="🏢" value={orgs.length}
              label="Organizaciones Activas" color="var(--color-purple)" />
          </>
        )}

        <DashboardStatCard icon="📦" value={donationStats.total}
          label={isAdmin ? 'Total Donaciones' : 'Mis Donaciones'} color="var(--accent-primary)" />
        <DashboardStatCard icon="⏳" value={donationStats.pendientes}
          label="Pendientes" color="var(--color-warning)" />
        {isAdmin && (
          <>
            <DashboardStatCard icon="✅" value={donationStats.aceptadas}
              label="Aceptadas" color="var(--color-info)" />
            <DashboardStatCard icon="🚚" value={donationStats.enTransito}
              label="En Tránsito" color="var(--color-purple)" />
          </>
        )}
        <DashboardStatCard icon="🎉" value={donationStats.entregadas}
          label="Entregadas" color="var(--color-success)" />
        {isAdmin && (
          <DashboardStatCard icon="❌" value={donationStats.canceladas}
            label="Canceladas" color="var(--color-danger)" />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Actividad Reciente */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              {isAdmin ? 'Actividad General' : 'Actividad Reciente'}
            </h3>
          </div>
          {recentDonations.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📭</span>
              <p className="empty-state-title">Sin actividad</p>
              <p className="empty-state-text">No hay donaciones registradas aún.</p>
            </div>
          ) : (
            <div className="activity-list">
              {recentDonations.map((d, i) => (
                <div key={d.id} className="activity-item" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="activity-icon">📦</div>
                  <div className="activity-info">
                    <span className="activity-title">{d.titulo}</span>
                    <span className="activity-meta">
                      {isAdmin && <span>{d.usuarioNombre} → </span>}
                      {d.organizacionNombre}
                    </span>
                  </div>
                  <StatusBadge status={d.status} type="donation" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Organizaciones */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Organizaciones Disponibles</h3>
          </div>
          <div className="org-list">
            {orgs.slice(0, 5).map((org, i) => (
              <div key={org.id} className="org-item" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="org-icon">🏢</div>
                <div className="org-info">
                  <span className="org-name">{org.nombre}</span>
                  <span className="org-category">{org.categoria}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardStatCard({ icon, value, label, color }) {
  return (
    <div className="stats-card">
      <div className="stats-card-icon" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div className="stats-card-value">{value}</div>
      <div className="stats-card-label">{label}</div>
    </div>
  );
}
