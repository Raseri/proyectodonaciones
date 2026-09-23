const DEVELOPMENT_SECRET = 'clave-local-desarrollo';

export function getJwtSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim() !== '') {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return null;
  }

  return DEVELOPMENT_SECRET;
}
