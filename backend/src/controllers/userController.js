import { getAll, getOne, run } from '../config/database.js';

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

export function getCurrentUser(req, res) {
  const user = getOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
  return res.json({ user: publicUser(user) });
}

export function getUsers(req, res) {
  const users = getAll('SELECT id, name, email, role, created_at FROM users ORDER BY id');
  return res.json({ users });
}

export function updateCurrentUser(req, res) {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio.' });

  run('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
  const user = getOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
  return res.json({ user: publicUser(user) });
}
