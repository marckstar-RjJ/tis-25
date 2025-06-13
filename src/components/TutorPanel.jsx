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
const ListaEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  const fetchStudents = async () => {
    try {
        if (!currentUser?.colegio_id) {
          console.error('No se encontró el colegio_id del tutor');
          setError('No se pudo obtener la información del colegio');
          return;
        }
        const data = await apiService.getStudentsByCollege(currentUser.colegio_id);
        console.log('Estudiantes obtenidos:', data);
        setEstudiantes(data);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
        setError('Error al cargar la lista de estudiantes');
    } finally {
      setLoading(false);
    }
  };

    fetchStudents();
  }, [currentUser]);

  const handleInscripcion = (estudianteId) => {
    navigate(`/inscripcion/${estudianteId}`);
  };

  if (loading) return <div className="text-center p-4">Cargando estudiantes...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CI</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Celular</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {estudiantes.map((estudiante) => (
            <tr key={estudiante.id}>
              <td className="px-6 py-4 whitespace-nowrap">{`${estudiante.nombre} ${estudiante.apellidos}`}</td>
              <td className="px-6 py-4 whitespace-nowrap">{estudiante.ci}</td>
              <td className="px-6 py-4 whitespace-nowrap">{estudiante.curso}</td>
              <td className="px-6 py-4 whitespace-nowrap">{estudiante.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{estudiante.celular}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                  onClick={() => handleInscripcion(estudiante.id)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                  Inscribir
                    </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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