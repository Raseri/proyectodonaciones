// ============================================================
// IMPORTANTE:
// Los permisos definidos en el frontend NO constituyen un mecanismo de seguridad.
// Cuando exista backend, cada endpoint deberá validar el JWT y los permisos/rol
// del usuario antes de ejecutar cualquier operación.
// ============================================================

import { ROLES, DONATION_STATUS } from './constants';

/**
 * Permisos del rol USER
 */
export const USER_PERMISSIONS = {
  // Autenticación
  register: true,
  login: true,
  logout: true,

  // Perfil
  viewOwnProfile: true,
  editOwnProfile: true,

  // Usuarios
  viewOtherUsers: false,
  editOtherUsers: false,
  changeRoles: false,
  toggleUserStatus: false,

  // Donaciones
  createDonation: true,
  viewOwnDonations: true,
  viewAllDonations: false,
  editOwnDonation: 'limited',
  editOtherDonations: false,
  changeDonationStatus: false,
  cancelOwnDonation: true,
  acceptDonation: false,
  markInTransit: false,
  markDelivered: false,
  deleteDonations: false,

  // Organizaciones
  viewOrganizations: true,
  createOrganization: false,
  editOrganization: false,
  deleteOrganization: false,

  // Dashboard
  viewPersonalDashboard: true,
  viewAdminDashboard: false,

  // Navegación
  accessAdminRoutes: false,
};

/**
 * Permisos del rol ADMIN
 */
export const ADMIN_PERMISSIONS = {
  // Autenticación
  register: true,
  login: true,
  logout: true,

  // Perfil
  viewOwnProfile: true,
  editOwnProfile: true,

  // Usuarios
  viewOtherUsers: true,
  editOtherUsers: true,
  changeRoles: true,
  toggleUserStatus: true,

  // Donaciones
  createDonation: true,
  viewOwnDonations: true,
  viewAllDonations: true,
  editOwnDonation: true,
  editOtherDonations: true,
  changeDonationStatus: true,
  cancelOwnDonation: true,
  acceptDonation: true,
  markInTransit: true,
  markDelivered: true,
  deleteDonations: true,

  // Organizaciones
  viewOrganizations: true,
  createOrganization: true,
  editOrganization: true,
  deleteOrganization: true,

  // Dashboard
  viewPersonalDashboard: true,
  viewAdminDashboard: true,

  // Navegación
  accessAdminRoutes: true,
};

/**
 * Obtiene los permisos según el rol del usuario.
 */
export function getPermissions(role) {
  switch (role) {
    case ROLES.ADMIN:
      return ADMIN_PERMISSIONS;
    case ROLES.USER:
    default:
      return USER_PERMISSIONS;
  }
}

/**
 * Verifica si un rol tiene un permiso específico.
 */
export function hasPermission(role, permission) {
  const perms = getPermissions(role);
  const value = perms[permission];
  return value === true || value === 'limited';
}

/**
 * Determina si una donación puede ser cancelada según el rol y el estado.
 */
export function canCancelDonation(role, donationStatus, donationUserId, currentUserId) {
  if (donationStatus === DONATION_STATUS.ENTREGADA || donationStatus === DONATION_STATUS.CANCELADA) {
    return false;
  }

  if (role === ROLES.ADMIN) {
    return true;
  }

  if (role === ROLES.USER) {
    return donationUserId === currentUserId && donationStatus === DONATION_STATUS.PENDIENTE;
  }

  return false;
}

/**
 * Obtiene las transiciones de estado permitidas para una donación según el rol.
 */
export function getAllowedStatusTransitions(role, currentStatus) {
  if (role !== ROLES.ADMIN) {
    return [];
  }

  const transitions = {
    [DONATION_STATUS.PENDIENTE]: [DONATION_STATUS.ACEPTADA, DONATION_STATUS.CANCELADA],
    [DONATION_STATUS.ACEPTADA]: [DONATION_STATUS.EN_TRANSITO, DONATION_STATUS.CANCELADA],
    [DONATION_STATUS.EN_TRANSITO]: [DONATION_STATUS.ENTREGADA, DONATION_STATUS.CANCELADA],
    [DONATION_STATUS.ENTREGADA]: [],
    [DONATION_STATUS.CANCELADA]: [],
  };

  return transitions[currentStatus] || [];
}
