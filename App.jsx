import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Registro from './Registro';
import Dashboard from './Dashboard';
import Inscripcion from './Inscripcion';
import SubidaExcel from './SubidaExcel';
import Convocatoria from './Convocatoria';
import './App.css';
import Home from './components/Home';
import InscripcionIndividual from './InscripcionIndividual';
import InscripcionPorLista from './InscripcionPorLista';
import TestLogin from './components/TestLogin';
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
    // Redirigir según el rol del usuario
    if (currentUser.tipoUsuario === 'administrador') {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.tipoUsuario === 'tutor') {
      return <Navigate to="/tutor" replace />;
    } else if (currentUser.tipoUsuario === 'estudiante') {
      return <Navigate to="/estudiante" replace />;
    } else {
      // Si no tiene un rol reconocido, llevarlo al dashboard general
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      const role = localStorage.getItem('userRole');
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    // Cerrar el menú cuando cambia la ruta
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        <Routes>
          <Route path="/" element={
            <>
              <header className="header">
                <img src="/logo.png" alt="Logo" className="logo" />
                <nav className={isMenuOpen ? 'active' : ''}>
                  <a href="/">Inicio</a>
                  <a href="/registro" className="btn btn-registrar">Registrarse</a>
                  <a href="/login" className="btn btn-ingresar">Ingresar</a>
                </nav>
                <button className="menu-button" onClick={toggleMenu}>
                  ☰
                </button>
                {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu} />}
              </header>
              <Routes>
                <Route path="/" element={<Convocatoria />} />
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
                <Route path="/registro" element={<Registro />} />
              </Routes>
            </>
          } />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={
            <div className="dashboard">
              <aside className={`sidebar ${isMenuOpen ? 'active' : ''}`}>
                <div className="logo">
                  <img src="/logo.png" alt="Logo" />
                  <h2>TIS 25</h2>
                </div>
                <nav>
                  <ul>
                    <li>
                      <a href="/dashboard">Dashboard</a>
                    </li>
                    {userRole === 'admin' && (
                      <>
                        <li>
                          <a href="/inscripcion">Inscripción</a>
                        </li>
                        <li>
                          <a href="/subida-excel">Subida Excel</a>
                        </li>
                      </>
                    )}
                    <li>
                      <button className="logout-button" onClick={handleLogout}>
                        Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </nav>
              </aside>
              <div className="main-content">
                <header className="main-header">
                  <h1>Bienvenido</h1>
                  <button className="menu-button" onClick={toggleMenu}>
                    ☰
                  </button>
                </header>
                {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu} />}
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/inscripcion" element={<Inscripcion />} />
                  <Route path="/subida-excel" element={<SubidaExcel />} />
                </Routes>
              </div>
            </div>
          } />
        </Routes>
      )}
    </div>
  );
}

export default App;
