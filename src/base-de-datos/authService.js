/** Servicio de autenticación conectado al backend JWT. */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'donaciones_access_token';

function mapUser(user) {
  const [nombre, ...apellidos] = (user.name || '').trim().split(/\s+/);
  return {
    id: user.id,
    nombre: nombre || '',
    apellido: apellidos.join(' '),
    email: user.email,
    role: user.role,
    activo: true,
    fechaCreacion: user.created_at,
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la solicitud.');
  return data;
}

export const authService = {
  async login(email, password) {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      return { success: true, user: mapUser(data.user) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async register({ nombre, apellido, email, password }) {
    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: `${nombre} ${apellido}`.trim(), email, password }),
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      return { success: true, user: mapUser(data.user) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Cierra la sesión actual.
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const data = await request('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return mapUser(data.user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  async updateProfile(userId, updates) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { success: false, error: 'Sesión no válida.' };

    try {
      const data = await request('/users/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: `${updates.nombre} ${updates.apellido}`.trim() }),
      });
      return { success: true, user: mapUser(data.user) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export { TOKEN_KEY };
