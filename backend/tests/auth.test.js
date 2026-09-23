import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const testDatabasePath = path.resolve(process.cwd(), 'backend/data/test-donaciones.sqlite');
process.env.DATABASE_PATH = testDatabasePath;
process.env.JWT_SECRET = 'test-only-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'admin-test-password';

const { default: app } = await import('../src/app.js');
const database = await import('../src/config/database.js');

let userCounter = 0;

function uniqueEmail() {
  userCounter += 1;
  return `user-${userCounter}@test.local`;
}

async function registerUser(overrides = {}) {
  const user = {
    name: 'Usuario de Prueba',
    email: uniqueEmail(),
    password: 'user-test-password',
    ...overrides,
  };
  const response = await request(app).post('/api/auth/register').send(user);
  return { response, credentials: user };
}

async function login(email, password) {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  return response.body.token;
}

beforeAll(async () => {
  if (fs.existsSync(testDatabasePath)) fs.rmSync(testDatabasePath);
  await database.initializeDatabase();
  await database.initializeDatabase();
  database.seedAdminFromEnvironment();
});

afterAll(() => {
  database.closeDatabase();
  database.closeDatabase();
  if (fs.existsSync(testDatabasePath)) fs.rmSync(testDatabasePath);
});

describe('Registro', () => {
  test('registra un usuario USER y almacena la contraseña como hash', async () => {
    const { response, credentials } = await registerUser();
    const storedUser = database.getOne('SELECT * FROM users WHERE email = ?', [credentials.email]);

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('USER');
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.password_hash).toBeUndefined();
    expect(storedUser.password_hash).not.toBe(credentials.password);
    expect(bcrypt.compareSync(credentials.password, storedUser.password_hash)).toBe(true);
  });

  test('rechaza el registro sin nombre', async () => {
    const { response } = await registerUser({ name: '' });
    expect(response.status).toBe(400);
  });

  test('rechaza un email inválido', async () => {
    const { response } = await registerUser({ email: 'no-es-un-email' });
    expect(response.status).toBe(400);
  });

  test('rechaza el registro sin contraseña', async () => {
    const { response } = await registerUser({ password: '' });
    expect(response.status).toBe(400);
  });

  test('rechaza un email duplicado', async () => {
    const email = uniqueEmail();
    await registerUser({ email });
    const { response } = await registerUser({ email });
    expect(response.status).toBe(409);
  });

  test('rechaza que el cliente se autoasigne el rol ADMIN en el registro', async () => {
    const { response, credentials } = await registerUser({ role: 'ADMIN' });
    const storedUser = database.getOne('SELECT role FROM users WHERE email = ?', [credentials.email]);

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('USER');
    expect(storedUser.role).toBe('USER');
  });
});

describe('Login', () => {
  test('devuelve un JWT y datos públicos con credenciales correctas', async () => {
    const { credentials } = await registerUser();
    const response = await request(app).post('/api/auth/login').send(credentials);
    const payload = jwt.verify(response.body.token, process.env.JWT_SECRET);

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe(credentials.email);
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.password_hash).toBeUndefined();
    expect(payload).toMatchObject({ email: credentials.email, role: 'USER' });
  });

  test('rechaza una contraseña incorrecta', async () => {
    const { credentials } = await registerUser();
    const response = await request(app).post('/api/auth/login').send({
      email: credentials.email,
      password: 'wrong-password',
    });
    expect(response.status).toBe(401);
  });

  test('rechaza un usuario inexistente', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'missing@test.local',
      password: 'user-test-password',
    });
    expect(response.status).toBe(401);
  });
});

describe('JWT y autenticación', () => {
  test('permite consultar /users/me con un JWT válido', async () => {
    const { credentials } = await registerUser();
    const token = await login(credentials.email, credentials.password);
    const response = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(credentials.email);
  });

  test('rechaza /users/me sin token', async () => {
    const response = await request(app).get('/api/users/me');
    expect(response.status).toBe(401);
  });

  test('rechaza /users/me con un token inválido', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(401);
  });

  test('rechaza /users/me con un token expirado', async () => {
    const token = jwt.sign(
      { id: 1, email: 'expired@test.local', role: 'USER' },
      process.env.JWT_SECRET,
      { expiresIn: -1 }
    );
    const response = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  test('rechaza el acceso si JWT_SECRET no está configurado en entorno no seguro', async () => {
    const token = await login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    const originalSecret = process.env.JWT_SECRET;
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.JWT_SECRET = '';
    process.env.NODE_ENV = 'production';

    const response = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);

    process.env.JWT_SECRET = originalSecret;
    process.env.NODE_ENV = originalNodeEnv;
    expect(response.status).toBe(500);
  });
});

describe('Roles y autorización', () => {
  test('rechaza el listado administrativo sin token', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(401);
  });

  test('rechaza el listado administrativo para USER', async () => {
    const { credentials } = await registerUser();
    const token = await login(credentials.email, credentials.password);
    const response = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
  });

  test('permite el listado administrativo para ADMIN', async () => {
    const token = await login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    const response = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.users).toEqual(expect.arrayContaining([
      expect.objectContaining({ email: process.env.ADMIN_EMAIL, role: 'ADMIN' }),
    ]));
  });
});

describe('Perfil', () => {
  test('actualiza el nombre con JWT y lo devuelve actualizado', async () => {
    const { credentials } = await registerUser();
    const token = await login(credentials.email, credentials.password);
    const updateResponse = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nombre Actualizado' });
    const meResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.user.name).toBe('Nombre Actualizado');
    expect(meResponse.body.user.name).toBe('Nombre Actualizado');
  });

  test('rechaza la actualización de perfil sin JWT', async () => {
    const response = await request(app)
      .put('/api/users/me')
      .send({ name: 'Sin Token' });
    expect(response.status).toBe(401);
  });

  test('rechaza una actualización sin nombre', async () => {
    const { credentials } = await registerUser();
    const token = await login(credentials.email, credentials.password);
    const response = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' });

    expect(response.status).toBe(400);
  });

  test('devuelve 404 para un usuario incluido en un JWT que no existe', async () => {
    const token = jwt.sign(
      { id: 999999, email: 'missing@test.local', role: 'USER' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const response = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
