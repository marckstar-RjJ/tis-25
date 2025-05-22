import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

// Función para verificar si un estudiante cumple con los requisitos de curso para un área específica
const cumpleRequisitosArea = (curso, nombreArea) => {
  // Convertir curso a formato numérico
  const cursoNum = parseInt(curso);
  
  // Normalizar el nombre del área (quitar acentos, convertir a minúsculas, etc.)
  const areaNormalizada = nombreArea.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Validaciones según el reglamento
  if (areaNormalizada.includes('astronom')) {
    return cursoNum >= 4 && cursoNum <= 12; // 4° Primaria - 6° Secundaria
  } else if (areaNormalizada.includes('biolog')) {
    return cursoNum >= 3 && cursoNum <= 12; // 3° Primaria - 6° Secundaria
  } else if (areaNormalizada.includes('fisic')) {
    return cursoNum >= 7 && cursoNum <= 12; // 1° Secundaria - 6° Secundaria
  } else if (areaNormalizada.includes('matematic')) {
    return cursoNum >= 3 && cursoNum <= 12; // 3° Primaria - 6° Secundaria
  } else if (areaNormalizada.includes('informatic')) {
    return cursoNum >= 7 && cursoNum <= 12; // 1° Secundaria - 6° Secundaria
  } else if (areaNormalizada.includes('robotic')) {
    return cursoNum >= 3 && cursoNum <= 12; // 3° Primaria - 6° Secundaria
  } else if (areaNormalizada.includes('quimic')) {
    return cursoNum >= 7 && cursoNum <= 12; // 1° Secundaria - 6° Secundaria
  } else {
    return false;
  }
};

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
  const [convocatorias, setConvocatorias] = useState([]);
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState('');
  const [convocatoriaSelected, setConvocatoriaSelected] = useState(false);

  useEffect(() => {
    // Cargar datos del estudiante y convocatorias disponibles
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
        
        // Obtener convocatorias disponibles
        console.log('Intentando obtener convocatorias...');
        try {
          const convocatoriasData = await apiService.getAllConvocatorias();
          console.log('Convocatorias obtenidas:', convocatoriasData);
          if (convocatoriasData && convocatoriasData.length > 0) {
            setConvocatorias(convocatoriasData);
          } else {
            console.log('No se obtuvieron convocatorias');
            setError('No hay convocatorias disponibles para inscripción.');
          }
        } catch (convocatoriaError) {
          console.error('Error específico al cargar convocatorias:', convocatoriaError);
          setError(`Error al cargar convocatorias: ${convocatoriaError.message || 'Error desconocido'}`);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos necesarios. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [studentId]);

  // Cargar configuración de olimpiada cuando se selecciona una convocatoria
  useEffect(() => {
    const fetchOlympiadConfig = async () => {
      if (selectedConvocatoriaId) {
        try {
          const olympiadData = await apiService.getOlympiadConfigById(selectedConvocatoriaId);
          setOlympiadConfig(olympiadData);
          setConvocatoriaSelected(true);
          
          // Resetear áreas seleccionadas cuando se cambia de convocatoria
          if (student && !student.areasInscritas) {
            setSelectedAreas([]);
            setSelectedAreaIds([]);
          }
        } catch (err) {
          console.error('Error al cargar configuración de olimpiada:', err);
          setError('No se pudo cargar la configuración de la convocatoria seleccionada.');
        }
      }
    };
    
    if (selectedConvocatoriaId) {
      fetchOlympiadConfig();
    }
  }, [selectedConvocatoriaId, student]);
  
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
      
      // Verificar si el estudiante cumple con los requisitos de curso para el área
      if (!cumpleRequisitosArea(student.curso, area.nombre)) {
        setError(`El estudiante no cumple con los requisitos de curso para inscribirse en ${area.nombre}.`);
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
      if (!olympiadConfig || !selectedConvocatoriaId) {
        throw new Error('Debe seleccionar una convocatoria válida antes de continuar');
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
      await apiService.updateStudentAreas(studentId, selectedAreaIds, selectedConvocatoriaId);
      
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
      
      {/* Selección de convocatoria obligatoria */}
      <div className="convocatoria-selector">
        <h3>Seleccionar Convocatoria</h3>
        <p className="instruction">Debe seleccionar una convocatoria antes de continuar con la inscripción</p>
        
        <select 
          value={selectedConvocatoriaId} 
          onChange={(e) => setSelectedConvocatoriaId(e.target.value)}
          className="convocatoria-select"
          required
        >
          <option value="">-- Seleccione una convocatoria --</option>
          {convocatorias.map(conv => (
            <option key={conv.id} value={conv.id}>
              {conv.nombre} ({new Date(conv.fechaInicio).toLocaleDateString()} - {new Date(conv.fechaFin).toLocaleDateString()})
            </option>
          ))}
        </select>
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
      
      {/* Solo mostrar el formulario de inscripción si se ha seleccionado una convocatoria */}
      {convocatoriaSelected ? (
        <form onSubmit={handleSubmit} className="inscripcion-form">
          <h3>Seleccionar Áreas</h3>
          
          <div className="areas-grid">
            {areas.map(area => {
              const cumpleRequisitos = cumpleRequisitosArea(student.curso, area.nombre);
              return (
                <div 
                  key={area.id} 
                  className={`area-card ${selectedAreaIds.includes(area.id) ? 'selected' : ''} ${!cumpleRequisitos ? 'disabled' : ''}`}
                  onClick={() => cumpleRequisitos && handleToggleArea(area.id)}
                >
                  <h4>{area.nombre}</h4>
                  <p>{area.descripcion}</p>
                  {!cumpleRequisitos && (
                    <div className="requisitos-warning">
                      No cumple con los requisitos de curso
                    </div>
                  )}
                  <div className="selection-indicator">
                    {selectedAreaIds.includes(area.id) ? '✓ Seleccionada' : cumpleRequisitos ? 'Click para seleccionar' : 'No disponible'}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="inscripcion-summary">
            <h3>Resumen de Inscripción</h3>
            <p><strong>Áreas seleccionadas:</strong> {selectedAreas.length}</p>
            <p><strong>Costo total:</strong> Bs. {totalCost}</p>
            
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
      ) : (
        <div className="select-convocatoria-message">
          <p>Por favor, seleccione una convocatoria antes de continuar con la inscripción en áreas.</p>
        </div>
      )}
    </div>
  );
}

export default InscripcionArea;
