import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';
import Home from './components/Home';
import Registro from './Registro';
import Dashboard from './Dashboard';
import EstudiantePanel from './components/EstudiantePanel';
import TutorPanel from './components/TutorPanel';
import AdministradorPanel from './components/AdministradorPanel';
import InscripcionArea from './components/InscripcionArea';
import OrdenPagoEstudiante from './components/OrdenPagoEstudiante';
import InscripcionIndividual from './InscripcionIndividual';
import InscripcionPorLista from './InscripcionPorLista';
import RecuperarContrasena from './components/RecuperarContrasena';
import ResetPassword from './components/ResetPassword';
import Footer from './components/Footer';
import Etapas from './components/Etapas';
import Reglamento from './components/Reglamento';
import Contactanos from './components/Contactanos';
import ConvocatoriasPublicas from './components/ConvocatoriasPublicas';

// Componente que redirige según el tipo de usuario
const redirectByUserType = (user) => {
  if (!user) return '/';
  switch (user.tipoUsuario) {
    case 'administrador':
      return '/admin';
    case 'tutor':
      return '/tutor';
    case 'estudiante':
      return '/estudiante';
    default:
      return '/';
  }
};

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
  const { currentUser, authChecked } = useAuth();
  
  // Si aún estamos verificando la autenticación, mostramos cargando
  if (!authChecked) {
    return <div className="loading">Verificando autenticación...</div>;
  }
  
  // Si el usuario no está autenticado, redirigimos a la página principal
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  // Si el usuario está autenticado, renderizamos el contenido
  return children;
};

function App() {
  // Obtener la ruta actual para determinar si mostrar el footer
  const { currentUser } = useAuth();
  const [pathname, setPathname] = useState(window.location.pathname);

  // Actualizar la ruta cuando cambia la ubicación
  React.useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', updatePathname);
    return () => window.removeEventListener('popstate', updatePathname);
  }, []);

  // Función para determinar si se debe mostrar el footer basado en la ruta
  const shouldShowFooter = () => {
    // No mostrar el footer en paneles de tutor, estudiante y administrador
    return !pathname.startsWith('/tutor') && 
           !pathname.startsWith('/estudiante') && 
           !pathname.startsWith('/admin');
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/recuperar-contrasena/:token" element={<ResetPassword />} />
        <Route path="/convocatorias" element={<ConvocatoriasPublicas />} />
        <Route path="/etapas" element={<Etapas />} />
        <Route path="/reglamento" element={<Reglamento />} />
        <Route path="/contactanos" element={<Contactanos />} />
        
        {/* Rutas para estudiantes */}
        <Route path="/estudiante/*" element={
          <ProtectedRoute>
            <EstudiantePanel />
          </ProtectedRoute>
        } />
        <Route path="/estudiante/orden-pago" element={
          <ProtectedRoute>
            <OrdenPagoEstudiante />
          </ProtectedRoute>
        } />
        
        {/* Rutas para tutores */}
        <Route path="/tutor/*" element={
          <ProtectedRoute>
            <TutorPanel />
          </ProtectedRoute>
        } />
        <Route path="/tutor/estudiantes/:studentId/inscripcion" element={
          <ProtectedRoute>
            <InscripcionArea />
          </ProtectedRoute>
        } />
        <Route path="/tutor/estudiantes/:studentId/orden-pago" element={
          <ProtectedRoute>
            <OrdenPagoEstudiante />
          </ProtectedRoute>
        } />
        <Route path="/tutor/inscripcion-individual" element={
          <ProtectedRoute>
            <InscripcionIndividual />
          </ProtectedRoute>
        } />
        <Route path="/tutor/inscripcion-lista" element={
          <ProtectedRoute>
            <InscripcionPorLista />
          </ProtectedRoute>
        } />
        
        {/* Rutas para administradores */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdministradorPanel />
          </ProtectedRoute>
        } />
        
        {/* Ruta de fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {shouldShowFooter() && <Footer />}
    </div>
  );
}

export default App;
