import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import AdminConvocatorias from '../src/components/convocatorias/AdminConvocatorias';

// Componente para la configuración de olimpiadas
const ConfiguracionOlimpiadas = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    precioPorArea: 0,
    maxAreasEstudiante: 0
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await apiService.getOlympiadSettings();
        setConfig(data);
        
        // Formatear las fechas para el input date
        const formatDate = (isoString) => {
          const date = new Date(isoString);
          return date.toISOString().split('T')[0];
        };
        
        setFormData({
          fechaInicio: formatDate(data.fechaInicio),
          fechaFin: formatDate(data.fechaFin),
          precioPorArea: data.precioPorArea,
          maxAreasEstudiante: data.maxAreasEstudiante
        });
      } catch (err) {
        console.error('Error al cargar configuración:', err);
        setError('No se pudo cargar la configuración. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
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
    
    try {
      const updatedConfig = await apiService.updateOlympiadSettings({
        fechaInicio: new Date(formData.fechaInicio).toISOString(),
        fechaFin: new Date(formData.fechaFin).toISOString(),
        precioPorArea: Number(formData.precioPorArea),
        maxAreasEstudiante: Number(formData.maxAreasEstudiante)
      });
      
      setConfig(updatedConfig);
      alert('Configuración actualizada con éxito');
    } catch (err) {
      console.error('Error al actualizar configuración:', err);
      setError('No se pudo actualizar la configuración. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p>Cargando configuración...</p>;
  }

  return (
    <div className="config-container">
      <h2>Configuración de Olimpiadas</h2>
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="config-form">
        <div className="form-group">
          <label htmlFor="fechaInicio">Fecha de Inicio</label>
          <input 
            type="date" 
            id="fechaInicio" 
            name="fechaInicio" 
            value={formData.fechaInicio} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="fechaFin">Fecha de Fin</label>
          <input 
            type="date" 
            id="fechaFin" 
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
            name="maxAreasEstudiante" 
            value={formData.maxAreasEstudiante} 
            onChange={handleChange} 
            min="1" 
            max="7" 
            required 
          />
        </div>
        
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </form>
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-panel">
      <aside className="sidebar">
        <div className="logo">
          <img src="/logo_umss.png" alt="Logo UMSS" />
          <h2>Panel de Administrador</h2>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/admin">Dashboard</Link>
            </li>
            <li>
              <Link to="/admin/configuracion">Configuración Olimpiadas</Link>
            </li>
            <li>
              <Link to="/admin/colegios">Gestión de Colegios</Link>
            </li>
            <li>
              <Link to="/admin/convocatorias">Gestión de Convocatorias</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
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
                    <h3>Configuración de Olimpiadas</h3>
                    <p>Establecer fechas, precios y parámetros de las Olimpiadas.</p>
                  </Link>
                  <Link to="/admin/colegios" className="quick-link-card">
                    <h3>Gestión de Colegios</h3>
                    <p>Administrar colegios habilitados para participar.</p>
                  </Link>
                  <Link to="/admin/convocatorias" className="quick-link-card">
                    <h3>Gestión de Convocatorias</h3>
                    <p>Crear y administrar múltiples convocatorias de olimpiadas.</p>
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