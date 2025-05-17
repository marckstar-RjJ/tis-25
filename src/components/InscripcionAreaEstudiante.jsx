import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function InscripcionAreaEstudiante() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [student, setStudent] = useState(null);
  const [areas, setAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState([]);
  const [convocatoria, setConvocatoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    // Cargar datos del estudiante, áreas disponibles y convocatoria seleccionada
    const fetchData = async () => {
      try {
        // Verificar si hay una convocatoria seleccionada
        const convocatoriaId = sessionStorage.getItem('convocatoriaSeleccionadaId');
        if (!convocatoriaId) {
          // No hay convocatoria seleccionada, redirigir a la página de convocatorias
          setError('No has seleccionado una convocatoria. Debes seleccionar una convocatoria primero.');
          setTimeout(() => navigate('/estudiante/convocatorias'), 2000);
          return;
        }
        
        // Obtener la convocatoria seleccionada
        const convocatoriasKey = 'olimpiadas_convocatorias';
        const convocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
        const convocatoriaSeleccionada = convocatorias.find(c => c.id === convocatoriaId);
        
        if (!convocatoriaSeleccionada) {
          setError('La convocatoria seleccionada no existe o ha sido eliminada.');
          setTimeout(() => navigate('/estudiante/convocatorias'), 2000);
          return;
        }
        
        // Verificar que la convocatoria tenga áreas asignadas correctamente
        console.log('Convocatoria seleccionada:', convocatoriaSeleccionada.nombre);
        console.log('Áreas de la convocatoria:', convocatoriaSeleccionada.areas?.map(a => a.nombre) || []);
        
        // HARD RESET: Definir de manera fija qué áreas tiene cada convocatoria
        // Creamos arrays de áreas específicas para cada tipo de convocatoria
        
        // Áreas científicas clásicas para Oh Sansi!
        const areasOhSansi = [
          { id: "1", nombre: "Astronomía", descripcion: "Estudio del universo y los cuerpos celestes" },
          { id: "2", nombre: "Biología", descripcion: "Estudio de los seres vivos" },
          { id: "3", nombre: "Física", descripcion: "Estudio de la materia y la energía" },
          { id: "4", nombre: "Matemáticas", descripcion: "Estudio de números, estructuras y patrones" },
          { id: "5", nombre: "Informática", descripcion: "Estudio de la computación y programación" },
          { id: "6", nombre: "Robótica", descripcion: "Diseño y construcción de robots" },
          { id: "7", nombre: "Química", descripcion: "Estudio de la composición de la materia" }
        ];
        
        // Áreas específicas para Skillparty
        const areasSkillparty = [
          { id: "8", nombre: "Farmeo I", descripcion: "Farmeo de minions y campeones" },
          { id: "9", nombre: "Support II", descripcion: "Asistencia y control de vision" }
        ];
        
        // Áreas específicas para Lolsito
        const areasLolsito = [
          { id: "10", nombre: "Top Lane", descripcion: "Linea superior" },
          { id: "11", nombre: "Mid Lane", descripcion: "Linea central" },
          { id: "12", nombre: "Jungling", descripcion: "Rol de jungla" }
        ];
        
        // Asignar áreas según el nombre exacto de la convocatoria
        if (convocatoriaSeleccionada.nombre === 'Olimpiadas Oh Sansi!') {
          convocatoriaSeleccionada.areas = areasOhSansi;
          console.log('RESET: Áreas para Oh Sansi!:', areasOhSansi.map(a => a.nombre));
        }
        // Olimpiadas Skillparty: SOLO Farmeo I y Support II
        else if (convocatoriaSeleccionada.nombre === 'Olimpiadas Skillparty') {
          convocatoriaSeleccionada.areas = areasSkillparty;
          console.log('RESET: Áreas para Skillparty:', areasSkillparty.map(a => a.nombre));
        }
        // Torneo Lolsito: SOLO Top Lane, Mid Lane, Jungling
        else if (convocatoriaSeleccionada.nombre === 'Torneo Lolsito') {
          convocatoriaSeleccionada.areas = areasLolsito;
          console.log('RESET: Áreas para Lolsito:', areasLolsito.map(a => a.nombre));
        }
        
        // Actualizar en localStorage para futuras consultas
        const convocatoriasActualizadas = convocatorias.map(c => 
          c.id === convocatoriaId ? convocatoriaSeleccionada : c
        );
        localStorage.setItem(convocatoriasKey, JSON.stringify(convocatoriasActualizadas));
        
        setConvocatoria(convocatoriaSeleccionada);
        
        // Obtener datos del estudiante
        const studentData = await apiService.getCurrentStudent();
        setStudent(studentData);
        
        // Verificar si el estudiante ya está inscrito en esta convocatoria
        if (studentData.convocatoriaId === convocatoriaId && 
            studentData.areasInscritas && 
            studentData.areasInscritas.length > 0) {
          setSelectedAreaIds(studentData.areasInscritas);
        }
        
        // Obtener áreas disponibles para esta convocatoria
        // Si la convocatoria tiene áreas específicas, usarlas
        if (convocatoriaSeleccionada.areas && convocatoriaSeleccionada.areas.length > 0) {
          setAreas(convocatoriaSeleccionada.areas);
          
          // Si el estudiante ya está inscrito, cargar las áreas seleccionadas
          if (studentData.areasInscritas && studentData.areasInscritas.length > 0) {
            const areasSeleccionadas = convocatoriaSeleccionada.areas.filter(area => 
              studentData.areasInscritas.includes(area.id)
            );
            setSelectedAreas(areasSeleccionadas);
          }
        } else {
          // Si no tiene áreas específicas, cargar todas las áreas disponibles
          const allAreas = await apiService.getAreas();
          setAreas(allAreas);
          
          // Si el estudiante ya está inscrito, cargar las áreas seleccionadas
          if (studentData.areasInscritas && studentData.areasInscritas.length > 0) {
            const areasSeleccionadas = allAreas.filter(area => 
              studentData.areasInscritas.includes(area.id)
            );
            setSelectedAreas(areasSeleccionadas);
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos necesarios. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  // Calcular costo total cuando cambian las áreas seleccionadas o se carga la convocatoria
  useEffect(() => {
    if (convocatoria && convocatoria.costo_por_area) {
      setTotalCost(selectedAreas.length * convocatoria.costo_por_area);
    }
  }, [selectedAreas, convocatoria]);

  const handleToggleArea = (areaId) => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return;
    
    setSelectedAreaIds(prevSelected => {
      // Si ya está seleccionada, la quitamos
      if (prevSelected.includes(areaId)) {
        const updatedAreaIds = prevSelected.filter(id => id !== areaId);
        
        // Actualizar array de áreas seleccionadas completas
        setSelectedAreas(areas.filter(area => updatedAreaIds.includes(area.id)));
        
        return updatedAreaIds;
      } 
      // Si no está seleccionada, verificamos si podemos añadirla
      else {
        // Verificar si el estudiante no excede el máximo de áreas permitidas
        if (convocatoria && prevSelected.length >= convocatoria.maximo_areas) {
          alert(`Solo puedes seleccionar un máximo de ${convocatoria.maximo_areas} áreas.`);
          return prevSelected;
        }
        
        const updatedAreaIds = [...prevSelected, areaId];
        
        // Actualizar array de áreas seleccionadas completas
        setSelectedAreas(areas.filter(area => updatedAreaIds.includes(area.id)));
        
        return updatedAreaIds;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!convocatoria) {
      setError('No hay una convocatoria seleccionada.');
      return;
    }
    
    if (selectedAreas.length === 0) {
      setError('Debes seleccionar al menos un área para inscribirte.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Actualizar la información del estudiante en el localStorage
      const studentsKey = 'olimpiadas_students';
      const students = JSON.parse(localStorage.getItem(studentsKey) || '[]');
      const studentIndex = students.findIndex(s => s.id === student.id);
      
      if (studentIndex === -1) {
        throw new Error('No se encontró el registro del estudiante.');
      }
      
      // Actualizar los datos del estudiante con las áreas seleccionadas y la convocatoria
      students[studentIndex] = {
        ...students[studentIndex],
        areasInscritas: selectedAreaIds,
        convocatoriaId: convocatoria.id
      };
      
      // Guardar los cambios
      localStorage.setItem(studentsKey, JSON.stringify(students));
      
      console.log('Inscripción exitosa en convocatoria:', convocatoria.nombre);
      console.log('Áreas seleccionadas:', selectedAreas.map(a => a.nombre).join(', '));
      
      setSuccess('Inscripción realizada con éxito!');
      
      // Redirigir al estudiante después de un breve tiempo
      setTimeout(() => {
        navigate('/estudiante/mis-areas');
      }, 2000);
      
    } catch (err) {
      console.error('Error al realizar inscripción:', err);
      setError(err.message || 'Error al realizar la inscripción. Inténtalo de nuevo.');
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
        <p>No se pudo cargar la información del estudiante.</p>
        <button onClick={() => navigate('/estudiante/areas')} className="button">
          Volver a Mis Áreas
        </button>
      </div>
    );
  }

  return (
    <div className="inscripcion-container">
      <div className="inscripcion-header">
        <button onClick={() => navigate('/estudiante/areas')} className="back-button">
          ← Volver a Mis Áreas
        </button>
        <h2>Inscripción en Áreas Académicas</h2>
      </div>
      
      <div className="student-info-panel">
        <h3>Mi Información</h3>
        <p><strong>Nombre:</strong> {student.nombre} {student.apellido}</p>
        <p><strong>CI:</strong> {student.ci}</p>
        <p><strong>Curso:</strong> {
          student.curso <= 6 
            ? `${student.curso}° Primaria` 
            : `${student.curso - 6}° Secundaria`
        }</p>
        <p><strong>Colegio:</strong> {student.colegio?.nombre || 'No asignado'}</p>
      </div>
      
      {convocatoria && (
        <div className="olympiad-info">
          <h3>Información de la Convocatoria</h3>
          <p><strong>Nombre:</strong> {convocatoria.nombre}</p>
          <p><strong>Período de Inscripción:</strong> {new Date(convocatoria.fecha_inicio_inscripciones).toLocaleDateString()} - {new Date(convocatoria.fecha_fin_inscripciones).toLocaleDateString()}</p>
          <p><strong>Precio por área:</strong> Bs. {convocatoria.costo_por_area}</p>
          <p><strong>Máximo de áreas:</strong> {convocatoria.maximo_areas} por estudiante</p>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      
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
                    No cumples con los requisitos de curso
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
            onClick={() => navigate('/estudiante/areas')}
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

export default InscripcionAreaEstudiante;
