import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import InscripcionIndividual from '../InscripcionIndividual';

// Componente para mostrar información personal del estudiante
const InformacionEstudiante = () => {
  const { currentUser } = useAuth();
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEstudiante = async () => {
      try {
        // Si currentUser ya tiene toda la información necesaria, usamos esa
        if (currentUser?.tipoUsuario === 'estudiante') {
          setEstudiante(currentUser);
          setLoading(false);
          return;
        }
        
        // Si no, obtenemos la información completa del estudiante
        const estudianteData = await apiService.getStudentById(currentUser.id);
        setEstudiante(estudianteData);
      } catch (err) {
        console.error('Error al cargar datos del estudiante:', err);
        setError('No se pudo cargar la información del estudiante. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEstudiante();
  }, [currentUser]);

  if (loading) {
    return <p>Cargando información...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!estudiante) {
    return <p>No se encontró información del estudiante.</p>;
  }

  return (
    <div className="estudiante-info">
      <h2>Mi Información Personal</h2>
      
      <div className="info-card">
        <div className="info-item">
          <span className="info-label">Nombre completo:</span>
          <span className="info-value">{estudiante.nombre} {estudiante.apellido || estudiante.apellidos}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">CI:</span>
          <span className="info-value">{estudiante.ci}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Correo electrónico:</span>
          <span className="info-value">{estudiante.email}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Curso:</span>
          <span className="info-value">
            {estudiante.curso <= 6 
              ? `${estudiante.curso}° Primaria` 
              : `${estudiante.curso - 6}° Secundaria`}
          </span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Colegio:</span>
          <span className="info-value">{estudiante.colegio?.nombre || estudiante.colegio || 'No asignado'}</span>
        </div>
        
        {estudiante.nombreTutor && (
          <div className="info-item">
            <span className="info-label">Tutor:</span>
            <span className="info-value">{estudiante.nombreTutor} {estudiante.apellidosTutor}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para mostrar las áreas inscritas
const MisAreas = () => {
  const { currentUser } = useAuth();
  const [areasInscritas, setAreasInscritas] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInscripcion, setShowInscripcion] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Obtener todas las áreas disponibles
      const areasData = await apiService.getAreas();
      setAllAreas(areasData);
      
      // Obtener información actualizada del estudiante
      const estudianteData = await apiService.getCurrentStudent();
      
      console.log("Datos del estudiante:", estudianteData);
      console.log("Áreas inscritas:", estudianteData.areasInscritas);
      console.log("Todas las áreas:", areasData);
      
      // Si el estudiante tiene áreas inscritas
      if (estudianteData.areasInscritas && estudianteData.areasInscritas.length > 0) {
        // Encontrar los objetos de área completos para las áreas inscritas
        const areasCompletas = areasData.filter(area => 
          estudianteData.areasInscritas.includes(area.id)
        );
        console.log("Áreas completas encontradas:", areasCompletas);
        setAreasInscritas(areasCompletas);
      } else {
        setAreasInscritas([]);
      }
    } catch (err) {
      console.error('Error al cargar áreas inscritas:', err);
      setError('No se pudieron cargar las áreas inscritas. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleInscripcion = () => {
    console.log("Iniciando proceso de inscripción...");
    setShowInscripcion(true);
  };

  const handleBackFromInscripcion = () => {
    console.log("Volviendo desde inscripción...");
    setShowInscripcion(false);
    // Recargar los datos después de la inscripción
    fetchData();
  };

  if (loading) {
    return <p>Cargando áreas inscritas...</p>;
  }

  if (showInscripcion) {
    // Renderizamos directamente el componente de inscripción
    return (
      <div className="inscripcion-individual-wrapper">
        <h2>Inscripción a Áreas Académicas</h2>
        <button 
          onClick={handleBackFromInscripcion} 
          className="back-button" 
          style={{ marginBottom: '20px' }}
        >
          ← Volver a Mis Áreas
        </button>
        <InscripcionIndividual 
          navigate={(path) => {
            console.log("Navegación interceptada a:", path);
            handleBackFromInscripcion();
          }} 
        />
      </div>
    );
  }

  return (
    <div className="mis-areas">
      <h2>Mis Áreas Académicas</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      {areasInscritas.length === 0 ? (
        <div className="no-areas">
          <p>No estás inscrito en ninguna área académica todavía.</p>
          <button onClick={handleInscripcion} className="inscripcion-button">
            Inscribirme en Áreas
          </button>
        </div>
      ) : (
        <div className="areas-container">
          <div className="areas-list">
            {areasInscritas.map(area => (
              <div key={area.id} className="area-card-estudiante">
                <h3>{area.nombre}</h3>
                <p>{area.descripcion}</p>
              </div>
            ))}
          </div>
          
          <div className="areas-actions">
            <button onClick={handleInscripcion} className="inscripcion-button">
              Modificar Inscripción
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente adaptador para InscripcionIndividual que maneja el estado interno
const InscripcionIndividualWrapper = ({ onBack }) => {
  const navigate = (path) => {
    // Simular el efecto de navegación sin cambiar la URL
    console.log("Navegación simulada a:", path);
    onBack();
  };
  
  return <InscripcionIndividual navigate={navigate} />;
};

// Componente principal del panel de estudiante
function EstudiantePanel() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Iniciando cierre de sesión...");
    // Usar directamente la función logout del contexto de autenticación
    // La redirección se maneja dentro de la función logout
    logout();
  };

  return (
    <div className="estudiante-panel">
      <aside className="sidebar">
        <div className="logo">
          <img src="/logo_umss.png" alt="Logo UMSS" />
          <h2>Panel de Estudiante</h2>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/estudiante">Dashboard</Link>
            </li>
            <li>
              <Link to="/estudiante/informacion">Mi Información</Link>
            </li>
            <li>
              <Link to="/estudiante/areas">Mis Áreas</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="estudiante-header">
          <h1>Bienvenido, {currentUser?.nombre || 'Estudiante'}</h1>
        </header>

        <div className="estudiante-content">
          <Routes>
            <Route path="/" element={
              <div className="dashboard-overview">
                <h2>Dashboard</h2>
                <p>Bienvenido al panel de estudiante de las Olimpiadas Escolares 2025.</p>
                <div className="quick-links">
                  <Link to="/estudiante/informacion" className="quick-link-card">
                    <h3>Mi Información</h3>
                    <p>Ver tus datos personales registrados.</p>
                  </Link>
                  <Link to="/estudiante/areas" className="quick-link-card">
                    <h3>Mis Áreas</h3>
                    <p>Gestionar tus áreas académicas inscritas.</p>
                  </Link>
                </div>
              </div>
            } />
            <Route path="/informacion" element={<InformacionEstudiante />} />
            <Route path="/areas" element={<MisAreas />} />
            <Route path="/inscripcion" element={<InscripcionIndividual />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default EstudiantePanel; 