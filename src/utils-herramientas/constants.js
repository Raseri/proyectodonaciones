/**
 * Constantes globales del sistema de donaciones.
 */

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

export const DONATION_STATUS = {
  PENDIENTE: 'PENDIENTE',
  ACEPTADA: 'ACEPTADA',
  EN_TRANSITO: 'EN_TRANSITO',
  ENTREGADA: 'ENTREGADA',
  CANCELADA: 'CANCELADA',
};

export const DONATION_STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  ACEPTADA: 'Aceptada',
  EN_TRANSITO: 'En Tránsito',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

export const DONATION_STATUS_COLORS = {
  PENDIENTE: '#f59e0b',
  ACEPTADA: '#3b82f6',
  EN_TRANSITO: '#8b5cf6',
  ENTREGADA: '#10b981',
  CANCELADA: '#ef4444',
};

export const ORGANIZATION_STATUS = {
  ACTIVA: 'ACTIVA',
  INACTIVA: 'INACTIVA',
};

export const DONATION_CATEGORIES = [
  'Alimentos',
  'Ropa',
  'Medicamentos',
  'Material Escolar',
  'Juguetes',
  'Electrónicos',
  'Muebles',
  'Otros',
];
