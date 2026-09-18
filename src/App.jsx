/**
 * App.jsx — Componente raíz de la aplicación.
 */

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context-estado-global/AuthContext';
import AppRoutes from './routes-navegacion/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
