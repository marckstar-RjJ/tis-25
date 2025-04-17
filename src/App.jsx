import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Dashboard from './dashboard';
import InscripcionIndividual from './InscripcionIndividual';
import InscripcionPorLista from './InscripcionPorLista';
import Registro from './Registro';
import AdministradorPanel from './components/AdministradorPanel';
import TutorPanel from './components/TutorPanel';
import EstudiantePanel from './components/EstudiantePanel';
import { useAuth } from './context/AuthContext';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!currentUser) {
    // Redirigir a inicio de sesión si no está autenticado
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si hay roles permitidos y el usuario no tiene el rol adecuado
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.tipoUsuario)) {
    // Redirigir al dashboard principal
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={!currentUser ? <Home /> : <Navigate to="/dashboard" replace />} />
      <Route path="/registro" element={!currentUser ? <Registro /> : <Navigate to="/dashboard" replace />} />
      
      {/* Rutas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Rutas específicas por rol */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <AdministradorPanel />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tutor/*" 
        element={
          <ProtectedRoute allowedRoles={['tutor']}>
            <TutorPanel />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/estudiante/*" 
        element={
          <ProtectedRoute allowedRoles={['estudiante']}>
            <EstudiantePanel />
          </ProtectedRoute>
        } 
      />
      
      {/* Inscripciones */}
      <Route 
        path="/inscripcion/:studentId" 
        element={
          <ProtectedRoute allowedRoles={['estudiante', 'tutor']}>
            <InscripcionIndividual />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/inscripcion-lista" 
        element={
          <ProtectedRoute allowedRoles={['tutor']}>
            <InscripcionPorLista />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta para cualquier otra URL no definida */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
