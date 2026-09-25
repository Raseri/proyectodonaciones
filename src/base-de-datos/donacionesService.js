/**
 * Servicio mock para donaciones.
 */

import { getDonations, setDonations, getOrganizations } from './mockData';
import { DONATION_STATUS } from '../utilidades/constants';

export const donacionesService = {
  /**
   * Obtiene todas las donaciones (ADMIN) o solo las del usuario (USER).
   */
  getAll(userId, role) {
    const donations = getDonations();
    if (role === 'ADMIN') {
      return donations;
    }
    return donations.filter(d => d.usuarioId === userId);
  },

  /**
   * Obtiene una donación por ID.
   */
  getById(donationId) {
    const donations = getDonations();
    return donations.find(d => d.id === donationId) || null;
  },

  /**
   * Crea una nueva donación.
   */
  create({ usuarioId, usuarioNombre, organizacionId, titulo, descripcion, categoria, cantidad, direccionEntrega }) {
    const donations = getDonations();
    const orgs = getOrganizations();
    const org = orgs.find(o => o.id === organizacionId);

    const newDonation = {
      id: 'don-' + String(Date.now()).slice(-6),
      usuarioId,
      usuarioNombre,
      organizacionId,
      organizacionNombre: org ? org.nombre : 'Organización desconocida',
      titulo,
      descripcion,
      categoria,
      cantidad,
      status: DONATION_STATUS.PENDIENTE,
      direccionEntrega: direccionEntrega || '',
      ubicacionEntrega: null,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    donations.push(newDonation);
    setDonations(donations);

    return { success: true, donation: newDonation };
  },

  /**
   * Actualiza una donación existente.
   */
  update(donationId, updates) {
    const donations = getDonations();
    const index = donations.findIndex(d => d.id === donationId);

    if (index === -1) {
      return { success: false, error: 'Donación no encontrada.' };
    }

    donations[index] = {
      ...donations[index],
      ...updates,
      fechaActualizacion: new Date().toISOString(),
    };
    setDonations(donations);

    return { success: true, donation: donations[index] };
  },

  /**
   * Cambia el estado de una donación.
   */
  changeStatus(donationId, newStatus) {
    return this.update(donationId, { status: newStatus });
  },

  /**
   * Elimina una donación.
   */
  delete(donationId) {
    const donations = getDonations();
    const filtered = donations.filter(d => d.id !== donationId);

    if (filtered.length === donations.length) {
      return { success: false, error: 'Donación no encontrada.' };
    }

    setDonations(filtered);
    return { success: true };
  },

  /**
   * Obtiene estadísticas de donaciones.
   */
  getStats(userId, role) {
    const donations = this.getAll(userId, role);

    return {
      total: donations.length,
      pendientes: donations.filter(d => d.status === DONATION_STATUS.PENDIENTE).length,
      aceptadas: donations.filter(d => d.status === DONATION_STATUS.ACEPTADA).length,
      enTransito: donations.filter(d => d.status === DONATION_STATUS.EN_TRANSITO).length,
      entregadas: donations.filter(d => d.status === DONATION_STATUS.ENTREGADA).length,
      canceladas: donations.filter(d => d.status === DONATION_STATUS.CANCELADA).length,
    };
  },
};
