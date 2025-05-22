import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import InscripcionArea from './InscripcionArea';
import OrdenPagoTutor from './OrdenPagoTutor';
import RegistroExcel from './RegistroExcel';
import OrdenPagoConsolidada from './OrdenPagoConsolidada';
import GrupoOrdenPago from './GrupoOrdenPago';
import { obtenerOrdenesGrupalesPorTutor, obtenerOrdenGrupalDeEstudiante } from './utils/ordenesGrupales';
import { FaDownload, FaFileInvoiceDollar, FaUsers, FaUserPlus, FaFileExcel, FaFileInvoice, FaGraduationCap, FaLayerGroup, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import OCRScanner from './OCRScanner';

// Componente para registro de estudiantes
const RegistroEstudiantes = () => {
  const navigate = useNavigate();
  const { currentUser, refreshStudents } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    email: '',
    fechaNacimiento: '',
    curso: '3', 
    colegio: ''
  });
  const [colegios, setColegios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fechaLimite = '2017-06-30';

  useEffect(() => {
    const fetchColegios = async () => {
      try {
        const data = await apiService.getAllColleges();
        setColegios(data);
        
        if (currentUser && currentUser.colegio) {
          setFormData(prev => ({ ...prev, colegio: currentUser.colegio }));
        } else if (data.length > 0) {
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
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validarFormulario = () => {
    if (formData.fechaNacimiento) {
      const fechaSeleccionada = new Date(formData.fechaNacimiento);
      const fechaMax = new Date(fechaLimite);
      
      if (fechaSeleccionada > fechaMax) {
        setError('Solo se permiten fechas anteriores a Julio de 2017');
        return false;
      }
    } else {
      setError('La fecha de nacimiento es requerida');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    if (!validarFormulario()) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      await apiService.registerStudentByTutor(currentUser.id, {
        ...formData,
        curso: Number(formData.curso),
        tutorId: currentUser.id
      });
      
      setFormData({
        nombre: '',
        apellido: '',
        ci: '',
        email: '',
        fechaNacimiento: '',
        curso: '3', 
        colegio: currentUser && currentUser.colegio ? currentUser.colegio : (colegios.length > 0 ? colegios[0].id : '')
      });
      
      setSuccess('Estudiante registrado exitosamente');
      
      if (refreshStudents) {
        refreshStudents();
      }
      
      setTimeout(() => {
        navigate('/tutor');
      }, 1500);
      
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
          <label htmlFor="email">Correo Electrónico</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
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
            max={fechaLimite}
            required 
          />
          <small className="help-text">Debe ser anterior a Julio de 2017</small>
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
            disabled={currentUser && currentUser.colegio}
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
          {currentUser && currentUser.colegio && (
            <p className="info-message">Los estudiantes serán registrados automáticamente a tu colegio.</p>
          )}
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
  const [ordenesGrupales, setOrdenesGrupales] = useState([]);
  const [gruposEstudiantes, setGruposEstudiantes] = useState({});
  const [estudiantesSinGrupo, setEstudiantesSinGrupo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [descargandoPDF, setDescargandoPDF] = useState(false);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Obtener estudiantes del tutor (incluirlos todos para poder mostrar el botón correcto)
      const studentsData = await getStudentsByTutor(currentUser.id);
      console.log('Estudiantes obtenidos:', studentsData);
      
      // Actualizar los datos de los estudiantes desde localStorage
      // Esto garantiza que tengamos los datos más recientes, incluso después de generar órdenes
      const studentsKey = 'olimpiadas_students';
      const localStudents = JSON.parse(localStorage.getItem(studentsKey) || '[]');
      
      // Combinar datos de la API con los de localStorage (prevalecen los de localStorage)
      const updatedStudents = studentsData.map(student => {
        const localStudent = localStudents.find(s => s.id === student.id);
        if (localStudent) {
          // Combinar propiedades, dando prioridad a las de localStorage
          return { ...student, ...localStudent };
        }
        return student;
      });
      
      // Obtener las órdenes de pago grupales del tutor actual
      const ordenesTutor = obtenerOrdenesGrupalesPorTutor(currentUser.id);
      setOrdenesGrupales(ordenesTutor);
      
      // Organizar estudiantes por órdenes grupales
      const gruposPorOrden = {};
      const estudiantesSolos = [];
      
      // Clasificar cada estudiante
      updatedStudents.forEach(estudiante => {
        // Verificar si el estudiante pertenece a una orden grupal
        const ordenGrupal = obtenerOrdenGrupalDeEstudiante(estudiante.id);
        
        if (ordenGrupal) {
          // Si existe una orden grupal, agregar al grupo correspondiente
          if (!gruposPorOrden[ordenGrupal.id]) {
            gruposPorOrden[ordenGrupal.id] = [];
          }
          gruposPorOrden[ordenGrupal.id].push(estudiante);
        } else {
          // Si no pertenece a ninguna orden grupal, es un estudiante individual
          estudiantesSolos.push(estudiante);
        }
      });
      
      // Actualizar el estado con los grupos organizados
      setGruposEstudiantes(gruposPorOrden);
      setEstudiantesSinGrupo(estudiantesSolos);
      setStudents(updatedStudents); // Mantener también la lista completa para referencia
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setError('No se pudieron cargar los estudiantes. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentUser.id]);

  useEffect(() => {
    const handleFocus = () => {
      console.log('Ventana enfocada, refrescando datos de estudiantes...');
      fetchStudents();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleInscripcion = (studentId) => {
    navigate(`/tutor/inscripcion/${studentId}`);
  };
  
  // Verificar si un estudiante ya tiene orden de pago
  const tieneOrdenPago = (student) => {
    return (
      // Verificar si tiene el objeto ordenPago o si tiene boletaPago
      (student.ordenPago && student.ordenPago.id) || 
      (student.boletaPago && student.boletaPago.id)
    );
  };
  
  // Manejar la generación de una nueva orden
  const handleGenerarOrden = (studentId) => {
    // Verificar si el estudiante tiene áreas inscritas
    const student = students.find(s => s.id === studentId);
    if (!student.areasInscritas || student.areasInscritas.length === 0) {
      setError('El estudiante debe estar inscrito en al menos un área académica para generar una orden de pago.');
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    // Si ya tiene una orden, no debería llegar aquí, pero por si acaso
    if (tieneOrdenPago(student)) {
      setError('Este estudiante ya tiene una orden de pago generada. Solo puede descargarla.');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    navigate(`/tutor/orden-pago/${studentId}`);
  };
  
  // Manejar la descarga de una orden existente
  const handleDescargarOrden = async (studentId) => {
    try {
      setDescargandoPDF(true);
      
      const student = students.find(s => s.id === studentId);
      if (!student) {
        throw new Error('Estudiante no encontrado');
      }
      
      // Obtener la orden de pago (usar ordenPago o boletaPago según esté disponible)
      const ordenId = (student.ordenPago && student.ordenPago.id) || 
                     (student.boletaPago && student.boletaPago.id);
      
      if (!ordenId) {
        throw new Error('No se encontró una orden de pago para este estudiante');
      }
      
      // Descargar la orden usando el servicio API
      const pdfBlob = await apiService.descargarOrdenPDF(ordenId);
      
      // Crear URL para el blob y forzar descarga
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orden_pago_${ordenId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Mostrar mensaje de éxito
      setSuccess('Orden de pago descargada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error al descargar orden de pago:', err);
      setError('No se pudo descargar la orden de pago. Intenta nuevamente.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setDescargandoPDF(false);
    }
  };

  if (loading) {
    return <p>Cargando estudiantes...</p>;
  }

  return (
    <div className="estudiantes-container">
      <h2>Mis Estudiantes</h2>
      
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message" style={{ color: '#28a745', fontWeight: 'bold' }}>{success}</p>}
      
      {students.length === 0 ? (
        <div className="no-estudiantes">
          <p>No hay estudiantes registrados.</p>
          <Link to="/tutor/registrar" className="button">Registrar un Estudiante</Link>
        </div>
      ) : (
        <div className="estudiantes-container">
          {/* Sección de órdenes de pago grupales */}
          {Object.keys(gruposEstudiantes).length > 0 && (
            <div className="ordenes-grupales-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaLayerGroup /> Órdenes de Pago Grupales
              </h3>
              
              <div className="grupos-list">
                {Object.entries(gruposEstudiantes).map(([ordenId, estudiantes]) => (
                  <GrupoOrdenPago 
                    key={ordenId}
                    ordenId={ordenId}
                    estudiantes={estudiantes}
                    onRefresh={fetchStudents}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Sección de estudiantes individuales */}
          <div className="estudiantes-individuales-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaUsers /> Estudiantes Individuales
            </h3>
            
            <div className="estudiantes-list">
              {estudiantesSinGrupo.map(student => (
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
                    {student.areasInscritas && student.areasInscritas.length > 0 && (
                      <div className="orden-pago-container" style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '10px' }}>
                        {tieneOrdenPago(student) ? (
                          <button 
                            onClick={() => handleDescargarOrden(student.id)}
                            className="orden-pago-button descargar"
                            style={{ 
                              margin: '0 auto', 
                              backgroundColor: '#28a745',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                            disabled={descargandoPDF}
                            data-component-name="ListaEstudiantes"
                          >
                            <FaDownload /> {descargandoPDF ? 'Descargando...' : 'Descargar Orden de Pago'}
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleGenerarOrden(student.id)}
                            className="orden-pago-button generar"
                            style={{ 
                              margin: '0 auto',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                            data-component-name="ListaEstudiantes"
                          >
                            <FaFileInvoiceDollar /> Generar Orden de Pago
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {estudiantesSinGrupo.length === 0 && (
                <p className="no-estudiantes-individuales">No hay estudiantes individuales disponibles.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal del panel de tutor
function TutorPanel() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Iniciando cierre de sesión...");
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Forzar la redirección incluso si hay error
      window.location.href = '/';
    }
  };

  return (
    <div className="tutor-panel">
      <aside className="sidebar">
        <div className="logo" onClick={() => navigate('/tutor')} style={{ cursor: 'pointer' }}>
          <img src="/logo_umss.png" alt="Logo UMSS" />
          <img src="/logoTutor.png" alt="Logo Tutor" className="user-role-logo-small" />
          <h2>Panel de Tutor</h2>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/tutor/estudiantes">Mis Estudiantes</Link>
            </li>
            <li>
              <Link to="/tutor/registrar">Registrar Estudiante</Link>
            </li>
            <li>
              <Link to="/tutor/registrar-excel">Registrar por Excel</Link>
            </li>
            <li>
              <Link to="/tutor/orden-consolidada">Orden de Pago Grupal</Link>
            </li>
            <li>
              <Link to="/tutor/ocr">Verificar Comprobante de Pago</Link>
            </li>

          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="tutor-header">
          <div className="d-flex justify-content-between align-items-center">
            <h1>Bienvenido, {currentUser?.nombre || 'Tutor'}</h1>
            <button 
              onClick={handleLogout} 
              className="btn btn-outline-danger"
              style={{
                padding: '8px 16px',
                fontSize: '16px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaSignOutAlt />
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div className="tutor-content">
          <Routes>
            <Route path="/" element={
              <div className="dashboard-overview">
                <h2>Dashboard</h2>
                <p>Bienvenido al panel de tutor de las Olimpiadas Escolares 2025.</p>
                <div className="quick-links">
                  <Link to="/tutor/estudiantes" className="quick-link-card">
                    <div className="quick-link-icon">
                      <FaUsers size={36} color="#3498db" />
                    </div>
                    <div className="quick-link-text">
                      <h3>Mis Estudiantes</h3>
                      <p>Ver y gestionar los estudiantes a su cargo.</p>
                    </div>
                  </Link>
                  <Link to="/tutor/registrar" className="quick-link-card">
                    <div className="quick-link-icon">
                      <FaUserPlus size={36} color="#27ae60" />
                    </div>
                    <div className="quick-link-text">
                      <h3>Registrar Estudiante</h3>
                      <p>Añadir un nuevo estudiante bajo su tutoría.</p>
                    </div>
                  </Link>
                  <Link to="/tutor/registrar-excel" className="quick-link-card">
                    <div className="quick-link-icon">
                      <FaFileExcel size={36} color="#16a085" />
                    </div>
                    <div className="quick-link-text">
                      <h3>Registrar por Excel</h3>
                      <p>Registrar múltiples estudiantes mediante una plantilla Excel.</p>
                    </div>
                  </Link>
                  <Link to="/tutor/orden-consolidada" className="quick-link-card">
                    <div className="quick-link-icon">
                      <FaFileInvoice size={36} color="#e74c3c" />
                    </div>
                    <div className="quick-link-text">
                      <h3>Orden de Pago Grupal</h3>
                      <p>Generar una orden de pago consolidada para varios estudiantes.</p>
                    </div>
                  </Link>
                  <Link to="/tutor/ocr" className="quick-link-card">
                    <div className="quick-link-icon">
                      <FaFileAlt size={36} color="#9b59b6" />
                    </div>
                    <div className="quick-link-text">
                      <h3>Verificar Comprobante de Pago</h3>
                      <p>Verificar comprobante de pago mediante OCR</p>
                    </div>
                  </Link>
                </div>

              </div>
            } />
            <Route path="/estudiantes" element={<ListaEstudiantes />} />
            <Route path="/registrar" element={<RegistroEstudiantes />} />
            <Route path="/registrar-excel" element={<RegistroExcel />} />
            <Route path="/orden-consolidada" element={<OrdenPagoConsolidada />} />
            <Route path="/inscripcion/:studentId" element={<InscripcionArea />} />
            <Route path="/orden-pago/:studentId" element={<OrdenPagoTutor />} />
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

export default TutorPanel; 