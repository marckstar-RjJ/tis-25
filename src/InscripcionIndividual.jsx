import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { apiService } from './services/api';

function InscripcionIndividual() {
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [total, setTotal] = useState(0);

  const PRECIO_POR_AREA = 16; // Precio en dólares por área

  const navigate = useNavigate();

  // Definición de áreas disponibles por curso
  const areasCursos = {
    'Astronomía y Astrofísica': [
      '3ro de Primaria', '4to de Primaria', '5to de Primaria', '6to de Primaria',
      '1ro de Secundaria', '2do de Secundaria', '3ro de Secundaria', '4to de Secundaria', '5to de Secundaria', '6to de Secundaria'
    ],
    'Biología': [
      '2do de Secundaria', '3ro de Secundaria', '4to de Secundaria', '5to de Secundaria', '6to de Secundaria'
    ],
    'Física': [
      '4to de Secundaria', '5to de Secundaria', '6to de Secundaria'
    ],
    'Informática': [
      '5to de Primaria', '6to de Primaria',
      '1ro de Secundaria', '2do de Secundaria', '3ro de Secundaria', '4to de Secundaria', '5to de Secundaria', '6to de Secundaria'
    ],
    'Matemática': [
      '1ro de Secundaria', '2do de Secundaria', '3ro de Secundaria', '4to de Secundaria', '5to de Secundaria', '6to de Secundaria'
    ],
    'Química': [
      '2do de Secundaria', '3ro de Secundaria', '4to de Secundaria', '5to de Secundaria', '6to de Secundaria'
    ],
    'Robótica': [
      '5to de Primaria', '6to de Primaria',
      '1ro de Secundaria', '2do de Secundaria', '3ro de Secundaria', '4to de Secundaria', '5to de Secundaria', '6to de Secundaria'
    ]
  };

  // Orden definido para mostrar las áreas
  const areasInscripcion = [
    'Astronomía y Astrofísica',
    'Biología',
    'Física',
    'Informática',
    'Matemática',
    'Química',
    'Robótica',
  ];

  // Cargar datos del estudiante
  useEffect(() => {
    const fetchEstudiante = async () => {
      try {
        const data = await apiService.getCurrentStudent();
        setEstudiante(data);
        
        // Determinar áreas disponibles según el curso
        const areasDisponibles = areasInscripcion.filter(area => 
          areasCursos[area].includes(data.curso)
        );
        setAvailableAreas(areasDisponibles);
        
        // Si el estudiante ya tiene áreas inscritas, mostrarlas
        if (data.areasInscritas && data.areasInscritas.length > 0) {
          setAreasSeleccionadas(data.areasInscritas);
          setTotal(data.areasInscritas.length * PRECIO_POR_AREA);
        }
      } catch (err) {
        console.error("Error al cargar datos del estudiante:", err);
        setError('No se pudo cargar la información del estudiante. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchEstudiante();
  }, []);

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
      setAreasSeleccionadas(prev => prev.filter(area => area !== value));
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
      await apiService.inscribirEstudianteEnAreas(estudiante.id, areasSeleccionadas);
      alert(`Inscripción exitosa en ${areasSeleccionadas.length} áreas. Total a pagar: $${total}`);
      navigate('/dashboard');
    } catch (err) {
      console.error("Error al realizar la inscripción:", err);
      alert('Ocurrió un error al procesar la inscripción. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
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
        <button onClick={handleBack} className="back-button">Volver al Panel</button>
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
            <span className="info-value">{estudiante.nombre} {estudiante.apellidos}</span>
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
            <span className="info-value">{estudiante.colegio}</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="areas-selection">
          <h3>Selección de Áreas (máximo 2)</h3>
          <p className="areas-price-info">Precio por área: ${PRECIO_POR_AREA}</p>
          
          <div className="checkbox-group areas-list">
            {areasInscripcion.map(area => {
              const isDisponible = availableAreas.includes(area);
              return (
                <div 
                  key={area} 
                  className={`area-option ${!isDisponible ? 'disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    id={`area-${area}`}
                    name="area"
                    value={area}
                    checked={areasSeleccionadas.includes(area)}
                    onChange={handleAreaChange}
                    disabled={!isDisponible || (areasSeleccionadas.length >= 2 && !areasSeleccionadas.includes(area))}
                  />
                  <label 
                    htmlFor={`area-${area}`}
                    className={!isDisponible ? 'disabled-text' : ''}
                  >
                    {area}
                    {!isDisponible && <span className="no-disponible"> (No disponible para tu curso)</span>}
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
                  <li key={area}>{area}</li>
                ))}
              </ul>
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