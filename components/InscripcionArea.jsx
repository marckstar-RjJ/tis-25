import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

function InscripcionArea() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [student, setStudent] = useState(null);
  const [areas, setAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState([]);
  const [olympiadConfig, setOlympiadConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    // Cargar datos del estudiante, áreas disponibles y configuración de olimpiada
    const fetchData = async () => {
      try {
        // Obtener datos del estudiante
        const studentData = await apiService.getStudentById(studentId);
        setStudent(studentData);
        
        // Obtener áreas ya inscritas
        if (studentData.areasInscritas && studentData.areasInscritas.length > 0) {
          setSelectedAreaIds(studentData.areasInscritas);
        }
        
        // Obtener todas las áreas disponibles
        const areasData = await apiService.getAreas();
        setAreas(areasData);
        
        if (studentData.areasInscritas && studentData.areasInscritas.length > 0) {
          // Encontrar los objetos de área completos para las áreas inscritas
          const areasSeleccionadas = areasData.filter(area => 
            studentData.areasInscritas.includes(area.id)
          );
          setSelectedAreas(areasSeleccionadas);
        }
        
        // Obtener configuración actual de la olimpiada
        const olympiadData = await apiService.getOlympiadConfig();
        setOlympiadConfig(olympiadData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos necesarios. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [studentId]);

  // Calcular costo total cuando cambian las áreas seleccionadas o se carga la configuración
  useEffect(() => {
    if (olympiadConfig && olympiadConfig.precioPorArea) {
      setTotalCost(selectedAreas.length * olympiadConfig.precioPorArea);
    }
  }, [selectedAreas, olympiadConfig]);

  const handleToggleArea = (areaId) => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return;
    
    if (selectedAreaIds.includes(areaId)) {
      // Eliminar área si ya está seleccionada
      setSelectedAreaIds(selectedAreaIds.filter(id => id !== areaId));
      setSelectedAreas(selectedAreas.filter(a => a.id !== areaId));
    } else {
      // Verificar que no exceda el máximo de áreas permitidas
      if (olympiadConfig && olympiadConfig.maxAreasEstudiante && 
          selectedAreas.length >= olympiadConfig.maxAreasEstudiante) {
        setError(`No se pueden seleccionar más de ${olympiadConfig.maxAreasEstudiante} áreas por estudiante.`);
        return;
      }
      
      // Añadir nueva área
      setSelectedAreaIds([...selectedAreaIds, areaId]);
      setSelectedAreas([...selectedAreas, area]);
      setError(''); // Limpiar errores anteriores
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Verificar si es una inscripción válida
      if (!olympiadConfig) {
        throw new Error('No se pudo obtener la configuración de la olimpiada');
      }
      
      // Verificar si estamos dentro del período de inscripción
      const currentDate = new Date();
      const startDate = new Date(olympiadConfig.fechaInicio);
      const endDate = new Date(olympiadConfig.fechaFin);
      
      if (currentDate < startDate) {
        throw new Error(`Las inscripciones comienzan el ${startDate.toLocaleDateString()}`);
      }
      
      if (currentDate > endDate) {
        throw new Error(`El período de inscripción finalizó el ${endDate.toLocaleDateString()}`);
      }
      
      // Enviar inscripción
      await apiService.updateStudentAreas(studentId, selectedAreaIds);
      
      setSuccess('Inscripción actualizada correctamente');
      
      // Si el usuario es un tutor, mostramos opciones adicionales
      if (currentUser.tipoUsuario === 'tutor') {
        setTimeout(() => {
          navigate('/tutor/estudiantes');
        }, 2000);
      }
    } catch (err) {
      console.error('Error al actualizar inscripción:', err);
      setError(err.message || 'Error al realizar la inscripción. Intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando información...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>No se pudo encontrar al estudiante solicitado.</p>
        <Link to="/tutor/estudiantes" className="button">Volver a Mis Estudiantes</Link>
      </div>
    );
  }

  return (
    <div className="inscripcion-container">
      <div className="inscripcion-header">
        <button onClick={() => navigate('/tutor/estudiantes')} className="back-button">
          ← Volver a Mis Estudiantes
        </button>
        <h2>Inscripción en Áreas Académicas</h2>
      </div>
      
      <div className="student-info-panel">
        <h3>Información del Estudiante</h3>
        <p><strong>Nombre:</strong> {student.nombre} {student.apellido}</p>
        <p><strong>CI:</strong> {student.ci}</p>
        <p><strong>Curso:</strong> {
          student.curso <= 6 
            ? `${student.curso}° Primaria` 
            : `${student.curso - 6}° Secundaria`
        }</p>
        <p><strong>Colegio:</strong> {student.colegio?.nombre || 'No asignado'}</p>
      </div>
      
      {olympiadConfig && (
        <div className="olympiad-info">
          <h3>Información de la Olimpiada</h3>
          <p><strong>Período de Inscripción:</strong> {new Date(olympiadConfig.fechaInicio).toLocaleDateString()} - {new Date(olympiadConfig.fechaFin).toLocaleDateString()}</p>
          <p><strong>Precio por área:</strong> Bs. {olympiadConfig.precioPorArea}</p>
          <p><strong>Máximo de áreas:</strong> {olympiadConfig.maxAreasEstudiante} por estudiante</p>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      
      <form onSubmit={handleSubmit} className="inscripcion-form">
        <h3>Seleccionar Áreas</h3>
        
        <div className="areas-grid">
          {areas.map(area => (
            <div 
              key={area.id} 
              className={`area-card ${selectedAreaIds.includes(area.id) ? 'selected' : ''}`}
              onClick={() => handleToggleArea(area.id)}
            >
              <h4>{area.nombre}</h4>
              <p>{area.descripcion}</p>
              <div className="selection-indicator">
                {selectedAreaIds.includes(area.id) ? '✓ Seleccionada' : 'Click para seleccionar'}
              </div>
            </div>
          ))}
        </div>
        
        <div className="inscripcion-summary">
          <h3>Resumen de Inscripción</h3>
          <p><strong>Áreas seleccionadas:</strong> {selectedAreas.length}</p>
          <p><strong>Costo total:</strong> Bs. {totalCost}</p>
          
          {/* Añadimos información sobre áreas seleccionadas */}
          {selectedAreas.length > 0 && (
            <div className="selected-areas-list">
              <p><strong>Áreas elegidas:</strong></p>
              <ul>
                {selectedAreas.map(area => (
                  <li key={area.id}>{area.nombre}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={() => navigate('/tutor/estudiantes')}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={submitting || selectedAreas.length === 0}
          >
            {submitting ? 'Procesando...' : 'Confirmar Inscripción'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InscripcionArea; 