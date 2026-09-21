const DEVELOPMENT_SECRET = 'clave-local-desarrollo';

export function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  // En producción el secreto debe venir obligatoriamente del entorno.
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return null;
  }

  return DEVELOPMENT_SECRET;
}
