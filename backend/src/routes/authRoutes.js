import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { login, register } from '../controllers/authController.js';

const router = Router();

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  return next();
}

const credentialsValidation = [
  body('email').isEmail().withMessage('El email debe ser válido.').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('La contraseña es obligatoria.'),
];

router.post('/register', [
  body('name').isString().trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('email').isEmail().withMessage('El email debe ser válido.').normalizeEmail(),
  body('password').isString().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('role').optional().isIn(['USER', 'ADMIN']).withMessage('El rol debe ser USER o ADMIN.'),
  validateRequest,
], register);

router.post('/login', [...credentialsValidation, validateRequest], login);

export default router;
