/**
 * Base de datos mock — Datos iniciales del sistema.
 * Se persisten en localStorage para simular un backend.
 */

import { ROLES, DONATION_STATUS, ORGANIZATION_STATUS } from '../utilidades/constants';

const STORAGE_KEYS = {
  USERS: 'donaciones_users',
  DONATIONS: 'donaciones_donations',
  ORGANIZATIONS: 'donaciones_organizations',
  CURRENT_USER: 'donaciones_current_user',
};

// ── Datos iniciales ──────────────────────────────────────

const initialUsers = [
  {
    id: 'usr-001',
    nombre: 'Administrador',
    apellido: 'Sistema',
    email: 'admin@donaciones.com',
    password: 'admin123',
    role: ROLES.ADMIN,
    telefono: '+52 555 000 0001',
    direccion: 'Av. Principal #100, Ciudad de México',
    activo: true,
    fechaCreacion: '2025-01-15T10:00:00Z',
  },
  {
    id: 'usr-002',
    nombre: 'María',
    apellido: 'García López',
    email: 'maria@correo.com',
    password: 'user123',
    role: ROLES.USER,
    telefono: '+52 555 000 0002',
    direccion: 'Calle Reforma #45, Guadalajara',
    activo: true,
    fechaCreacion: '2025-02-20T14:30:00Z',
  },
  {
    id: 'usr-003',
    nombre: 'Carlos',
    apellido: 'Hernández Ruiz',
    email: 'carlos@correo.com',
    password: 'user123',
    role: ROLES.USER,
    telefono: '+52 555 000 0003',
    direccion: 'Blvd. Independencia #78, Monterrey',
    activo: true,
    fechaCreacion: '2025-03-10T09:15:00Z',
  },
  {
    id: 'usr-004',
    nombre: 'Ana',
    apellido: 'Martínez Soto',
    email: 'ana@correo.com',
    password: 'user123',
    role: ROLES.USER,
    telefono: '+52 555 000 0004',
    direccion: 'Calle Juárez #22, Puebla',
    activo: false,
    fechaCreacion: '2025-04-05T11:00:00Z',
  },
];

const initialOrganizations = [
  {
    id: 'org-001',
    nombre: 'Fundación Esperanza',
    descripcion: 'Organización dedicada a apoyar comunidades vulnerables con alimentos y ropa.',
    email: 'contacto@esperanza.org',
    telefono: '+52 555 100 0001',
    direccion: 'Av. Solidaridad #200, CDMX',
    ubicacion: { lat: 19.4326, lng: -99.1332 },
    categoria: 'Alimentos y Ropa',
    status: ORGANIZATION_STATUS.ACTIVA,
    fechaCreacion: '2024-06-01T08:00:00Z',
  },
  {
    id: 'org-002',
    nombre: 'Casa del Niño Feliz',
    descripcion: 'Centro de acopio para material escolar y juguetes para niños de escasos recursos.',
    email: 'info@ninofeliz.org',
    telefono: '+52 555 100 0002',
    direccion: 'Calle Alegría #15, Guadalajara',
    ubicacion: { lat: 20.6597, lng: -103.3496 },
    categoria: 'Material Escolar y Juguetes',
    status: ORGANIZATION_STATUS.ACTIVA,
    fechaCreacion: '2024-07-15T10:00:00Z',
  },
  {
    id: 'org-003',
    nombre: 'Salud para Todos',
    descripcion: 'Organización que recibe y distribuye medicamentos a clínicas comunitarias.',
    email: 'donaciones@saludparatodos.org',
    telefono: '+52 555 100 0003',
    direccion: 'Blvd. Bienestar #88, Monterrey',
    ubicacion: { lat: 25.6866, lng: -100.3161 },
    categoria: 'Medicamentos',
    status: ORGANIZATION_STATUS.ACTIVA,
    fechaCreacion: '2024-08-20T12:00:00Z',
  },
  {
    id: 'org-004',
    nombre: 'Reciclaje Solidario',
    descripcion: 'Recibe electrónicos y muebles en buen estado para familias necesitadas.',
    email: 'ayuda@reciclajesolidario.org',
    telefono: '+52 555 100 0004',
    direccion: 'Av. Ecología #50, Puebla',
    ubicacion: { lat: 19.0414, lng: -98.2063 },
    categoria: 'Electrónicos y Muebles',
    status: ORGANIZATION_STATUS.INACTIVA,
    fechaCreacion: '2024-09-10T14:00:00Z',
  },
  {
    id: 'org-005',
    nombre: 'Banco de Alimentos Regional',
    descripcion: 'Red de centros de acopio que distribuye alimentos no perecederos.',
    email: 'info@bancoalimentos.org',
    telefono: '+52 555 100 0005',
    direccion: 'Calle Nutrición #33, Querétaro',
    ubicacion: { lat: 20.5888, lng: -100.3899 },
    categoria: 'Alimentos',
    status: ORGANIZATION_STATUS.ACTIVA,
    fechaCreacion: '2024-10-01T09:00:00Z',
  },
];

const initialDonations = [
  {
    id: 'don-001',
    usuarioId: 'usr-002',
    usuarioNombre: 'María García López',
    organizacionId: 'org-001',
    organizacionNombre: 'Fundación Esperanza',
    titulo: 'Ropa de invierno',
    descripcion: '3 cajas de ropa abrigadora en buen estado para adultos y niños.',
    categoria: 'Ropa',
    cantidad: '3 cajas',
    status: DONATION_STATUS.ENTREGADA,
    direccionEntrega: 'Calle Reforma #45, Guadalajara, Jalisco',
    ubicacionEntrega: { lat: 20.6737, lng: -103.3447 },
    fechaCreacion: '2025-05-10T09:00:00Z',
    fechaActualizacion: '2025-05-18T16:00:00Z',
  },
  {
    id: 'don-002',
    usuarioId: 'usr-002',
    usuarioNombre: 'María García López',
    organizacionId: 'org-002',
    organizacionNombre: 'Casa del Niño Feliz',
    titulo: 'Material escolar variado',
    descripcion: 'Cuadernos, lápices, colores y mochilas para donación escolar.',
    categoria: 'Material Escolar',
    cantidad: '50 unidades',
    status: DONATION_STATUS.PENDIENTE,
    direccionEntrega: 'Av. Chapultepec #120, Guadalajara, Jalisco',
    ubicacionEntrega: null,
    fechaCreacion: '2025-08-01T11:00:00Z',
    fechaActualizacion: '2025-08-01T11:00:00Z',
  },
  {
    id: 'don-003',
    usuarioId: 'usr-003',
    usuarioNombre: 'Carlos Hernández Ruiz',
    organizacionId: 'org-003',
    organizacionNombre: 'Salud para Todos',
    titulo: 'Medicamentos básicos',
    descripcion: 'Analgésicos, vendas y material de curación sin abrir.',
    categoria: 'Medicamentos',
    cantidad: '2 cajas',
    status: DONATION_STATUS.ACEPTADA,
    direccionEntrega: 'Blvd. Independencia #78, Monterrey, Nuevo León',
    ubicacionEntrega: { lat: 25.6714, lng: -100.3090 },
    fechaCreacion: '2025-07-20T14:00:00Z',
    fechaActualizacion: '2025-07-22T10:00:00Z',
  },
  {
    id: 'don-004',
    usuarioId: 'usr-003',
    usuarioNombre: 'Carlos Hernández Ruiz',
    organizacionId: 'org-005',
    organizacionNombre: 'Banco de Alimentos Regional',
    titulo: 'Alimentos no perecederos',
    descripcion: 'Arroz, frijol, aceite y enlatados.',
    categoria: 'Alimentos',
    cantidad: '5 cajas',
    status: DONATION_STATUS.EN_TRANSITO,
    direccionEntrega: 'Calle Zaragoza #55, Querétaro, Querétaro',
    ubicacionEntrega: { lat: 20.5937, lng: -100.3918 },
    fechaCreacion: '2025-06-15T08:00:00Z',
    fechaActualizacion: '2025-07-01T09:00:00Z',
  },
  {
    id: 'don-005',
    usuarioId: 'usr-002',
    usuarioNombre: 'María García López',
    organizacionId: 'org-001',
    organizacionNombre: 'Fundación Esperanza',
    titulo: 'Juguetes infantiles',
    descripcion: 'Juguetes nuevos y seminuevos para niños de 3 a 10 años.',
    categoria: 'Juguetes',
    cantidad: '20 piezas',
    status: DONATION_STATUS.CANCELADA,
    direccionEntrega: 'Calle Reforma #45, Guadalajara, Jalisco',
    ubicacionEntrega: null,
    fechaCreacion: '2025-04-10T10:00:00Z',
    fechaActualizacion: '2025-04-12T15:00:00Z',
  },
  {
    id: 'don-006',
    usuarioId: 'usr-003',
    usuarioNombre: 'Carlos Hernández Ruiz',
    organizacionId: 'org-002',
    organizacionNombre: 'Casa del Niño Feliz',
    titulo: 'Computadoras usadas',
    descripcion: '4 laptops funcionales para uso educativo.',
    categoria: 'Electrónicos',
    cantidad: '4 unidades',
    status: DONATION_STATUS.PENDIENTE,
    direccionEntrega: 'Av. Hidalgo #90, Guadalajara, Jalisco',
    ubicacionEntrega: null,
    fechaCreacion: '2025-08-15T13:00:00Z',
    fechaActualizacion: '2025-08-15T13:00:00Z',
  },
];

// ── Funciones de acceso a localStorage ───────────────────

function getStoredData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Inicialización ──────────────────────────────────────

export function initializeMockData() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStoredData(STORAGE_KEYS.USERS, initialUsers);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS)) {
    setStoredData(STORAGE_KEYS.ORGANIZATIONS, initialOrganizations);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DONATIONS)) {
    setStoredData(STORAGE_KEYS.DONATIONS, initialDonations);
  }
}

// ── Exports de acceso ───────────────────────────────────

export function getUsers() {
  return getStoredData(STORAGE_KEYS.USERS, initialUsers);
}

export function setUsers(users) {
  setStoredData(STORAGE_KEYS.USERS, users);
}

export function getDonations() {
  return getStoredData(STORAGE_KEYS.DONATIONS, initialDonations);
}

export function setDonations(donations) {
  setStoredData(STORAGE_KEYS.DONATIONS, donations);
}

export function getOrganizations() {
  return getStoredData(STORAGE_KEYS.ORGANIZATIONS, initialOrganizations);
}

export function setOrganizations(organizations) {
  setStoredData(STORAGE_KEYS.ORGANIZATIONS, organizations);
}

export function getCurrentUser() {
  return getStoredData(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user) {
  if (user) {
    setStoredData(STORAGE_KEYS.CURRENT_USER, user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export { STORAGE_KEYS };
