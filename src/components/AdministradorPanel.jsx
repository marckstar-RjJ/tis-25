import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import AdminConvocatorias from './convocatorias/AdminConvocatorias';
import { FaCog, FaSchool, FaCalendarAlt, FaGraduationCap, FaMedal, FaSignOutAlt } from 'react-icons/fa';

// Componente para la configuración de olimpiadas
const ConfiguracionOlimpiadas = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    precioPorArea: 0,
    maxAreasEstudiante: 0,
    activa: true
  });

  // Formatear las fechas para el input date
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  };
  
  useEffect(() => {
    // Cargar todas las convocatorias disponibles
    const cargarConvocatorias = () => {
      try {
        setLoading(true);
        // Obtener convocatorias desde localStorage
        const convocatoriasKey = 'olimpiadas_convocatorias';
        const data = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
        
        // Verificar si hay convocatorias
        if (data.length === 0) {
          setError('No hay convocatorias disponibles. Por favor, crea una convocatoria primero.');
          setConvocatorias([]);
        } else {
          setConvocatorias(data);
          // Seleccionar la primera convocatoria por defecto
          setSelectedConvocatoriaId(data[0].id);
          cargarDatosConvocatoria(data[0]);
        }
      } catch (err) {
        console.error('Error al cargar convocatorias:', err);
        setError('No se pudieron cargar las convocatorias disponibles.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarConvocatorias();
  }, []);
  
  // Cargar los datos de una convocatoria específica
  const cargarDatosConvocatoria = (convocatoria) => {
    try {
      if (!convocatoria) return;
      
      setFormData({
        nombre: convocatoria.nombre || '',
        fechaInicio: formatDate(convocatoria.fecha_inicio_inscripciones),
        fechaFin: formatDate(convocatoria.fecha_fin_inscripciones),
        precioPorArea: convocatoria.costo_por_area || 16,
        maxAreasEstudiante: convocatoria.maximo_areas || 2,
        activa: convocatoria.activa !== undefined ? convocatoria.activa : true
      });
    } catch (err) {
      console.error('Error al cargar datos de la convocatoria:', err);
      setError('Error al cargar los datos de la convocatoria seleccionada.');
    }
  };
  
  // Manejar el cambio de convocatoria seleccionada
  const handleConvocatoriaChange = (e) => {
    const convocatoriaId = e.target.value;
    setSelectedConvocatoriaId(convocatoriaId);
    
    // Buscar la convocatoria seleccionada y cargar sus datos
    const convocatoriaSeleccionada = convocatorias.find(c => c.id === convocatoriaId);
    if (convocatoriaSeleccionada) {
      cargarDatosConvocatoria(convocatoriaSeleccionada);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedConvocatoriaId) {
      setError('Debe seleccionar una convocatoria para configurar');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Actualizar la convocatoria en localStorage
      const convocatoriasKey = 'olimpiadas_convocatorias';
      const convocatoriasActuales = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
      const index = convocatoriasActuales.findIndex(c => c.id === selectedConvocatoriaId);
      
      if (index === -1) {
        throw new Error('La convocatoria seleccionada no existe');
      }
      
      // Obtener areas de la convocatoria actual para mantenerlas
      const areasActuales = convocatoriasActuales[index].areas || [];
      
      // Crear objeto actualizado
      const convocatoriaActualizada = {
        ...convocatoriasActuales[index],
        nombre: formData.nombre,
        fecha_inicio_inscripciones: new Date(formData.fechaInicio).toISOString(),
        fecha_fin_inscripciones: new Date(formData.fechaFin).toISOString(),
        costo_por_area: parseFloat(formData.precioPorArea),
        maximo_areas: parseInt(formData.maxAreasEstudiante),
        activa: formData.activa,
        areas: areasActuales
      };
      
      // Actualizar en localStorage
      convocatoriasActuales[index] = convocatoriaActualizada;
      localStorage.setItem(convocatoriasKey, JSON.stringify(convocatoriasActuales));
      
      // Actualizar la lista de convocatorias
      setConvocatorias(convocatoriasActuales);
      
      alert('Configuración de la olimpiada actualizada con éxito');
    } catch (err) {
      console.error('Error al actualizar configuración:', err);
      setError('No se pudo actualizar la configuración. ' + (err.message || 'Intente nuevamente.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p>Cargando convocatorias...</p>;
  }

  return (
    <div className="config-container">
      <h2>Configuración de Olimpiadas</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Selector de Convocatoria */}
      <div className="form-group mb-4">
        <label htmlFor="convocatoriaSelect">Seleccionar Olimpiada a Configurar:</label>
        <select 
          id="convocatoriaSelect" 
          className="form-select form-select-lg mb-3"
          value={selectedConvocatoriaId} 
          onChange={handleConvocatoriaChange}
          disabled={convocatorias.length === 0}
        >
          {convocatorias.length === 0 ? (
            <option value="">No hay convocatorias disponibles</option>
          ) : (
            convocatorias.map(conv => (
              <option key={conv.id} value={conv.id}>
                {conv.nombre}
              </option>
            ))
          )}
        </select>
      </div>
      
      {selectedConvocatoriaId && (
        <form onSubmit={handleSubmit} className="config-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la Olimpiada</label>
            <input 
              type="text" 
              id="nombre" 
              className="form-control"
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="fechaInicio">Fecha de Inicio de Inscripciones</label>
            <input 
              type="date" 
              id="fechaInicio" 
              className="form-control"
              name="fechaInicio" 
              value={formData.fechaInicio} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="fechaFin">Fecha de Fin de Inscripciones</label>
            <input 
              type="date" 
              id="fechaFin" 
              className="form-control"
              name="fechaFin" 
              value={formData.fechaFin} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="precioPorArea">Precio por Área ($)</label>
            <input 
              type="number" 
              id="precioPorArea" 
              className="form-control"
              name="precioPorArea" 
              value={formData.precioPorArea} 
              onChange={handleChange} 
              min="1" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="maxAreasEstudiante">Máximo de Áreas por Estudiante</label>
            <input 
              type="number" 
              id="maxAreasEstudiante" 
              className="form-control"
              name="maxAreasEstudiante" 
              value={formData.maxAreasEstudiante} 
              onChange={handleChange} 
              min="1" 
              max="10" 
              required 
            />
          </div>
          
          <div className="form-check mb-3">
            <input 
              type="checkbox" 
              id="activa" 
              className="form-check-input"
              name="activa" 
              checked={formData.activa} 
              onChange={handleChange} 
            />
            <label htmlFor="activa" className="form-check-label">Olimpiada Activa</label>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </form>
      )}
    </div>
  );
};

// Componente para la gestión de colegios
const GestionColegios = () => {
  const [colegios, setColegios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newColegio, setNewColegio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchColegios = async () => {
      try {
        const data = await apiService.getAllColleges();
        setColegios(data);
      } catch (err) {
        console.error('Error al cargar colegios:', err);
        setError('No se pudo cargar la lista de colegios. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchColegios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newColegio.trim()) {
      alert('Por favor, ingrese un nombre de colegio válido');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const addedColegio = await apiService.addCollege(newColegio);
      setColegios([...colegios, addedColegio]);
      setNewColegio('');
      alert('Colegio añadido con éxito');
    } catch (err) {
      console.error('Error al añadir colegio:', err);
      alert(err.message || 'Error al añadir colegio');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p>Cargando colegios...</p>;
  }

  return (
    <div className="colegios-container">
      <h2>Gestión de Colegios</h2>
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="add-colegio-form">
        <div className="form-group">
          <label htmlFor="newColegio">Nuevo Colegio</label>
          <input 
            type="text" 
            id="newColegio" 
            value={newColegio} 
            onChange={(e) => setNewColegio(e.target.value)} 
            placeholder="Nombre del colegio" 
            required 
          />
        </div>
        
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Añadiendo...' : 'Añadir Colegio'}
        </button>
      </form>
      
      <div className="colegios-list">
        <h3>Colegios Habilitados</h3>
        {colegios.length === 0 ? (
          <p>No hay colegios registrados.</p>
        ) : (
          <ul>
            {colegios.map(colegio => (
              <li key={colegio.id}>{colegio.nombre}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Componente principal del panel de administrador
function AdministradorPanel() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("Iniciando cierre de sesión...");
    await logout();
  };

  return (
    <div className="admin-panel">
      <aside className="sidebar">
        <div className="logo" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
          <img src="/logo_umss.png" alt="Logo UMSS" />
          <img src="/logoAdmin.png" alt="Logo Administrador" className="user-role-logo-small" />
          <h2>Panel de Administrador</h2>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/admin/configuracion">Configuración Olimpiadas</Link>
            </li>
            <li>
              <Link to="/admin/colegios">Gestión de Colegios</Link>
            </li>
            <li>
              <Link to="/admin/convocatorias">Gestión de Convocatorias</Link>
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
        <header className="admin-header">
          <h1>Bienvenido, {currentUser?.nombre || 'Administrador'}</h1>
        </header>

        <div className="admin-content">
          <Routes>
            <Route path="/" element={
              <div className="dashboard-overview">
                <h2>Dashboard</h2>
                <p>Bienvenido al panel de administración de las Olimpiadas Escolares 2025.</p>
                <div className="quick-links">
                  <Link to="/admin/configuracion" className="quick-link-card">
                    <div className="quick-link-icon">
                      <FaCog size={36} color="#3498db" />
                    </div>
                    <div className="quick-link-text">
                      <h3>Configuración de Olimpiadas</h3>
                      <p>Establecer fechas, precios y parámetros de las Olimpiadas.</p>
                    </div>
                  </Link>
                  <Link to="/admin/colegios" className="quick-link-card">
                    <div className="quick-link-icon">
                      <FaSchool size={36} color="#27ae60" />
                    </div>
                    <div className="quick-link-text">
                      <h3>Gestión de Colegios</h3>
                      <p>Administrar colegios habilitados para participar.</p>
                    </div>
                  </Link>
                  <Link to="/admin/convocatorias" className="quick-link-card">
                    <div className="quick-link-icon">
                      <FaCalendarAlt size={36} color="#e74c3c" />
                    </div>
                    <div className="quick-link-text">
                      <h3>Gestión de Convocatorias</h3>
                      <p>Administrar convocatorias de olimpiadas y sus áreas asociadas.</p>
                    </div>
                  </Link>
                </div>

              </div>
            } />
            <Route path="/configuracion" element={<ConfiguracionOlimpiadas />} />
            <Route path="/colegios" element={<GestionColegios />} />
            <Route path="/convocatorias" element={<AdminConvocatorias />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default AdministradorPanel; 