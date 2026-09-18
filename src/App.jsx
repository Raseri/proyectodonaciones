/**
 * App.jsx — Componente raíz de la aplicación.
 */

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexto/AuthContext';
import AppRoutes from './rutas/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
