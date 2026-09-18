/**
 * StatusBadge — Badge visual para estados de donación, organización y roles.
 */

import { DONATION_STATUS_LABELS } from '../../utils-herramientas/constants';

export default function StatusBadge({ status, type = 'donation' }) {
  const getLabel = () => {
    if (type === 'donation') {
      return DONATION_STATUS_LABELS[status] || status;
    }
    if (type === 'organization') {
      return status === 'ACTIVA' ? 'Activa' : 'Inactiva';
    }
    if (type === 'role') {
      return status;
    }
    if (type === 'user-status') {
      return status ? 'Activo' : 'Inactivo';
    }
    return status;
  };

  const getClass = () => {
    if (type === 'donation') {
      return `badge badge-${status?.toLowerCase()}`;
    }
    if (type === 'organization') {
      return `badge badge-${status?.toLowerCase()}`;
    }
    if (type === 'role') {
      return `badge badge-${status?.toLowerCase()}`;
    }
    if (type === 'user-status') {
      return `badge ${status ? 'badge-activa' : 'badge-inactiva'}`;
    }
    return 'badge';
  };

  const showDot = type === 'donation' && (status === 'PENDIENTE' || status === 'EN_TRANSITO');

  return (
    <span className={getClass()}>
      {showDot && <span className="badge-dot" />}
      {getLabel()}
    </span>
  );
}
