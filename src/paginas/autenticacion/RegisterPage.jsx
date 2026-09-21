/**
 * RegisterPage — Página de registro de nuevo usuario.
 */

import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexto/AuthContext';
import './AuthPages.css';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', confirmPassword: '', telefono: '', direccion: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const result = await register(form);
    if (result.success) navigate('/dashboard');
    else setError(result.error);
    setLoading(false);
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="auth-page">
      <div className="auth-bg-decoration" />
      <div className="auth-container auth-container-wide animate-slide-up">
        <div className="auth-header">
          <div className="auth-logo">💝</div>
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">Únete al Sistema de Donaciones</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-nombre">Nombre *</label>
              <input id="reg-nombre" type="text" className="form-input" placeholder="Tu nombre"
                value={form.nombre} onChange={e => update('nombre', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-apellido">Apellido *</label>
              <input id="reg-apellido" type="text" className="form-input" placeholder="Tu apellido"
                value={form.apellido} onChange={e => update('apellido', e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Correo electrónico *</label>
            <input id="reg-email" type="email" className="form-input" placeholder="tu@email.com"
              value={form.email} onChange={e => update('email', e.target.value)} required />
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Contraseña *</label>
              <input id="reg-password" type="password" className="form-input" placeholder="Mínimo 6 caracteres"
                value={form.password} onChange={e => update('password', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirmar contraseña *</label>
              <input id="reg-confirm" type="password" className="form-input" placeholder="Repite tu contraseña"
                value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
            </div>
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-telefono">Teléfono</label>
              <input id="reg-telefono" type="tel" className="form-input" placeholder="+52 555 000 0000"
                value={form.telefono} onChange={e => update('telefono', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-direccion">Dirección</label>
              <input id="reg-direccion" type="text" className="form-input" placeholder="Tu dirección"
                value={form.direccion} onChange={e => update('direccion', e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
        </div>
      </div>
    </div>
  );
}
