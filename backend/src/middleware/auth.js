import jwt from 'jsonwebtoken';

const getJwtSecret = () => process.env.JWT_SECRET;

export function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Token requerido.' });
  }

  const secret = getJwtSecret();
  if (!secret) {
    return res.status(500).json({ error: 'JWT_SECRET no configurado.' });
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}
