/**
 * LoginPage — Página de inicio de sesión.
 */

import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexto/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(form.email, form.password);
    if (result.success) navigate('/dashboard');
    else setError(result.error);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-decoration" />
      <div className="auth-container animate-slide-up">
        <div className="auth-header">
          <div className="auth-logo">67</div>
          <h1 className="auth-title">Bienvenido</h1>
          <p className="auth-subtitle">Inicia sesión en el Sistema de Donaciones</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
        </div>

        <div className="auth-demo-info">
          <p className="auth-demo-title">Cuentas de prueba:</p>
          <div className="auth-demo-accounts">
            <div className="auth-demo-account">
              <span className="badge badge-admin">ADMIN</span>
              <code>admin@donaciones.com / admin123</code>
            </div>
            <div className="auth-demo-account">
              <span className="badge badge-user">USER</span>
              <code>maria@correo.com / user123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
