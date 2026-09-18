/**
 * Servicio mock para organizaciones.
 */

import { getOrganizations, setOrganizations } from './mockData';
import { ORGANIZATION_STATUS } from '../utilidades/constants';

export const organizacionesService = {
  getAll() {
    return getOrganizations();
  },

  getActive() {
    return getOrganizations().filter(o => o.status === ORGANIZATION_STATUS.ACTIVA);
  },

  getById(orgId) {
    return getOrganizations().find(o => o.id === orgId) || null;
  },

  create({ nombre, descripcion, email, telefono, direccion, ubicacion, categoria }) {
    const orgs = getOrganizations();

    const newOrg = {
      id: 'org-' + String(Date.now()).slice(-6),
      nombre,
      descripcion,
      email,
      telefono,
      direccion,
      ubicacion: ubicacion || { lat: 0, lng: 0 },
      categoria,
      status: ORGANIZATION_STATUS.ACTIVA,
      fechaCreacion: new Date().toISOString(),
    };

    orgs.push(newOrg);
    setOrganizations(orgs);
    return { success: true, organization: newOrg };
  },

  update(orgId, updates) {
    const orgs = getOrganizations();
    const index = orgs.findIndex(o => o.id === orgId);

    if (index === -1) {
      return { success: false, error: 'Organización no encontrada.' };
    }

    orgs[index] = { ...orgs[index], ...updates };
    setOrganizations(orgs);
    return { success: true, organization: orgs[index] };
  },

  toggleStatus(orgId) {
    const orgs = getOrganizations();
    const org = orgs.find(o => o.id === orgId);

    if (!org) {
      return { success: false, error: 'Organización no encontrada.' };
    }

    const newStatus = org.status === ORGANIZATION_STATUS.ACTIVA
      ? ORGANIZATION_STATUS.INACTIVA
      : ORGANIZATION_STATUS.ACTIVA;

    return this.update(orgId, { status: newStatus });
  },

  delete(orgId) {
    const orgs = getOrganizations();
    const filtered = orgs.filter(o => o.id !== orgId);

    if (filtered.length === orgs.length) {
      return { success: false, error: 'Organización no encontrada.' };
    }

    setOrganizations(filtered);
    return { success: true };
  },
};
