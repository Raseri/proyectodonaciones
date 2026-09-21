import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getOne, run } from '../config/database.js';

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error('JWT_SECRET no configurado.');
    error.status = 500;
    throw error;
  }

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

export function register(req, res) {
  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const existing = getOne('SELECT id FROM users WHERE email = ?', [normalizedEmail]);

  if (existing) {
    return res.status(409).json({ error: 'El email ya está registrado.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  run(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name.trim(), normalizedEmail, passwordHash, 'USER']
  );
  const user = getOne('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

  return res.status(201).json({ token: createToken(user), user: publicUser(user) });
}

export function login(req, res) {
  const { email, password } = req.body;
  const user = getOne('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
  }

  return res.json({ token: createToken(user), user: publicUser(user) });
}
