import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import SeleccionConvocatoria from '../src/components/convocatorias/SeleccionConvocatoria';
import { formatearFecha } from '../src/utils/formatoFechas';

function InscripcionAreaActualizado() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Estado para el flujo de inscripción
  const [etapa, setEtapa] = useState('seleccionConvocatoria'); // 'seleccionConvocatoria' o 'seleccionAreas'
  
  // Estado para datos del estudiante y áreas
  const [student, setStudent] = useState(null);
  const [areas, setAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState([]);
  
  // Estado para la convocatoria seleccionada
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState(null);
  
  // Estado para carga y mensajes
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  // Cargar los datos del estudiante al iniciar
  useEffect(() => {
    const cargarDatosEstudiante = async () => {
      try {
        // Obtener datos del estudiante
        const studentData = await apiService.getStudentById(studentId);
        setStudent(studentData);
        
        // Si el estudiante ya tiene áreas inscritas, inicializarlas
        if (studentData.areasInscritas && studentData.areasInscritas.length > 0) {
          setSelectedAreaIds(studentData.areasInscritas);
        }
      } catch (err) {
        console.error('Error al cargar datos del estudiante:', err);
        setError('No se pudieron cargar los datos del estudiante. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatosEstudiante();
  }, [studentId]);

  // Cuando se selecciona una convocatoria, cargar sus áreas disponibles
  useEffect(() => {
    const cargarAreasConvocatoria = async () => {
      if (!convocatoriaSeleccionada) return;
      
      try {
        // Las áreas ya vienen con la convocatoria seleccionada
        setAreas(convocatoriaSeleccionada.areas);
        
        // Calcular costo total inicial
        setTotalCost(selectedAreaIds.length * convocatoriaSeleccionada.costo_por_area);
      } catch (err) {
        console.error('Error al cargar áreas de la convocatoria:', err);
        setError('No se pudieron cargar las áreas disponibles. Intente nuevamente.');
      }
    };
    
    cargarAreasConvocatoria();
  }, [convocatoriaSeleccionada, selectedAreaIds]);

  // Actualizar el costo total cuando cambian las áreas seleccionadas
  useEffect(() => {
    if (convocatoriaSeleccionada) {
      setTotalCost(selectedAreas.length * convocatoriaSeleccionada.costo_por_area);
    }
  }, [selectedAreas, convocatoriaSeleccionada]);

  // Manejar la selección de una convocatoria
  const handleSeleccionarConvocatoria = (convocatoria) => {
    setConvocatoriaSeleccionada(convocatoria);
    setEtapa('seleccionAreas');
    
    // Reiniciar la selección de áreas
    setSelectedAreas([]);
    setSelectedAreaIds([]);
  };

  // Manejar la selección/deselección de áreas
  const handleToggleArea = (areaId) => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return;
    
    if (selectedAreaIds.includes(areaId)) {
      // Eliminar área si ya está seleccionada
      setSelectedAreaIds(selectedAreaIds.filter(id => id !== areaId));
      setSelectedAreas(selectedAreas.filter(a => a.id !== areaId));
    } else {
      // Verificar que no exceda el máximo de áreas permitidas
      if (convocatoriaSeleccionada && 
          selectedAreas.length >= convocatoriaSeleccionada.maximo_areas) {
        setError(`No se pueden seleccionar más de ${convocatoriaSeleccionada.maximo_areas} áreas por estudiante.`);
        return;
      }
      
      // Añadir nueva área
      setSelectedAreaIds([...selectedAreaIds, areaId]);
      setSelectedAreas([...selectedAreas, area]);
      setError(''); // Limpiar errores anteriores
    }
  };

  // Manejar envío del formulario de inscripción
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Verificar si es una inscripción válida
      if (!convocatoriaSeleccionada) {
        throw new Error('No se ha seleccionado una convocatoria');
      }
      
      // Verificar si hay áreas seleccionadas
      if (selectedAreaIds.length === 0) {
        throw new Error('Debes seleccionar al menos un área para inscribirte');
      }
      
      // Verificar si estamos dentro del período de inscripción
      const currentDate = new Date();
      const startDate = new Date(convocatoriaSeleccionada.fecha_inicio_inscripciones);
      const endDate = new Date(convocatoriaSeleccionada.fecha_fin_inscripciones);
      
      if (currentDate < startDate) {
        throw new Error(`Las inscripciones para esta convocatoria inician el ${formatearFecha(convocatoriaSeleccionada.fecha_inicio_inscripciones)}`);
      }
      
      if (currentDate > endDate) {
        throw new Error(`Las inscripciones para esta convocatoria cerraron el ${formatearFecha(convocatoriaSeleccionada.fecha_fin_inscripciones)}`);
      }

      // Enviar solicitud de inscripción con el ID de la convocatoria
      await apiService.inscribirEstudianteEnAreas(studentId, {
        areaIds: selectedAreaIds,
        convocatoriaId: convocatoriaSeleccionada.id
      });
      
      setSuccess('¡Inscripción realizada con éxito! Se ha generado una orden de pago.');
      
      // Redirigir después de un tiempo
      setTimeout(() => {
        navigate('/tutor/estudiantes');
      }, 2000);
    } catch (err) {
      console.error('Error al actualizar inscripción:', err);
      setError(err.message || 'Error al realizar la inscripción. Intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar el botón de volver a seleccionar convocatoria
  const handleVolverASeleccionarConvocatoria = () => {
    setEtapa('seleccionConvocatoria');
    setConvocatoriaSeleccionada(null);
    setSelectedAreas([]);
    setSelectedAreaIds([]);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando información...</p>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>No se pudo encontrar al estudiante solicitado.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={() => navigate('/tutor/estudiantes')}>
              Volver a Mis Estudiantes
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="light" onClick={() => navigate('/tutor/estudiantes')}>
          <i className="bi bi-arrow-left me-2"></i>
          Volver a Mis Estudiantes
        </Button>
        <h2>Inscripción en Olimpiadas Académicas</h2>
      </div>
      
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5">Información del Estudiante</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Nombre:</strong> {student.nombre} {student.apellido}</p>
              <p><strong>CI:</strong> {student.ci}</p>
            </Col>
            <Col md={6}>
              <p><strong>Curso:</strong> {
                student.curso <= 6 
                  ? `${student.curso}° Primaria` 
                  : `${student.curso - 6}° Secundaria`
              }</p>
              <p><strong>Colegio:</strong> {student.colegio?.nombre || 'No asignado'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {etapa === 'seleccionConvocatoria' && (
        <SeleccionConvocatoria onSeleccionarConvocatoria={handleSeleccionarConvocatoria} />
      )}
      
      {etapa === 'seleccionAreas' && convocatoriaSeleccionada && (
        <>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="m-0">Convocatoria: {convocatoriaSeleccionada.nombre}</h5>
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={handleVolverASeleccionarConvocatoria}
              >
                Cambiar convocatoria
              </Button>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <p><strong>Período de inscripción:</strong></p>
                  <p>{formatearFecha(convocatoriaSeleccionada.fecha_inicio_inscripciones)} al {formatearFecha(convocatoriaSeleccionada.fecha_fin_inscripciones)}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Costo por área:</strong></p>
                  <p>Bs. {convocatoriaSeleccionada.costo_por_area}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Máximo de áreas:</strong></p>
                  <p>{convocatoriaSeleccionada.maximo_areas} por estudiante</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Form onSubmit={handleSubmit}>
            <h3 className="mb-3">Selecciona las áreas de interés</h3>
            
            <Row xs={1} md={2} lg={3} className="g-4 mb-4">
              {areas.map(area => (
                <Col key={area.id}>
                  <Card 
                    className={`h-100 ${selectedAreaIds.includes(area.id) ? 'border-primary' : ''}`}
                    onClick={() => handleToggleArea(area.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start">
                        <Card.Title>{area.nombre}</Card.Title>
                        <Form.Check 
                          type="checkbox"
                          checked={selectedAreaIds.includes(area.id)}
                          onChange={() => {}} // El cambio se maneja en el onClick de la Card
                          onClick={(e) => e.stopPropagation()} // Prevenir doble toggle
                        />
                      </div>
                      <Card.Text>{area.descripcion}</Card.Text>
                      <div className="mt-auto">
                        {selectedAreaIds.includes(area.id) ? (
                          <Badge bg="primary">Seleccionada</Badge>
                        ) : (
                          <Badge bg="light" text="dark">Click para seleccionar</Badge>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            
            <Card className="mb-4">
              <Card.Header>Resumen de inscripción</Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <p><strong>Áreas seleccionadas:</strong> {selectedAreas.length} de {convocatoriaSeleccionada.maximo_areas}</p>
                  </Col>
                  <Col md={8}>
                    <p><strong>Costo total:</strong> Bs. {totalCost}</p>
                  </Col>
                </Row>
                
                {selectedAreas.length > 0 && (
                  <div>
                    <p><strong>Áreas elegidas:</strong></p>
                    <ul className="list-group">
                      {selectedAreas.map(area => (
                        <li key={area.id} className="list-group-item d-flex justify-content-between align-items-center">
                          {area.nombre}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleToggleArea(area.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card.Body>
            </Card>
            
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/tutor/estudiantes')}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={submitting || selectedAreas.length === 0}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar Inscripción'
                )}
              </Button>
            </div>
          </Form>
        </>
      )}
    </Container>
  );
}

export default InscripcionAreaActualizado;
