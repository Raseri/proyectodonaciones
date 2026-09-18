/**
 * Servicio mock para gestión de usuarios (solo ADMIN).
 */

import { getUsers, setUsers } from './mockData';

export const usuariosService = {
  getAll() {
    const users = getUsers();
    return users.map(u => {
      const safe = { ...u };
      delete safe.password;
      return safe;
    });
  },

  getById(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    const safe = { ...user };
    delete safe.password;
    return safe;
  },

  update(userId, updates) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    delete updates.password;
    delete updates.id;

    users[index] = { ...users[index], ...updates };
    setUsers(users);

    const safe = { ...users[index] };
    delete safe.password;

    return { success: true, user: safe };
  },

  toggleStatus(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    return this.update(userId, { activo: !user.activo });
  },

  changeRole(userId, newRole) {
    return this.update(userId, { role: newRole });
  },

  getStats() {
    const users = getUsers();
    return {
      total: users.length,
      activos: users.filter(u => u.activo).length,
      inactivos: users.filter(u => !u.activo).length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      users: users.filter(u => u.role === 'USER').length,
    };
  },
};
