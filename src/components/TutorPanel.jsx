import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import InscripcionArea from './InscripcionArea';

// Componente para registro de estudiantes
const RegistroEstudiantes = () => {
  const { currentUser, refreshStudents } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    fechaNacimiento: '',
    curso: '1',
    colegio: ''
  });
  const [colegios, setColegios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar la lista de colegios disponibles
  useEffect(() => {
    const fetchColegios = async () => {
      try {
        const data = await apiService.getAllColleges();
        setColegios(data);
        
        // Si hay colegios, establecer el primero como valor predeterminado
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, colegio: data[0].id }));
        }
      } catch (err) {
        console.error('Error al cargar colegios:', err);
        setError('No se pudieron cargar los colegios disponibles. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchColegios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Crear un nuevo estudiante bajo el tutor actual
      await apiService.registerStudentByTutor(currentUser.id, {
        ...formData,
        curso: Number(formData.curso),
        tutorId: currentUser.id
      });
      
      // Restablecer el formulario
      setFormData({
        nombre: '',
        apellido: '',
        ci: '',
        fechaNacimiento: '',
        curso: '1',
        colegio: colegios.length > 0 ? colegios[0].id : ''
      });
      
      setSuccess('Estudiante registrado exitosamente');
      
      // Refrescar la lista de estudiantes en el contexto de autenticación
      if (refreshStudents) {
        refreshStudents();
      }
    } catch (err) {
      console.error('Error al registrar estudiante:', err);
      setError(err.message || 'Error al registrar estudiante. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p>Cargando información...</p>;
  }

  return (
    <div className="registro-estudiantes">
      <h2>Registrar Nuevo Estudiante</h2>
      
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      
      <form onSubmit={handleSubmit} className="registro-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input 
            type="text" 
            id="nombre" 
            name="nombre" 
            value={formData.nombre} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="apellido">Apellido</label>
          <input 
            type="text" 
            id="apellido" 
            name="apellido" 
            value={formData.apellido} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="ci">Carnet de Identidad</label>
          <input 
            type="text" 
            id="ci" 
            name="ci" 
            value={formData.ci} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
          <input 
            type="date" 
            id="fechaNacimiento" 
            name="fechaNacimiento" 
            value={formData.fechaNacimiento} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="curso">Curso</label>
          <select 
            id="curso" 
            name="curso" 
            value={formData.curso} 
            onChange={handleChange} 
            required
          >
            <option value="1">1° Primaria</option>
            <option value="2">2° Primaria</option>
            <option value="3">3° Primaria</option>
            <option value="4">4° Primaria</option>
            <option value="5">5° Primaria</option>
            <option value="6">6° Primaria</option>
            <option value="7">1° Secundaria</option>
            <option value="8">2° Secundaria</option>
            <option value="9">3° Secundaria</option>
            <option value="10">4° Secundaria</option>
            <option value="11">5° Secundaria</option>
            <option value="12">6° Secundaria</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="colegio">Colegio</label>
          <select 
            id="colegio" 
            name="colegio" 
            value={formData.colegio} 
            onChange={handleChange} 
            required
          >
            {colegios.length === 0 ? (
              <option value="">No hay colegios disponibles</option>
            ) : (
              colegios.map(colegio => (
                <option key={colegio.id} value={colegio.id}>
                  {colegio.nombre}
                </option>
              ))
            )}
          </select>
        </div>
        
        <button 
          type="submit" 
          className="submit-button" 
          disabled={isSubmitting || colegios.length === 0}
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Estudiante'}
        </button>
      </form>
    </div>
  );
};

// Componente para listar estudiantes del tutor
const ListaEstudiantes = () => {
  const { getStudentsByTutor, currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsData = await getStudentsByTutor(currentUser.id);
        setStudents(studentsData);
      } catch (err) {
        console.error('Error al cargar estudiantes:', err);
        setError('No se pudo cargar la lista de estudiantes. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [getStudentsByTutor, currentUser.id]);

  const handleInscripcion = (studentId) => {
    // Navegar a la página de inscripción individual con el ID del estudiante
    navigate(`/tutor/inscripcion/${studentId}`);
  };

  if (loading) {
    return <p>Cargando estudiantes...</p>;
  }

  return (
    <div className="estudiantes-container">
      <h2>Mis Estudiantes</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      {students.length === 0 ? (
        <div className="no-estudiantes">
          <p>No hay estudiantes registrados.</p>
          <Link to="/tutor/registrar" className="button">Registrar un Estudiante</Link>
        </div>
      ) : (
        <div className="estudiantes-list">
          {students.map(student => (
            <div key={student.id} className="estudiante-card">
              <h3>{student.nombre} {student.apellido}</h3>
              <div className="estudiante-info">
                <p><strong>CI:</strong> {student.ci}</p>
                <p><strong>Curso:</strong> {
                  student.curso <= 6 
                    ? `${student.curso}° Primaria` 
                    : `${student.curso - 6}° Secundaria`
                }</p>
                <p><strong>Colegio:</strong> {student.colegio?.nombre || 'No asignado'}</p>
              </div>
              <div className="estudiante-actions">
                <button 
                  onClick={() => handleInscripcion(student.id)}
                  className="inscripcion-button"
                >
                  {student.areasInscritas && student.areasInscritas.length > 0 
                    ? 'Ver/Modificar Inscripción' 
                    : 'Inscribir en Áreas'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente principal del panel de tutor
function TutorPanel() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="tutor-panel">
      <aside className="sidebar">
        <div className="logo">
          <img src="/logo_umss.png" alt="Logo UMSS" />
          <h2>Panel de Tutor</h2>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/tutor">Dashboard</Link>
            </li>
            <li>
              <Link to="/tutor/estudiantes">Mis Estudiantes</Link>
            </li>
            <li>
              <Link to="/tutor/registrar">Registrar Estudiante</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="tutor-header">
          <h1>Bienvenido, {currentUser?.nombre || 'Tutor'}</h1>
        </header>

        <div className="tutor-content">
          <Routes>
            <Route path="/" element={
              <div className="dashboard-overview">
                <h2>Dashboard</h2>
                <p>Bienvenido al panel de tutor de las Olimpiadas Escolares 2025.</p>
                <div className="quick-links">
                  <Link to="/tutor/estudiantes" className="quick-link-card">
                    <h3>Mis Estudiantes</h3>
                    <p>Ver y gestionar los estudiantes a su cargo.</p>
                  </Link>
                  <Link to="/tutor/registrar" className="quick-link-card">
                    <h3>Registrar Estudiante</h3>
                    <p>Añadir un nuevo estudiante bajo su tutoría.</p>
                  </Link>
                </div>
              </div>
            } />
            <Route path="/estudiantes" element={<ListaEstudiantes />} />
            <Route path="/registrar" element={<RegistroEstudiantes />} />
            <Route path="/inscripcion/:studentId" element={<InscripcionArea />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default TutorPanel; 