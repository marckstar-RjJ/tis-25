import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Container, Spinner, Alert, Button, Card } from 'react-bootstrap';

// Función para verificar si el estudiante cumple con los requisitos de un área
const cumpleRequisitosArea = (student, area) => {
  if (!student || !area) return false;
  
  // Verificar si el estudiante tiene curso definido
  if (!student.curso) {
    console.warn('El estudiante no tiene curso definido');
    return false;
  }

  const cursoEstudiante = parseInt(student.curso);
  if (isNaN(cursoEstudiante)) {
    console.warn('El curso del estudiante no es un número válido');
    return false;
  }

  // Si no hay requisitos específicos, cualquier curso puede inscribirse
  if (!area.requisitos || area.requisitos.length === 0) return true;
  
  // Verificar si el curso del estudiante está dentro del rango permitido
  return area.requisitos.some(req => {
    const [min, max] = req.split('-').map(Number);
    return cursoEstudiante >= min && cursoEstudiante <= max;
  });
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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const convocatoriaId = sessionStorage.getItem('convocatoriaSeleccionadaId');
        console.log("FetchData: convocatoriaId from sessionStorage:", convocatoriaId);
        if (!convocatoriaId) {
          setError('No has seleccionado una convocatoria. Debes seleccionar una convocatoria primero.');
          setTimeout(() => navigate('/estudiante/convocatorias'), 2000);
          return;
        }
        
        const convocatoriasKey = 'olimpiadas_convocatorias';
        const convocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
        console.log("FetchData: Convocatorias from localStorage:", convocatorias);
        const convocatoriaSeleccionada = convocatorias.find(c => c.id === convocatoriaId);
        console.log("FetchData: Convocatoria seleccionada:", convocatoriaSeleccionada);
        
        if (!convocatoriaSeleccionada) {
          setError('La convocatoria seleccionada no existe o ha sido eliminada.');
          setTimeout(() => navigate('/estudiante/convocatorias'), 2000);
          return;
        }
        
        const fechaActual = new Date();
        const fechaInicio = new Date(convocatoriaSeleccionada.fecha_inicio_inscripciones);
        const fechaFin = new Date(convocatoriaSeleccionada.fecha_fin_inscripciones);

        if (fechaActual < fechaInicio) {
          setError('Las inscripciones para esta convocatoria aún no han comenzado.');
          setTimeout(() => navigate('/estudiante/convocatorias'), 2000);
          return;
        }

        if (fechaActual > fechaFin) {
          setError('Las inscripciones para esta convocatoria ya han finalizado.');
          setTimeout(() => navigate('/estudiante/convocatorias'), 2000);
          return;
        }

        let studentData;
        try {
          studentData = await apiService.getCurrentStudent();

          if (!studentData || !studentData.id) {
            throw new Error('No se pudo obtener la información del estudiante');
          }

          studentData.curso = parseInt(studentData.curso) || 0;

        } catch (studentError) {
          console.error('Error al obtener datos del estudiante:', studentError);
          
          if (currentUser) {
            studentData = {
              ...currentUser,
              curso: parseInt(currentUser.curso) || 0
            };
          } else {
            throw new Error('No se pudo obtener la información del estudiante');
          }
        }
        
        setStudent(studentData);
        
        let areasDisponibles = [];
        console.log("FetchData: Convocatoria seleccionada nombre:", convocatoriaSeleccionada.nombre);

        // Intentar usar las áreas de la convocatoria si están presentes y son un array
        if (Array.isArray(convocatoriaSeleccionada.areas) && convocatoriaSeleccionada.areas.length > 0) {
          areasDisponibles = convocatoriaSeleccionada.areas;
          console.log("FetchData: Usando áreas de la convocatoria seleccionada.", areasDisponibles);
        } else {
          // Si no hay áreas en la convocatoria, usar las hardcodeadas como respaldo
          console.log("FetchData: No hay áreas en la convocatoria seleccionada o no es un array. Usando áreas hardcodeadas como respaldo.");
          if (convocatoriaSeleccionada.nombre === 'Olimpiadas Oh Sansi!') {
            areasDisponibles = [
              { id: "1", nombre: "Astronomía", descripcion: "Estudio del universo y los cuerpos celestes" },
              { id: "2", nombre: "Biología", descripcion: "Estudio de los seres vivos" },
              { id: "3", nombre: "Física", descripcion: "Estudio de la materia y la energía" },
              { id: "4", nombre: "Matemáticas", descripcion: "Estudio de números, estructuras y patrones" },
              { id: "5", nombre: "Informática", descripcion: "Estudio de la computación y programación" },
              { id: "6", nombre: "Robótica", descripcion: "Diseño y construcción de robots" },
              { id: "7", nombre: "Química", descripcion: "Estudio de la composición de la materia" }
            ];
          } else if (convocatoriaSeleccionada.nombre === 'Olimpiadas Skillparty') {
            areasDisponibles = [
              { id: "8", nombre: "Farmeo I", descripcion: "Farmeo de minions y campeones" },
              { id: "9", nombre: "Support II", descripcion: "Asistencia y control de vision" }
            ];
          } else if (convocatoriaSeleccionada.nombre === 'Torneo Lolsito') {
            areasDisponibles = [
              { id: "10", nombre: "Top Lane", descripcion: "Linea superior" },
              { id: "11", nombre: "Mid Lane", descripcion: "Linea central" },
              { id: "12", nombre: "Jungling", descripcion: "Rol de jungla" }
            ];
          } else {
            // Fallback general si no hay áreas en la convocatoria y no coincide con nombres específicos
            areasDisponibles = [
              { id: "1", nombre: "Astronomía", descripcion: "Estudio del universo y los cuerpos celestes" },
              { id: "2", nombre: "Biología", descripcion: "Estudio de los seres vivos" },
              { id: "3", nombre: "Física", descripcion: "Estudio de la materia y la energía" },
              { id: "4", nombre: "Matemáticas", descripcion: "Estudio de números, estructuras y patrones" },
              { id: "5", nombre: "Informática", descripcion: "Estudio de la computación y programación" },
              { id: "6", nombre: "Robótica", descripcion: "Diseño y construcción de robots" },
              { id: "7", nombre: "Química", descripcion: "Estudio de la composición de la materia" }
            ];
            console.log("FetchData: Usando áreas por defecto como último recurso.", areasDisponibles);
          }
        }
        
        console.log("FetchData: Areas disponibles después de la lógica:", areasDisponibles);

        setConvocatoria(convocatoriaSeleccionada);
        setAreas(areasDisponibles);

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'No se pudieron cargar los datos necesarios. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, currentUser]);

  useEffect(() => {
    if (convocatoria && convocatoria.costo_por_area) {
      setTotalCost(selectedAreas.length * convocatoria.costo_por_area);
    }
  }, [selectedAreas, convocatoria]);

  const handleToggleArea = (areaId) => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return;
    
    setSelectedAreaIds(prevSelected => {
      const newSelectedAreaIds = prevSelected.includes(areaId)
        ? prevSelected.filter(id => id !== areaId)
        : [...prevSelected, areaId];

      if (convocatoria && newSelectedAreaIds.length > convocatoria.maximo_areas) {
          alert(`Solo puedes seleccionar un máximo de ${convocatoria.maximo_areas} áreas.`);
        return prevSelected; // No permitir la selección si excede el máximo
      }

      setSelectedAreas(areas.filter(a => newSelectedAreaIds.includes(a.id)));
      console.log("handleToggleArea: Selected areas updated to:", areas.filter(a => newSelectedAreaIds.includes(a.id)));
      return newSelectedAreaIds;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit: Initiated.");
    
    if (selectedAreas.length === 0) {
      setError('Debes seleccionar al menos un área para inscribirte.');
      console.log("handleSubmit: No areas selected.");
      return;
    }
    
    if (convocatoria.maximo_areas && selectedAreas.length > convocatoria.maximo_areas) {
      setError(`Solo puedes inscribirte en un máximo de ${convocatoria.maximo_areas} áreas.`);
      console.log("handleSubmit: Exceeded max areas.");
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const fechaActual = new Date();
      const fechaInicio = new Date(convocatoria.fecha_inicio_inscripciones);
      const fechaFin = new Date(convocatoria.fecha_fin_inscripciones);
      console.log("handleSubmit: Checking dates. Current:", fechaActual, "Start:", fechaInicio, "End:", fechaFin);

      if (fechaActual < fechaInicio) {
        throw new Error(`Las inscripciones comienzan el ${fechaInicio.toLocaleDateString()}`);
      }

      if (fechaActual > fechaFin) {
        throw new Error(`Las inscripciones finalizaron el ${fechaFin.toLocaleDateString()}`);
      }

      const inscripcionesKey = 'olimpiadas_inscripciones';
      const inscripciones = JSON.parse(localStorage.getItem(inscripcionesKey) || '[]');
      console.log("handleSubmit: Current inscripciones:", inscripciones);
      const inscripcionExistente = inscripciones.find(i => i.estudianteId === student.id);
      console.log("handleSubmit: Existing inscripcion for student:", inscripcionExistente);

      if (inscripcionExistente && inscripcionExistente.convocatoriaId !== convocatoria.id) {
        throw new Error('Ya estás inscrito en otra convocatoria. No puedes inscribirte en múltiples convocatorias.');
      }

      const inscripcion = {
        id: Date.now().toString(),
        estudianteId: student.id,
        convocatoriaId: convocatoria.id,
        areas: selectedAreas.map(area => ({
          id: area.id,
          nombre: area.nombre
        })),
        fechaInscripcion: new Date().toISOString(),
        estado: 'pendiente',
        costoTotal: totalCost
      };

      inscripciones.push(inscripcion);
      localStorage.setItem(inscripcionesKey, JSON.stringify(inscripciones));
      console.log("handleSubmit: New inscripcion saved:", inscripcion);

      sessionStorage.removeItem('convocatoriaSeleccionadaId');
      console.log("handleSubmit: convocatoriaSeleccionadaId removed from sessionStorage.");

      setSuccess('¡Inscripción realizada con éxito! Se ha generado una orden de pago.');
      console.log("handleSubmit: Success. Navigating to order page.");

      setTimeout(() => {
        navigate('/estudiante/orden-pago');
      }, 2000);
      
    } catch (err) {
      console.error('Error al realizar la inscripción:', err);
      setError(err.message || 'Error al realizar la inscripción. Intente nuevamente.');
    } finally {
      setSubmitting(false);
      console.log("handleSubmit: Submitting set to false.");
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando información...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={() => navigate('/estudiante/convocatorias')}>
              Volver a Convocatorias
            </Button>
      </div>
        </Alert>
      </Container>
    );
  }

  if (!convocatoria || !student) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Información no disponible</Alert.Heading>
          <p>No se encontró la información necesaria para la inscripción.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-warning" onClick={() => navigate('/estudiante/convocatorias')}>
              Volver a Convocatorias
            </Button>
      </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h3 className="mb-0">Inscripción a Áreas</h3>
        </Card.Header>
        <Card.Body>
          <div className="convocatoria-info mb-4">
            <h4>{convocatoria.nombre}</h4>
          <p><strong>Período de Inscripción:</strong> {new Date(convocatoria.fecha_inicio_inscripciones).toLocaleDateString()} - {new Date(convocatoria.fecha_fin_inscripciones).toLocaleDateString()}</p>
          <p><strong>Precio por área:</strong> Bs. {convocatoria.costo_por_area}</p>
          <p><strong>Máximo de áreas:</strong> {convocatoria.maximo_areas} por estudiante</p>
        </div>
      
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
      
          <form onSubmit={handleSubmit}>
            <h4 className="mb-3">Seleccionar Áreas</h4>
        <div className="areas-grid">
          {areas.map(area => {
            const cumpleRequisitos = cumpleRequisitosArea(student, area);
            return (
                  <Card
                key={area.id} 
                    className={`mb-3 ${selectedAreaIds.includes(area.id) ? 'border-primary' : ''} ${!cumpleRequisitos ? 'bg-light' : ''}`}
                onClick={() => cumpleRequisitos && handleToggleArea(area.id)}
                    style={{ cursor: cumpleRequisitos ? 'pointer' : 'not-allowed' }}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">{area.nombre}</h5>
                          <p className="mb-0 text-muted">{area.descripcion}</p>
                        </div>
                        {selectedAreaIds.includes(area.id) && (
                          <div className="text-primary">
                            <i className="fas fa-check-circle"></i>
                  </div>
                )}
                </div>
                      {!cumpleRequisitos && (
                        <small className="text-danger">
                          No cumples con los requisitos de curso para esta área
                        </small>
                      )}
                    </Card.Body>
                  </Card>
            );
          })}
        </div>
        
            <div className="mt-4">
              <h5>Resumen de Inscripción</h5>
          <p><strong>Áreas seleccionadas:</strong> {selectedAreas.length}</p>
          <p><strong>Costo total:</strong> Bs. {totalCost}</p>
        </div>
        
            <div className="mt-4 d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/estudiante/convocatorias')}
              >
                Volver
              </Button>
              <Button
            type="submit" 
                variant="primary"
                disabled={submitting || selectedAreas.length === 0}
              >
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar Inscripción'
                )}
              </Button>
        </div>
      </form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default InscripcionAreaEstudiante;