import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './App.css';
import { apiService } from './services/api';
import { useAuth } from './context/AuthContext';

function InscripcionIndividual({ navigate: customNavigate }) {
  const { studentId } = useParams();
  const { currentUser } = useAuth();
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [total, setTotal] = useState(0);

  const PRECIO_POR_AREA = 16; // Precio en dólares por área

  // Usar el navigate personalizado si se proporciona, o el hook useNavigate por defecto
  const defaultNavigate = useNavigate();
  const navigate = customNavigate || defaultNavigate;

  // Definición de áreas disponibles por curso
  const areasCursos = {
    'Astronomía': [
      '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria',
      '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Biología': [
      '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Física': [
      '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Informática': [
      '5° Primaria', '6° Primaria',
      '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Matemática': [
      '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Química': [
      '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ],
    'Robótica': [
      '5° Primaria', '6° Primaria',
      '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria', '6° Secundaria'
    ]
  };

  // Función para convertir el valor numérico del curso a texto
  const getCursoTexto = (cursoNumero) => {
    // Validar que sea un número
    const curso = Number(cursoNumero);
    if (isNaN(curso)) return '';
    
    if (curso <= 6) {
      return `${curso}° Primaria`;
    } else {
      return `${curso - 6}° Secundaria`;
    }
  };

  // Cargar datos del estudiante y áreas disponibles
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar todas las áreas disponibles primero
        const areasData = await apiService.getAreas();
        setAllAreas(areasData);
        
        // Obtener datos del estudiante según el contexto
        let data;
        try {
          if (currentUser.tipoUsuario === 'estudiante') {
            // Si es un estudiante, obtener sus propios datos
            data = await apiService.getCurrentStudent();
            console.log("Datos del estudiante actual obtenidos:", data);
          } else if (studentId) {
            // Si es un tutor accediendo a un estudiante específico
            data = await apiService.getStudentById(studentId);
            console.log("Datos del estudiante por ID obtenidos:", data);
          } else {
            throw new Error('No se puede identificar al estudiante');
          }
        } catch (err) {
          console.error("Error al cargar datos del estudiante:", err);
          // Intentar cargar datos del usuario actual como respaldo
          if (currentUser) {
            console.log("Usando datos del usuario actual como respaldo");
            data = {
              ...currentUser,
              areasInscritas: currentUser.areasInscritas || []
            };
          } else {
            throw new Error('No se pudo obtener información del estudiante');
          }
        }
        
        setEstudiante(data);
        
        // Convertir el curso numérico a texto para comparar con las áreas disponibles
        const cursoTexto = getCursoTexto(data.curso);
        console.log("Curso del estudiante (texto):", cursoTexto);
        
        // Determinar áreas disponibles según el curso
        const areasDisponiblesNombres = Object.keys(areasCursos).filter(areaNombre => 
          areasCursos[areaNombre].includes(cursoTexto)
        );
        console.log("Áreas disponibles para este curso:", areasDisponiblesNombres);
        
        const areasDisponibles = areasData.filter(area => 
          areasDisponiblesNombres.includes(area.nombre)
        );
        console.log("Áreas disponibles (objetos completos):", areasDisponibles);
        
        setAvailableAreas(areasDisponibles);
        
        // Si el estudiante ya tiene áreas inscritas, seleccionarlas
        if (data.areasInscritas && data.areasInscritas.length > 0) {
          setAreasSeleccionadas(data.areasInscritas);
          setTotal(data.areasInscritas.length * PRECIO_POR_AREA);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError('Ocurrió un error al cargar la información. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, currentUser]);

  // Actualizar el total cuando cambien las áreas seleccionadas
  useEffect(() => {
    setTotal(areasSeleccionadas.length * PRECIO_POR_AREA);
  }, [areasSeleccionadas]);

  const handleAreaChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      // No permitir seleccionar más de 2 áreas
      if (areasSeleccionadas.length < 2) {
        setAreasSeleccionadas(prev => [...prev, value]);
      }
    } else {
      setAreasSeleccionadas(prev => prev.filter(areaId => areaId !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (areasSeleccionadas.length === 0) {
      alert('Debes seleccionar al menos un área para inscribirte.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Enviando datos de inscripción:');
      console.log('Student ID:', estudiante.id);
      console.log('Áreas seleccionadas:', areasSeleccionadas);
      
      await apiService.inscribirEstudianteEnAreas(estudiante.id, areasSeleccionadas);
      
      // Mostrar mensaje de éxito incluyendo información sobre la boleta
      const mensaje = `Inscripción realizada con éxito en ${areasSeleccionadas.length} área(s).
      Total a pagar: $${total}
      La boleta de pago ha sido enviada al correo ${estudiante.email}.`;
      
      alert(mensaje);
      
      // Redirección basada en el tipo de usuario
      if (currentUser.tipoUsuario === 'estudiante') {
        navigate('/estudiante/areas');
      } else {
        navigate('/tutor/estudiantes');
      }
    } catch (err) {
      console.error("Error al realizar la inscripción:", err);
      alert('Ocurrió un error al procesar la inscripción. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Redirección basada en el tipo de usuario
    if (currentUser.tipoUsuario === 'estudiante') {
      navigate('/estudiante/areas');
    } else {
      navigate('/tutor/estudiantes');
    }
  };

  // Obtener el nombre del área por su ID
  const getAreaName = (areaId) => {
    const area = allAreas.find(a => a.id === areaId);
    return area ? area.nombre : areaId;
  };

  if (loading) {
    return (
      <div className="inscripcion-form loading-container">
        <p>Cargando información del estudiante...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inscripcion-form error-container">
        <p className="error-message">{error}</p>
        <button onClick={handleBack} className="back-button">Volver</button>
      </div>
    );
  }

  return (
    <div className="inscripcion-form">
      <h2>Inscripción a Áreas Olímpicas</h2>
      
      <div className="student-info">
        <h3>Información del Estudiante</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Nombre:</span>
            <span className="info-value">{estudiante.nombre} {estudiante.apellidos || estudiante.apellido}</span>
          </div>
          <div className="info-item">
            <span className="info-label">CI:</span>
            <span className="info-value">{estudiante.ci}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Curso:</span>
            <span className="info-value">{estudiante.curso}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Colegio:</span>
            <span className="info-value">{estudiante.colegio?.nombre || estudiante.colegio}</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="areas-selection">
          <h3>Selección de Áreas (máximo 2)</h3>
          <p className="areas-price-info">Precio por área: ${PRECIO_POR_AREA}</p>
          
          <div className="checkbox-group areas-list">
            {availableAreas.map(area => {
              const isSelected = areasSeleccionadas.includes(area.id);
              return (
                <div 
                  key={area.id} 
                  className={`area-option`}
                >
                  <input
                    type="checkbox"
                    id={`area-${area.id}`}
                    name="area"
                    value={area.id}
                    checked={isSelected}
                    onChange={handleAreaChange}
                    disabled={areasSeleccionadas.length >= 2 && !isSelected}
                  />
                  <label 
                    htmlFor={`area-${area.id}`}
                  >
                    {area.nombre}
                    <p className="area-description">{area.descripcion}</p>
                  </label>
                </div>
              );
            })}
          </div>
          
          {availableAreas.length > 0 && (
            <div className="areas-info">
              <p>Áreas disponibles para {estudiante.curso}:</p>
              <ul>
                {availableAreas.map(area => (
                  <li key={area.id}>{area.nombre}</li>
                ))}
              </ul>
            </div>
          )}
          
          {availableAreas.length === 0 && (
            <div className="areas-info">
              <p>No hay áreas disponibles para tu curso actualmente.</p>
            </div>
          )}
          
          <div className="price-summary">
            <p>Número de áreas seleccionadas: <strong>{areasSeleccionadas.length}</strong></p>
            <p className="total-price">Total a pagar: <strong>${total}</strong></p>
          </div>
        </div>
        
        <div className="form-buttons">
          <button type="button" onClick={handleBack} className="back-button">
            Cancelar
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting || areasSeleccionadas.length === 0}
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar Inscripción'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InscripcionIndividual;