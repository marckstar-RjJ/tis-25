import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from './services/api';
import { useAuth } from './context/AuthContext';
import { Container, Row, Col, Alert, Card, Spinner, Button, Modal } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './App.css';

function InscripcionIndividual({ navigate: customNavigate }) {
  const { currentUser } = useAuth();
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [config, setConfig] = useState(null);
  const [costoTotal, setCostoTotal] = useState(0);
  const [showModalExito, setShowModalExito] = useState(false);
  const [showModalError, setShowModalError] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Usar el navigate personalizado si se proporciona, o el hook useNavigate por defecto
  const defaultNavigate = useNavigate();
  const navigate = customNavigate || defaultNavigate;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Obtener datos del estudiante
        let studentData;
        try {
          studentData = await apiService.getCurrentStudent();
          if (!studentData || !studentData.id) {
            throw new Error('No se pudo obtener la información del estudiante');
          }
        } catch (studentError) {
          console.error('Error al obtener datos del estudiante:', studentError);
          if (currentUser) {
            studentData = currentUser;
          } else {
            throw new Error('No se pudo obtener la información del estudiante');
          }
        }

        setEstudiante(studentData);

      // Obtener la convocatoria seleccionada del sessionStorage
      const convocatoriaSeleccionadaStr = sessionStorage.getItem('convocatoriaSeleccionada');
      if (!convocatoriaSeleccionadaStr) {
        throw new Error('No has seleccionado una convocatoria. Debes seleccionar una convocatoria primero.');
      }

      const convocatoriaSeleccionada = JSON.parse(convocatoriaSeleccionadaStr);
      console.log("FetchConfig: Convocatoria seleccionada:", convocatoriaSeleccionada);
      
      if (!convocatoriaSeleccionada) {
        throw new Error('La convocatoria seleccionada no existe o ha sido eliminada.');
      }

      // Verificar fechas de inscripción
      const fechaActual = new Date();
      const fechaInicio = new Date(convocatoriaSeleccionada.fecha_inicio_inscripciones);
      const fechaFin = new Date(convocatoriaSeleccionada.fecha_fin_inscripciones);

      if (fechaActual < fechaInicio) {
        throw new Error('Las inscripciones para esta convocatoria aún no han comenzado.');
      }

      if (fechaActual > fechaFin) {
        throw new Error('Las inscripciones para esta convocatoria ya han finalizado.');
      }

        // Guardar la convocatoria en el localStorage si no existe
        const convocatoriasKey = 'olimpiadas_convocatorias';
        const convocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
        const convocatoriaExistente = convocatorias.find(c => c.id === convocatoriaSeleccionada.id);
        
        if (!convocatoriaExistente) {
          convocatorias.push(convocatoriaSeleccionada);
          localStorage.setItem(convocatoriasKey, JSON.stringify(convocatorias));
          console.log("Convocatoria guardada en localStorage:", convocatoriaSeleccionada);
        }

      setConfig(convocatoriaSeleccionada);
      
      // Usar las áreas de la convocatoria seleccionada
      if (Array.isArray(convocatoriaSeleccionada.areas) && convocatoriaSeleccionada.areas.length > 0) {
        setAvailableAreas(convocatoriaSeleccionada.areas);
        console.log("FetchConfig: Áreas de la convocatoria cargadas:", convocatoriaSeleccionada.areas);
      } else {
        throw new Error('No hay áreas disponibles para esta convocatoria.');
      }

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error al cargar los datos necesarios. Intente nuevamente.');
        if (err.message.includes('convocatoria')) {
          setTimeout(() => navigate('/estudiante/convocatorias'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  // Actualizar el costo total cuando cambien las áreas seleccionadas
  useEffect(() => {
    const nuevoTotal = areasSeleccionadas.length * (config?.costo_por_area || 16);
    setCostoTotal(nuevoTotal);
  }, [areasSeleccionadas, config]);

  const handleAreaChange = (areaId) => {
    setAreasSeleccionadas(prev => {
      // Si ya está seleccionada, quitarla
      if (prev.includes(areaId)) {
        return prev.filter(id => id !== areaId);
      } 
      // Si no está seleccionada, verificar si ya alcanzó el máximo
      else {
        if (config && prev.length >= config.maxAreasEstudiante) {
          setMensaje(`No puede seleccionar más de ${config.maxAreasEstudiante} áreas.`);
          setTimeout(() => setMensaje(''), 3000);
          return prev;
        }
        return [...prev, areaId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (areasSeleccionadas.length === 0) {
      setError('Debe seleccionar al menos un área académica.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setMensaje('');
    
    try {
      // Verificar que tenemos la convocatoria actual
      const convocatoriaActual = sessionStorage.getItem('convocatoriaSeleccionada');
      if (!convocatoriaActual) {
        throw new Error('No se encontró la convocatoria seleccionada');
      }

      const convocatoriaData = JSON.parse(convocatoriaActual);
      if (convocatoriaData.id !== config.id) {
        throw new Error('La convocatoria seleccionada no coincide con la actual');
      }

      // Verificar si ya existe una inscripción para esta convocatoria
      const inscripciones = JSON.parse(localStorage.getItem('olimpiadas_inscripciones') || '[]');
      const inscripcionExistente = inscripciones.find(i => 
        i.estudianteId === estudiante.id && 
        i.convocatoriaId === convocatoriaData.id
      );

      if (inscripcionExistente) {
        setErrorModalMessage('Ya estás inscrito en esta convocatoria. No puedes inscribirte nuevamente.');
        setShowModalError(true);
        return;
      }

      console.log('Enviando datos de inscripción:');
      console.log('Student ID:', estudiante.id);
      console.log('Áreas seleccionadas:', areasSeleccionadas);
      console.log('Costo total:', costoTotal);
      console.log('Convocatoria:', convocatoriaData);
      
      // Guardar la inscripción en localStorage
      const inscripcion = {
        id: Date.now(),
        estudianteId: estudiante.id,
        estudiante: {
          id: estudiante.id,
          nombre: estudiante.nombre,
          apellido: estudiante.apellido,
          email: estudiante.email,
          ci: estudiante.ci
        },
        convocatoriaId: convocatoriaData.id,
        convocatoria: convocatoriaData,
        areas: areasSeleccionadas.map(areaId => {
          const area = availableAreas.find(a => a.id === areaId);
          return {
            id: area.id,
            nombre: area.nombre,
            descripcion: area.descripcion
          };
        }),
        fechaInscripcion: new Date().toISOString(),
        estado: 'pendiente',
        costoTotal: costoTotal
      };

      // Agregar nueva inscripción
      inscripciones.push(inscripcion);
      localStorage.setItem('olimpiadas_inscripciones', JSON.stringify(inscripciones));

      // Guardar la inscripción actual en sessionStorage para la página de orden de pago
      sessionStorage.setItem('inscripcionActual', JSON.stringify(inscripcion));
      
      // Limpiar la convocatoria del sessionStorage después de guardar
      sessionStorage.removeItem('convocatoriaSeleccionada');

      // En lugar de redirigir inmediatamente, mostrar el modal
      setShowModalExito(true);

    } catch (err) {
      console.error('Error al guardar inscripción:', err);
      setError(err.message || 'Error al procesar la inscripción. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agregar esta función para manejar el cierre del modal
  const handleCerrarModalExito = () => {
    setShowModalExito(false);
    navigate('/estudiante/orden-pago');
  };

  // Agregar función para cerrar el modal de error
  const handleCerrarModalError = () => {
    setShowModalError(false);
    navigate('/estudiante/convocatorias');
  };

  const handleBack = () => {
    // Redirección basada en el tipo de usuario
    if (currentUser.tipoUsuario === 'estudiante') {
      navigate('/estudiante/areas');
    } else {
      navigate('/tutor/estudiantes');
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2 className="text-center">
              Inscripción a {config?.nombre || 'Áreas Olímpicas'}
            </h2>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando información...</p>
          </div>
        ) : (
          <>
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5>Información del Estudiante</h5>
                    <p><strong>Nombre:</strong> {estudiante?.nombre} {estudiante?.apellido}</p>
                    <p><strong>CI:</strong> {estudiante?.ci}</p>
                    <p><strong>Curso:</strong> {estudiante?.curso <= 6 ? `${estudiante?.curso}° Primaria` : `${estudiante?.curso - 6}° Secundaria`}</p>
                    <p><strong>Colegio:</strong> {estudiante?.colegio?.nombre || 'No asignado'}</p>
                  </Col>
                  <Col md={6}>
                    <h5>Información de la Convocatoria</h5>
                    <p><strong>Período de Inscripción:</strong></p>
                    <p>{new Date(config?.fecha_inicio_inscripciones).toLocaleDateString()} al {new Date(config?.fecha_fin_inscripciones).toLocaleDateString()}</p>
                    <p><strong>Costo por área:</strong> Bs. {config?.costo_por_area || 16}</p>
                    <p><strong>Máximo de áreas:</strong> {config?.maximo_areas || 2} por estudiante</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <form onSubmit={handleSubmit}>
              <div className="areas-selection">
                <h3>Selección de Áreas (máximo {config?.maximo_areas || 2})</h3>
                <p className="areas-price-info">Precio por área: Bs. {config?.costo_por_area || 16}</p>
                
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
                          onChange={() => handleAreaChange(area.id)}
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
                  <p><strong>Áreas seleccionadas:</strong> {areasSeleccionadas.length}</p>
                  <p><strong>Costo total:</strong> Bs. {areasSeleccionadas.length * (config?.costo_por_area || 16)}</p>
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
                  {isSubmitting ? 'Procesando...' : 'Confirmar Selección'}
                </button>
      </div>
            </form>
          </>
        )}
      </Container>
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
      <h2>Inscripción a {config?.nombre || 'Áreas Olímpicas'}</h2>
      
      {mensaje && (
        <Alert variant="success" className="mb-4">
          <Alert.Heading>¡Éxito!</Alert.Heading>
          <p>{mensaje}</p>
        </Alert>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="student-info">
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <h5>Información del Estudiante</h5>
                <p><strong>Nombre:</strong> {estudiante?.nombre} {estudiante?.apellido}</p>
                <p><strong>CI:</strong> {estudiante?.ci}</p>
                <p><strong>Curso:</strong> {estudiante?.curso <= 6 ? `${estudiante?.curso}° Primaria` : `${estudiante?.curso - 6}° Secundaria`}</p>
                <p><strong>Colegio:</strong> {estudiante?.colegio?.nombre || 'No asignado'}</p>
              </Col>
              <Col md={6}>
                <h5>Información de la Convocatoria</h5>
                <p><strong>Período de Inscripción:</strong></p>
                <p>{new Date(config?.fecha_inicio_inscripciones).toLocaleDateString()} al {new Date(config?.fecha_fin_inscripciones).toLocaleDateString()}</p>
                <p><strong>Costo por área:</strong> Bs. {config?.costo_por_area || 16}</p>
                <p><strong>Máximo de áreas:</strong> {config?.maximo_areas || 2} por estudiante</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      
      <form onSubmit={handleSubmit}>
        <div className="areas-selection">
          <h3>Selección de Áreas (máximo {config?.maximo_areas || 2})</h3>
          <p className="areas-price-info">Precio por área: Bs. {config?.costo_por_area || 16}</p>
          
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
                    onChange={() => handleAreaChange(area.id)}
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
            <p><strong>Áreas seleccionadas:</strong> {areasSeleccionadas.length}</p>
            <p><strong>Costo total:</strong> Bs. {areasSeleccionadas.length * (config?.costo_por_area || 16)}</p>
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
            {isSubmitting ? 'Procesando...' : 'Confirmar Selección'}
          </button>
        </div>
      </form>
      </div>

      {/* Modal de Éxito */}
      <Modal show={showModalExito} onHide={handleCerrarModalExito} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>¡Inscripción Exitosa!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FaCheckCircle className="text-success mb-3" style={{ fontSize: '3rem' }} />
            <p className="mb-0">Te has inscrito correctamente en la convocatoria.</p>
            <p className="mb-0">Serás redirigido a la página de orden de pago.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleCerrarModalExito}>
            Ver Orden de Pago
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Error */}
      <Modal show={showModalError} onHide={handleCerrarModalError} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Inscripción No Permitida</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FaExclamationCircle className="text-danger mb-3" style={{ fontSize: '3rem' }} />
            <p className="mb-0">{errorModalMessage}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCerrarModalError}>
            Volver a Convocatorias
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default InscripcionIndividual;