/**
 * Servicio de autenticación mock.
 * Simula login, registro y gestión de sesión con localStorage.
 */

import { getUsers, setUsers, getCurrentUser, setCurrentUser } from './mockData';
import { ROLES } from '../utils-herramientas/constants';

export const authService = {
  /**
   * Inicia sesión con email y contraseña.
   */
  login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, error: 'Email o contraseña incorrectos.' };
    }

    if (!user.activo) {
      return { success: false, error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' };
    }

    const safeUser = { ...user };
    delete safeUser.password;
    setCurrentUser(safeUser);

    return { success: true, user: safeUser };
  },

  /**
   * Registra un nuevo usuario con rol USER.
   */
  register({ nombre, apellido, email, password, telefono, direccion }) {
    const users = getUsers();

    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Ya existe una cuenta con ese email.' };
    }

    const newUser = {
      id: 'usr-' + String(Date.now()).slice(-6),
      nombre,
      apellido,
      email,
      password,
      role: ROLES.USER,
      telefono: telefono || '',
      direccion: direccion || '',
      activo: true,
      fechaCreacion: new Date().toISOString(),
    };

    users.push(newUser);
    setUsers(users);

    const safeUser = { ...newUser };
    delete safeUser.password;
    setCurrentUser(safeUser);

    return { success: true, user: safeUser };
  },

  /**
   * Cierra la sesión actual.
   */
  logout() {
    setCurrentUser(null);
  },

  /**
   * Obtiene el usuario actualmente autenticado.
   */
  getCurrentUser() {
    return getCurrentUser();
  },

  /**
   * Actualiza los datos del perfil del usuario actual.
   */
  updateProfile(userId, updates) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    // No permitir cambios de rol desde updateProfile
    delete updates.role;
    delete updates.password;
    delete updates.id;

    users[index] = { ...users[index], ...updates };
    setUsers(users);

    const safeUser = { ...users[index] };
    delete safeUser.password;

    // Si es el usuario actual, actualizar la sesión
    const current = getCurrentUser();
    if (current && current.id === userId) {
      setCurrentUser(safeUser);
    }

    return { success: true, user: safeUser };
  },
};
