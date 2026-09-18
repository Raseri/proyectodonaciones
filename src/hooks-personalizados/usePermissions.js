/**
 * Hook personalizado para consultar permisos del usuario actual.
 */

import { useAuth } from '../context-estado-global/AuthContext';
import { hasPermission, canCancelDonation, getAllowedStatusTransitions } from '../utils-herramientas/permissions';

export function usePermissions() {
  const { user, userPermissions } = useAuth();

  const role = user?.role || 'USER';

  return {
    permissions: userPermissions,

    /** Verifica si el usuario tiene un permiso */
    can: (permission) => hasPermission(role, permission),

    /** Verifica si puede cancelar una donación específica */
    canCancel: (donationStatus, donationUserId) =>
      canCancelDonation(role, donationStatus, donationUserId, user?.id),

    /** Obtiene las transiciones de estado disponibles */
    allowedTransitions: (currentStatus) =>
      getAllowedStatusTransitions(role, currentStatus),

    /** Verifica si es admin */
    isAdmin: role === 'ADMIN',

    /** Verifica si es el propietario de un recurso */
    isOwner: (resourceUserId) => user?.id === resourceUserId,
  };
}
