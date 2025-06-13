import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { sendRegistrationEmail } from '../utils/emailService';
import InscripcionArea from './InscripcionArea';
import OrdenPagoTutor from './OrdenPagoTutor';
import RegistroExcel from './RegistroExcel';
import OrdenPagoConsolidada from './OrdenPagoConsolidada';
import GrupoOrdenPago from './GrupoOrdenPago';
import { FaDownload, FaFileInvoiceDollar, FaUsers, FaUserPlus, FaFileExcel, FaFileInvoice, FaGraduationCap, FaLayerGroup, FaFileAlt, FaSignOutAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import OCRScanner from './OCRScanner';
import { Modal, Button, Table, Form } from 'react-bootstrap';

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
    colegio: '',
    password: '',
    celular: ''
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
    setFormData(prev => {
      const newData = {
        ...prev,
      [name]: value
      };
      // When CI changes, update password to match
      if (name === 'ci') {
        newData.password = value;
      }
      return newData;
    });
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
      // Asegurar que el celular del tutor tenga un valor por defecto si es null
      const celularTutor = currentUser.celular || '70740632'; // Valor por defecto si no hay celular

      // Preparar datos del estudiante con los nombres de campos exactos que espera el backend
      const studentData = {
        email: formData.email,
        password: formData.ci, // Usar CI como contraseña
        tipoUsuario: 'estudiante',
        nombre: formData.nombre,
        apellidos: formData.apellido,
        ci: formData.ci,
        fechaNacimiento: formData.fechaNacimiento,
        curso: Number(formData.curso),
        colegio: Number(formData.colegio),
        tutor_id: currentUser.id,
        celular: formData.celular || '',
        nombreTutor: currentUser.nombre,
        apellidosTutor: currentUser.apellidos,
        emailTutor: currentUser.email,
        celularTutor: celularTutor, // Usar el valor por defecto si es necesario
        verification_code: '0000'
      };

      console.log('Enviando datos al backend:', studentData); // Para debug

      await apiService.registerUser(studentData);
      
      // Send registration email
      await sendRegistrationEmail(formData.email, formData.email, formData.ci);
      
      setFormData({
        nombre: '',
        apellido: '',
        ci: '',
        email: '',
        fechaNacimiento: '',
        curso: '3', 
        colegio: currentUser && currentUser.colegio ? currentUser.colegio : (colegios.length > 0 ? colegios[0].id : ''),
        password: '',
        celular: ''
      });
      
      setSuccess('Estudiante registrado exitosamente. Se ha enviado un correo con las credenciales.');
      
      if (refreshStudents) {
        refreshStudents();
      }
      
      setTimeout(() => {
        navigate('/tutor/estudiantes');
      }, 3000);
      
    } catch (err) {
      console.error('Error al registrar estudiante:', err);
      // Mostrar el mensaje de error específico del backend si está disponible
      const errorMessage = err.message || 'Error al registrar estudiante. Intente nuevamente.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.nombre) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) {
      nuevosErrores.nombre = 'El nombre solo debe contener letras y espacios';
    }
    
    if (!formData.apellido) {
      nuevosErrores.apellido = 'El apellido es requerido';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellido)) {
      nuevosErrores.apellido = 'El apellido solo debe contener letras y espacios';
    }
    
    if (!formData.ci) {
      nuevosErrores.ci = 'El CI es requerido';
    } else if (!/^\d+$/.test(formData.ci)) {
      nuevosErrores.ci = 'El CI debe contener solo números';
    }
    
    if (!formData.email) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = 'El email no es válido';
    }
    
    if (!formData.fechaNacimiento) {
      nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es requerida';
    } else {
      const fechaNacimiento = new Date(formData.fechaNacimiento);
      const fechaLimite = new Date('2017-07-01');
      if (fechaNacimiento >= fechaLimite) {
        nuevosErrores.fechaNacimiento = 'La fecha de nacimiento debe ser anterior a julio de 2017';
      }
    }
    
    if (!formData.curso) {
      nuevosErrores.curso = 'El curso es requerido';
    } else if (isNaN(formData.curso) || formData.curso < 1 || formData.curso > 12) {
      nuevosErrores.curso = 'El curso debe ser un número entre 1 y 12';
    }
    
    if (!formData.colegio) {
      nuevosErrores.colegio = 'El colegio es requerido';
    }
    
    if (!formData.celular) {
      nuevosErrores.celular = 'El celular es requerido';
    } else if (!/^[67]\d{7}$/.test(formData.celular)) {
      nuevosErrores.celular = 'El celular debe comenzar con 6 o 7 seguido de 7 dígitos';
    }
    
    setError(Object.values(nuevosErrores).join('\n'));
    return Object.keys(nuevosErrores).length === 0;
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
            pattern="[0-9]*"
            inputMode="numeric"
            placeholder="Ingrese solo números"
          />
          <small className="help-text">El CI será usado como contraseña inicial</small>
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
        
        <div className="form-group">
          <label htmlFor="celular">Celular del Estudiante</label>
          <input 
            type="tel" 
            id="celular" 
            name="celular" 
            value={formData.celular} 
            onChange={handleChange} 
            required 
            pattern="[67][0-9]{7}"
            placeholder="Ej: 70715425"
            title="Debe comenzar con 6 o 7 seguido de 7 dígitos"
          />
          <small className="help-text">Debe comenzar con 6 o 7 seguido de 7 dígitos</small>
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
const ListaEstudiantes = ({ colegioId }) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [convocatorias, setConvocatorias] = useState([]);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState(null);
  const [areas, setAreas] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Iniciando carga de convocatorias...');
    // Cargar convocatorias y datos iniciales
    const convocatoriasData = JSON.parse(localStorage.getItem('convocatorias') || '[]');
    console.log('Convocatorias en localStorage:', convocatoriasData);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    console.log('Fecha actual para comparación:', hoy.toLocaleDateString());

    // Filtrar convocatorias activas y dentro del período válido
    const convocatoriasActivas = convocatoriasData.filter(conv => {
      const fechaInicio = new Date(conv.fecha_inicio);
      const fechaFin = new Date(conv.fecha_fin);
      
      console.log(`Evaluando convocatoria ${conv.nombre}:`, {
        activa: conv.activa,
        fechaInicio: fechaInicio.toLocaleDateString(),
        fechaFin: fechaFin.toLocaleDateString(),
        esValida: conv.activa && fechaInicio <= hoy && fechaFin >= hoy
      });
      
      return conv.activa && fechaInicio <= hoy && fechaFin >= hoy;
    });

    console.log('Convocatorias activas filtradas:', convocatoriasActivas);
    setConvocatorias(convocatoriasActivas);
    
    // Si hay convocatorias activas, seleccionar la primera por defecto
    if (convocatoriasActivas.length > 0 && !convocatoriaSeleccionada) {
      setConvocatoriaSeleccionada(convocatoriasActivas[0]);
    }

    // Cargar inscripciones existentes
    const inscripcionesData = JSON.parse(localStorage.getItem('inscripcionesEstudiantes') || '[]');
    setInscripciones(inscripcionesData);

    // Cargar convocatoria actual y áreas
    const convocatoriaActual = JSON.parse(localStorage.getItem('convocatoriaActual'));
    const areasConvocatoria = JSON.parse(localStorage.getItem('areasConvocatoria')) || [];
    
    setAreas(areasConvocatoria);
  }, []);

  useEffect(() => {
    const fetchEstudiantes = async () => {
      if (!colegioId) {
        setError('No se pudo identificar el colegio del tutor');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getStudentsByCollege(colegioId);
        console.log('Estudiantes obtenidos:', response);
        setEstudiantes(response);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
        setError('No se pudieron cargar los estudiantes. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

    fetchEstudiantes();
  }, [colegioId]);

  const handleSelectStudent = (estudianteId) => {
    setSelectedStudents(prev => {
      if (prev.includes(estudianteId)) {
        return prev.filter(id => id !== estudianteId);
      } else {
        return [...prev, estudianteId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(estudiantes.map(e => e.id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Función para mostrar el modal
  const showAdvertencia = (title, message, type = 'warning') => {
    setModalConfig({ title, message, type });
    setShowModal(true);
  };

  // Función para verificar si un estudiante ya está inscrito en un área específica
  const isEstudianteInscritoEnArea = (estudianteId, areaId) => {
    return inscripciones.some(insc => 
      insc.estudiante_id === estudianteId && 
      insc.convocatoria_id === convocatoriaSeleccionada?.id &&
      insc.areas.some(area => area.id === areaId)
    );
  };

  // Función para verificar si un estudiante ya está inscrito en la convocatoria
  const isEstudianteInscrito = (estudianteId) => {
    return inscripciones.some(insc => 
      insc.estudiante_id === estudianteId && 
      insc.convocatoria_id === convocatoriaSeleccionada?.id
    );
  };

  const handleSeleccionarArea = (area) => {
    if (areas.length >= 2 && !areas.find(a => a.id === area.id)) {
      showAdvertencia(
        'Límite de áreas alcanzado',
        'Solo se pueden seleccionar hasta 2 áreas por estudiante.'
      );
      return;
    }
    
    setAreas(prev => {
      if (prev.find(a => a.id === area.id)) {
        return prev.filter(a => a.id !== area.id);
      } else {
        return [...prev, area];
      }
    });
  };

  const handleInscripcionGrupal = () => {
    // Validar convocatoria seleccionada
    if (!convocatoriaSeleccionada) {
      showAdvertencia(
        'Convocatoria no seleccionada',
        'Por favor, selecciona una convocatoria antes de inscribir estudiantes.'
      );
      return;
    }
    
    // Validar áreas seleccionadas
    if (areas.length === 0) {
      showAdvertencia(
        'Áreas no seleccionadas',
        'Por favor, selecciona al menos un área antes de inscribir estudiantes.'
      );
      return;
    }

    // Validar estudiantes seleccionados
    if (selectedStudents.length === 0) {
      showAdvertencia(
        'Estudiantes no seleccionados',
        'Por favor, selecciona al menos un estudiante para inscribir.'
      );
      return;
    }

    // Verificar inscripciones duplicadas
    const estudiantesYaInscritos = selectedStudents.filter(estudiante => 
      inscripciones.some(insc => 
        insc.estudiante_id === estudiante.id && 
        insc.convocatoria_id === convocatoriaSeleccionada.id
      )
    );

    if (estudiantesYaInscritos.length > 0) {
      showAdvertencia(
        'Estudiantes ya inscritos',
        `Los siguientes estudiantes ya están inscritos en esta convocatoria: ${estudiantesYaInscritos.map(e => e.nombre).join(', ')}`
      );
      return;
    }

    // Verificar áreas duplicadas
    const estudiantesConAreasDuplicadas = selectedStudents.filter(estudiante => 
      areas.some(area => 
        inscripciones.some(insc => 
          insc.estudiante_id === estudiante.id && 
          insc.convocatoria_id === convocatoriaSeleccionada.id &&
          insc.areas.some(a => a.id === area.id)
        )
      )
    );

    if (estudiantesConAreasDuplicadas.length > 0) {
      showAdvertencia(
        'Áreas ya inscritas',
        `Los siguientes estudiantes ya están inscritos en algunas de las áreas seleccionadas: ${estudiantesConAreasDuplicadas.map(e => e.nombre).join(', ')}`
      );
      return;
    }

    // Si todo está bien, proceder con la inscripción
    const nuevasInscripciones = selectedStudents.map(estudiante => ({
      id: Date.now() + Math.random(),
      estudiante_id: estudiante.id,
      estudiante_nombre: estudiante.nombre,
      convocatoria_id: convocatoriaSeleccionada.id,
      convocatoria_nombre: convocatoriaSeleccionada.nombre,
      areas: areas,
      fecha_inscripcion: new Date().toISOString(),
      estado: 'pendiente',
      tutor_id: JSON.parse(localStorage.getItem('currentUser')).id
    }));

    const todasLasInscripciones = [...inscripciones, ...nuevasInscripciones];
    localStorage.setItem('inscripcionesEstudiantes', JSON.stringify(todasLasInscripciones));
    setInscripciones(todasLasInscripciones);
    setSelectedStudents([]);
    setAreas([]);

    showAdvertencia(
      'Inscripción exitosa',
      `Se han inscrito ${selectedStudents.length} estudiantes en ${areas.length} área(s).`,
      'success'
    );
  };

  const handleInscripcion = (estudianteId) => {
    navigate(`/inscripcion/${estudianteId}`);
  };

  // Función para obtener el estado de inscripción de un estudiante
  const getEstadoInscripcion = (estudianteId) => {
    const inscripcion = inscripciones.find(insc => 
      insc.estudiante_id === estudianteId && 
      insc.convocatoria_id === convocatoriaSeleccionada?.id
    );
    
    if (!inscripcion) return { estado: 'No inscrito', variant: 'secondary' };
    
    switch (inscripcion.estado) {
      case 'pendiente':
        return { estado: 'Pendiente', variant: 'warning' };
      case 'confirmado':
        return { estado: 'Confirmado', variant: 'success' };
      case 'cancelado':
        return { estado: 'Cancelado', variant: 'danger' };
      default:
        return { estado: 'No inscrito', variant: 'secondary' };
    }
  };

  // Función para formatear el curso
  const formatearCurso = (curso) => {
    return curso <= 6 ? `${curso}° Primaria` : `${curso - 6}° Secundaria`;
  };

  // Función para manejar la edición de inscripción
  const handleEditarInscripcion = (estudiante) => {
    const inscripcion = inscripciones.find(insc => 
      insc.estudiante_id === estudiante.id && 
      insc.convocatoria_id === convocatoriaSeleccionada?.id
    );

    if (inscripcion) {
      // Mostrar modal de edición con opciones
      showAdvertencia(
        'Editar Inscripción',
        <div className="p-3">
          <div className="text-center mb-4">
            <i className="bi bi-person-circle text-success" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-2 text-success">{estudiante.nombre}</h5>
          </div>
          
          <div className="bg-light rounded p-3 mb-4">
            <h6 className="text-success mb-3">
              <i className="bi bi-info-circle me-2"></i>
              Inscripción Actual
            </h6>
            <div className="ms-3">
              <p className="mb-2">
                <strong>Convocatoria:</strong>
                <span className="badge bg-success ms-2">{inscripcion.convocatoria_nombre}</span>
              </p>
              <p className="mb-2">
                <strong>Áreas Inscritas:</strong>
                <div className="mt-1">
                  {inscripcion.areas.length > 0 ? (
                    inscripcion.areas.map(area => (
                      <span key={area.id} className="badge bg-success me-1 mb-1">
                        {area.nombre}
                      </span>
                    ))
                  ) : (
                    <span className="badge bg-warning">No hay áreas seleccionadas</span>
                  )}
                </div>
              </p>
              <p className="mb-0">
                <strong>Estado:</strong>
                <span className={`badge bg-${inscripcion.estado === 'confirmado' ? 'success' : 
                  inscripcion.estado === 'pendiente' ? 'warning' : 'danger'} ms-2`}>
                  {inscripcion.estado.charAt(0).toUpperCase() + inscripcion.estado.slice(1)}
                </span>
              </p>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <button 
              className="btn btn-outline-danger"
              onClick={() => {
                // Lógica para cancelar inscripción
                const nuevasInscripciones = inscripciones.filter(insc => 
                  !(insc.estudiante_id === estudiante.id && insc.convocatoria_id === convocatoriaSeleccionada.id)
                );
                localStorage.setItem('inscripcionesEstudiantes', JSON.stringify(nuevasInscripciones));
                setInscripciones(nuevasInscripciones);
                setShowModal(false);
                showAdvertencia(
                  'Inscripción Cancelada',
                  <div className="text-center p-3">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                    <h5 className="mt-3 text-success">¡Operación Exitosa!</h5>
                    <p className="mb-0">La inscripción de {estudiante.nombre} ha sido cancelada correctamente.</p>
                  </div>,
                  'success'
                );
              }}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar Inscripción
            </button>
          </div>
        </div>,
        'info'
      );
    } else {
      showAdvertencia(
        'Inscribir Estudiante',
        <div className="text-center p-3">
          <i className="bi bi-person-plus text-success" style={{ fontSize: '3rem' }}></i>
          <h5 className="mt-3 text-success">¿Inscribir Estudiante?</h5>
          <p className="mb-0">¿Deseas inscribir a {estudiante.nombre} en la convocatoria actual?</p>
        </div>,
        'info'
      );
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center p-4">
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger m-4" role="alert">
      {error}
    </div>
  );

  return (
    <div className="container-fluid p-4">
      <div className="card">
        <div className="card-header bg-success text-white">
          <div className="d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Lista de Estudiantes</h5>
            </div>
            {convocatorias.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {convocatorias.map(conv => (
                  <div 
                    key={conv.id}
                    className={`card ${convocatoriaSeleccionada?.id === conv.id ? 'border-success' : 'border-secondary'}`}
                    style={{ 
                      width: '200px', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      setConvocatoriaSeleccionada(conv);
                      setAreas([]); // Limpiar áreas al cambiar convocatoria
                    }}
                  >
                    <div className={`card-body p-3 ${convocatoriaSeleccionada?.id === conv.id ? 'bg-success text-white' : ''}`}>
                      <h6 className="card-title mb-2">{conv.nombre}</h6>
                      <p className="card-text small mb-0">
                        {new Date(conv.fecha_inicio).toLocaleDateString()} - {new Date(conv.fecha_fin).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-warning mb-0 py-1 px-3">
                No hay convocatorias activas
              </div>
            )}
          </div>
        </div>

        {convocatoriaSeleccionada && (
          <div className="card border-success m-3">
            <div className="card-header bg-light">
              <h6 className="mb-0">Áreas disponibles para {convocatoriaSeleccionada.nombre}</h6>
              <small className="text-muted">
                Seleccione hasta {convocatoriaSeleccionada.maximo_areas} áreas
              </small>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2 mt-3">
                {convocatoriaSeleccionada?.areas.map(area => (
                  <div
                    key={area.id}
                    className={`card ${areas.some(a => a.id === area.id) ? 'border-success' : 'border-secondary'}`}
                    style={{ 
                      width: '200px', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleSeleccionarArea(area)}
                  >
                    <div className={`card-body p-3 ${areas.some(a => a.id === area.id) ? 'bg-success text-white' : ''}`}>
                      <h6 className="card-title mb-2">{area.nombre}</h6>
                      <p className="card-text small mb-0">
                        {area.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}
          
        <div className="card-body">
          {convocatoriaSeleccionada && areas.length > 0 && (
            <div className="d-flex justify-content-end mb-3">
                    <button 
                onClick={handleInscripcionGrupal}
                className="btn btn-success"
                disabled={selectedStudents.length === 0}
                    >
                Inscribir Seleccionados ({selectedStudents.length})
                    </button>
            </div>
          )}
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-success">
                <tr>
                  <th className="border-success">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedStudents.length === estudiantes.length}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="border-success">Nombre Completo</th>
                  <th className="border-success">CI</th>
                  <th className="border-success">Curso</th>
                  <th className="border-success">Email</th>
                  <th className="border-success">Celular</th>
                  <th className="border-success text-center">Estado</th>
                  <th className="border-success text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map(estudiante => {
                  const { estado, variant } = getEstadoInscripcion(estudiante.id);
                  const yaInscrito = isEstudianteInscrito(estudiante.id);
                  
                  return (
                    <tr key={estudiante.id}>
                      <td className="border-success">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedStudents.some(s => s.id === estudiante.id)}
                            onChange={() => handleSelectStudent(estudiante)}
                            disabled={yaInscrito}
                          />
                        </div>
                      </td>
                      <td className="border-success">{`${estudiante.nombre} ${estudiante.apellidos}`}</td>
                      <td className="border-success">{estudiante.ci}</td>
                      <td className="border-success">{formatearCurso(estudiante.curso)}</td>
                      <td className="border-success">
                        <a href={`mailto:${estudiante.email}`} className="text-decoration-none">
                          {estudiante.email}
                        </a>
                      </td>
                      <td className="border-success">{estudiante.celular || 'No disponible'}</td>
                      <td className="border-success text-center">
                        <span className={`badge bg-${variant}`}>
                          {estado}
                        </span>
                      </td>
                      <td className="border-success text-center">
                        <button
                          onClick={() => handleEditarInscripcion(estudiante)}
                          className={`btn btn-${yaInscrito ? 'warning' : 'success'} btn-sm`}
                        >
                          <i className={`bi ${yaInscrito ? 'bi-pencil-square' : 'bi-plus-circle'} me-1`}></i>
                          {yaInscrito ? 'Editar Inscripción' : 'Inscribir'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de advertencia/éxito */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header 
          className={`border-0 ${modalConfig.type === 'success' ? 'bg-success' : 
            modalConfig.type === 'info' ? 'bg-info' : 'bg-warning'} text-white`}
        >
          <Modal.Title className="d-flex align-items-center">
            {modalConfig.type === 'success' ? (
              <i className="bi bi-check-circle-fill me-2"></i>
            ) : modalConfig.type === 'info' ? (
              <i className="bi bi-info-circle-fill me-2"></i>
            ) : (
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
            )}
            {modalConfig.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          {modalConfig.message}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <button 
            className={`btn btn-${modalConfig.type === 'success' ? 'success' : 
              modalConfig.type === 'info' ? 'info' : 'warning'} px-4`}
            onClick={() => setShowModal(false)}
          >
            Aceptar
          </button>
        </Modal.Footer>
      </Modal>

      <style>
        {`
          .custom-modal .modal-content {
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            border: none;
          }
          .custom-modal .modal-header {
            border-top-left-radius: 15px;
            border-top-right-radius: 15px;
            padding: 1rem 1.5rem;
          }
          .custom-modal .modal-body {
            padding: 1.5rem;
          }
          .custom-modal .modal-footer {
            border-bottom-left-radius: 15px;
            border-bottom-right-radius: 15px;
            padding: 1rem 1.5rem;
          }
          .custom-modal .btn {
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
            padding: 0.5rem 1.5rem;
          }
          .custom-modal .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }
          .custom-modal .badge {
            font-size: 0.9em;
            padding: 0.5em 0.8em;
          }
        `}
      </style>
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
            <li className="mt-auto" style={{ marginTop: '30px' }}>
              <button onClick={handleLogout} className="logout-button" style={{ width: '100%', textAlign: 'left', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderLeft: '2px solid rgba(255, 255, 255, 0.2)' }}>
                <FaSignOutAlt style={{ marginRight: '8px' }} /> Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="tutor-header">
          <div className="d-flex justify-content-between align-items-center">
            <h1>Bienvenido, {currentUser?.nombre || 'Tutor'}</h1>
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
            <Route path="/estudiantes" element={<ListaEstudiantes colegioId={currentUser?.colegio_id} />} />
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