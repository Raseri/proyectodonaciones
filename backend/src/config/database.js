import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import initSqlJs from 'sql.js';

const databasePath = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'backend/data/donaciones.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

let db;

export async function initializeDatabase() {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: file => path.resolve(process.cwd(), 'node_modules/sql.js/dist', file),
  });
  const file = fs.existsSync(databasePath) ? fs.readFileSync(databasePath) : undefined;
  db = new SQL.Database(file);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')) DEFAULT 'USER',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  seedDemoUsers();
  seedAdminFromEnvironment();
  saveDatabase();
  return db;
}

function saveDatabase() {
  const data = db.export();
  fs.writeFileSync(databasePath, Buffer.from(data));
}

export function getOne(sql, params = []) {
  const statement = db.prepare(sql);
  statement.bind(params);
  const result = statement.step() ? statement.getAsObject() : null;
  statement.free();
  return result;
}

export function getAll(sql, params = []) {
  const statement = db.prepare(sql);
  statement.bind(params);
  const rows = [];
  while (statement.step()) rows.push(statement.getAsObject());
  statement.free();
  return rows;
}

export function run(sql, params = []) {
  const statement = db.prepare(sql);
  statement.run(params);
  statement.free();
  saveDatabase();
  return getOne('SELECT last_insert_rowid() AS id');
}

// Crea las cuentas visibles en LoginPage solo si todavía no existen.
export function seedDemoUsers() {
  const demoUsers = [
    { name: 'Administrador', email: 'admin@donaciones.com', password: 'admin123', role: 'ADMIN' },
    { name: 'María', email: 'maria@correo.com', password: 'user123', role: 'USER' },
  ];

  for (const demoUser of demoUsers) {
    const existing = getOne('SELECT id FROM users WHERE email = ?', [demoUser.email]);
    if (!existing) {
      const passwordHash = bcrypt.hashSync(demoUser.password, 10);
      run(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [demoUser.name, demoUser.email, passwordHash, demoUser.role]
      );
    }
  }
}

// El administrador se crea solo cuando se configuran credenciales de entorno.
export function seedAdminFromEnvironment() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = getOne('SELECT id FROM users WHERE email = ?', [email]);
  if (!existing) {
    const passwordHash = bcrypt.hashSync(password, 10);
    run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Administrador', email, passwordHash, 'ADMIN']
    );
  }
}

export function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = undefined;
  }
}
