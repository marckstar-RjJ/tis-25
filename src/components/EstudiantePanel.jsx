import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { FaUser, FaIdCard, FaEnvelope, FaSchool, FaGraduationCap, FaUserTie, FaClipboardList, FaSignOutAlt, FaPhone } from 'react-icons/fa';
import MisAreas from './MisAreas';
import MisConvocatorias from './MisConvocatorias';
import InscripcionAreaEstudiante from './InscripcionAreaEstudiante';
import InscripcionIndividual from '../InscripcionIndividual';
import MisInscripciones from './MisInscripciones';
import '../App.css';
import OCRScanner from './OCRScanner';

// Componente para mostrar información personal del estudiante
const InformacionEstudiante = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEstudiante = async () => {
      try {
        setLoading(true);
        
        // Verificar si hay un token válido
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay token de autenticación');
          throw new Error('No hay token de autenticación');
        }

        console.log('Token encontrado:', token.substring(0, 20) + '...');
        console.log('Usuario actual:', currentUser);

        // Obtener datos del estudiante desde el backend
        const response = await fetch('https://tis-25-backend.onrender.com/api/student/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        console.log('Respuesta del servidor:', response.status, response.statusText);

        if (response.status === 401 || response.status === 403) {
          console.error('Error de autenticación:', response.status);
          // Si el token no es válido, cerrar sesión y redirigir al login
          await logout();
          navigate('/login');
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error en la respuesta:', errorData);
          throw new Error(`Error al obtener datos del estudiante: ${response.statusText}`);
        }

        const estudianteData = await response.json();
        console.log("Datos del estudiante recuperados:", estudianteData);
        setEstudiante(estudianteData);
      } catch (err) {
        console.error('Error al cargar datos del estudiante:', err);
        setError(err.message || 'No se pudo cargar la información del estudiante. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
    fetchEstudiante();
    } else {
      console.error('No hay usuario autenticado');
      setLoading(false);
      setError('No hay usuario autenticado');
    }
  }, [currentUser, logout, navigate]);

  // Función para formatear el nombre del curso
  const formatearCurso = (curso) => {
    if (!curso && curso !== 0) return 'No asignado';
    return curso <= 6 ? `${curso}° Primaria` : `${curso - 6}° Secundaria`;
  };

  // Determinar el nivel educativo para el color del badge
  const getNivelEducativo = (curso) => {
    if (!curso && curso !== 0) return 'secondary';
    return curso <= 6 ? 'info' : 'primary';
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando información del estudiante...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        <Alert.Heading>Error al cargar los datos</Alert.Heading>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </Alert>
    );
  }

  if (!estudiante) {
    return (
      <Alert variant="warning" className="my-4">
        <Alert.Heading>Información no disponible</Alert.Heading>
        <p>No se encontró información del estudiante en el sistema.</p>
      </Alert>
    );
  }

  return (
    <Container className="estudiante-info py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="border-bottom pb-2">Mi Información Personal</h2>
        </Col>
      </Row>
      
      <Row>
        <Col md={12} lg={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
              <div className="d-flex align-items-center">
                <FaUser size={24} className="me-3" />
                <h3 className="m-0 fs-4">Perfil del Estudiante</h3>
              </div>
            </Card.Header>
            
            <Card.Body className="p-4">
              <Row className="gy-4">
                {/* Nombre completo */}
                <Col xs={12}>
                  <Card className="border-0 bg-light">
                    <Card.Body className="d-flex align-items-center">
                      <div className="bg-primary p-3 rounded text-white me-3">
                        <FaUser size={24} />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Nombre completo</h6>
                        <h5 className="mb-0">{estudiante.nombre} {estudiante.apellido || estudiante.apellidos}</h5>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                {/* CI */}
                <Col md={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body className="d-flex align-items-center">
                      <div className="bg-secondary p-3 rounded text-white me-3">
                        <FaIdCard size={24} />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Cédula de Identidad</h6>
                        <h5 className="mb-0">{estudiante.ci}</h5>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                {/* Email */}
                <Col md={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body className="d-flex align-items-center">
                      <div className="bg-info p-3 rounded text-white me-3">
                        <FaEnvelope size={24} />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Correo electrónico</h6>
                        <h5 className="mb-0">{estudiante.email}</h5>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                {/* Curso */}
                <Col md={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body className="d-flex align-items-center">
                      <div className={`bg-${getNivelEducativo(estudiante.curso)} p-3 rounded text-white me-3`}>
                        <FaGraduationCap size={24} />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Curso</h6>
                        <div>
                          <Badge bg={getNivelEducativo(estudiante.curso)} className="p-2">
                            {formatearCurso(estudiante.curso || estudiante.curso_id)}
                          </Badge>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                {/* Colegio */}
                <Col md={6}>
                  <Card className="border-0 bg-light h-100">
                    <Card.Body className="d-flex align-items-center">
                      <div className="bg-success p-3 rounded text-white me-3">
                        <FaSchool size={24} />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Colegio</h6>
                        <h5 className="mb-0">
                          {estudiante.colegio?.nombre || 
                           (typeof estudiante.colegio === 'string' ? estudiante.colegio : 
                           (estudiante.colegio_id ? `Colegio ID: ${estudiante.colegio_id}` : 'No asignado'))}
                        </h5>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                {/* Tutor */}
                {(estudiante.nombreTutor || estudiante.tutor) && (
                  <Col xs={12}>
                    <Card className="border-0 bg-light">
                      <Card.Body className="d-flex align-items-center">
                        <div className="bg-dark p-3 rounded text-white me-3">
                          <FaUserTie size={24} />
                        </div>
                        <div>
                          <h6 className="text-muted mb-1">Tutor</h6>
                          <h5 className="mb-0">
                            {estudiante.nombreTutor && estudiante.apellidosTutor ? 
                              `${estudiante.nombreTutor} ${estudiante.apellidosTutor}` : 
                              estudiante.tutor || 'No asignado'}
                          </h5>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>
            </Card.Body>
            

          </Card>
        </Col>
      </Row>
    </Container>
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
        <div className="logo" onClick={() => navigate('/estudiante')} style={{ cursor: 'pointer' }}>
          <img src="/logo_umss.png" alt="Logo UMSS" />
          <img src="/logoEstudi.png" alt="Logo Estudiante" className="user-role-logo-small" />
          <h2>Panel de Estudiante</h2>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/estudiante/informacion">Mi Información</Link>
            </li>
            <li>
              <Link to="/estudiante/convocatorias">Mis Convocatorias</Link>
            </li>
            <li>
              <Link to="/estudiante/inscripciones">Mis Inscripciones</Link>
            </li>
            <li>
              <Link to="/estudiante/ocr">Verificar Comprobante</Link>
            </li>
            <li className="mt-auto" style={{ marginTop: '30px' }}>
              <button onClick={handleLogout} className="logout-button" style={{ width: '100%', textAlign: 'left', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderLeft: '2px solid rgba(255, 255, 255, 0.2)' }}>
                <FaSignOutAlt style={{ marginRight: '8px' }} /> Cerrar Sesión
              </button>
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
                    <div className="quick-link-icon">
                      <FaIdCard size={36} color="#3498db" />
                    </div>
                    <div className="quick-link-text">
                      <h3>Mi Información</h3>
                      <p>Ver tus datos personales registrados.</p>
                    </div>
                  </Link>
                  <Link to="/estudiante/convocatorias" className="quick-link-card">
                    <div className="quick-link-icon">
                      <FaClipboardList size={36} color="#27ae60" />
                    </div>
                    <div className="quick-link-text">
                      <h3>Mis Convocatorias</h3>
                      <p>Ver las olimpiadas disponibles e inscribirte en ellas.</p>
                    </div>
                  </Link>
                  <Link to="/estudiante/inscripciones" className="quick-link-card">
                <div className="quick-link-icon">
                  <FaGraduationCap size={36} color="#e74c3c" />
                </div>
                <div className="quick-link-text">
                  <h3>Mis Inscripciones</h3>
                  <p>Gestiona tus inscripciones y órdenes de pago.</p>
                </div>
              </Link>
              <Link to="/estudiante/ocr" className="quick-link-card">
                <div className="quick-link-icon">
                  <FaClipboardList size={36} color="#9b59b6" />
                </div>
                <div className="quick-link-text">
                  <h3>Verificar Comprobante de Pago</h3>
                  <p>Verificar comprobante de pago mediante OCR</p>
                </div>
              </Link>
                </div>

              </div>
            } />
            <Route path="/informacion" element={<InformacionEstudiante />} />
            <Route path="/convocatorias" element={<MisConvocatorias />} />
            <Route path="/mis-areas" element={<MisAreas />} />
            <Route path="/inscripcion" element={<InscripcionIndividual />} />
            <Route path="/inscripcion-area" element={<InscripcionAreaEstudiante />} />
            <Route path="/inscripciones" element={<MisInscripciones />} />
            <Route path="/ocr" element={<div className="p-4">
              <h2>Verificar Comprobante de Pago</h2>
              <OCRScanner onTextExtracted={() => {}} />
            </div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default EstudiantePanel; 