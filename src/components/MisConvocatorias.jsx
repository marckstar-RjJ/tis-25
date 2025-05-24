import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { getConvocatoriasActivas, loadConvocatorias } from '../services/dataSync';

const MisConvocatorias = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [convocatorias, setConvocatorias] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cargar todas las convocatorias disponibles y las inscripciones del estudiante
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Usar el servicio dataSync para obtener convocatorias activas
        // Esto garantiza consistencia entre sesiones de diferentes usuarios
        console.log('Obteniendo convocatorias activas usando dataSync...');
        
        // Primero intentamos obtener convocatorias de la API
        let convocatoriasData = [];
        try {
          // Intentar obtener desde la API primero
          const apiConvocatorias = await apiService.getConvocatorias();
          console.log('Convocatorias obtenidas de la API:', apiConvocatorias);
          
          if (Array.isArray(apiConvocatorias) && apiConvocatorias.length > 0) {
            convocatoriasData = apiConvocatorias;
          }
        } catch (apiError) {
          console.error('Error al obtener convocatorias de la API:', apiError);
        }
        
        // Cargar convocatorias desde localStorage usando dataSync como fuente definitiva
        // Esto asegura que los cambios hechos por el administrador sean visibles
        const storedConvocatorias = loadConvocatorias();
        console.log('Convocatorias cargadas desde localStorage (fuente principal):', storedConvocatorias);
        
        // Si tenemos datos en localStorage, usarlos como fuente principal
        if (storedConvocatorias.length > 0) {
          convocatoriasData = storedConvocatorias;
        }
        
        // Filtrar solo las convocatorias activas para estudiantes
        const convocatoriasActivas = getConvocatoriasActivas();
        console.log('Convocatorias activas filtradas:', convocatoriasActivas);
        
        // Si hay convocatorias activas, usarlas preferentemente
        if (convocatoriasActivas.length > 0) {
          convocatoriasData = convocatoriasActivas;
        }
        
        // Si no hay convocatorias, crear unas de muestra (solo para desarrollo)
        if (convocatoriasData.length === 0) {
          console.log('Creando convocatorias de muestra...');
          convocatoriasData = [
            {
              id: '1',
              nombre: 'Olimpiada Científica 2025',
              descripcion: 'Olimpiada anual de ciencias para estudiantes de primaria y secundaria',
              fecha_inicio_inscripciones: '2025-05-01T00:00:00',
              fecha_fin_inscripciones: '2025-06-30T23:59:59',
              costo_por_area: 30,
              maximo_areas: 3,
              activa: true
            },
            {
              id: '2',
              nombre: 'Olimpiadas Oh Sansi!',
              descripcion: 'Competencia científica interdisciplinaria',
              fecha_inicio_inscripciones: new Date().toISOString().split('T')[0] + 'T00:00:00', // Hoy
              fecha_fin_inscripciones: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0] + 'T23:59:59', // Un mes después
              costo_por_area: 16,
              maximo_areas: 2,
              activa: true
            },
            {
              id: '3',
              nombre: 'Olimpiadas Skillparty',
              descripcion: 'Torneo de habilidades científicas',
              fecha_inicio_inscripciones: '2025-07-15T00:00:00',
              fecha_fin_inscripciones: '2025-08-15T23:59:59',
              costo_por_area: 25,
              maximo_areas: 3,
              activa: false
            }
          ];
          
          // Guardar las convocatorias de muestra en localStorage
          localStorage.setItem('olimpiadas_convocatorias', JSON.stringify(convocatoriasData));
        }
        
        // Filtrar y clasificar convocatorias según su estado actual
        const convocatoriasActualizadas = [];
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día
        
        convocatoriasData.forEach(convocatoria => {
          // Normalizar el formato de datos
          if (!convocatoria.areas) {
            convocatoria.areas = [];
          }
          
          // Determinar el estado real basado en las fechas y el campo 'activa'
          const fechaInicio = new Date(convocatoria.fecha_inicio_inscripciones);
          const fechaFin = new Date(convocatoria.fecha_fin_inscripciones);
          
          // Determinar si está abierta para inscripciones
          const inscripcionesAbiertas = 
            convocatoria.activa && 
            fechaInicio <= hoy && 
            fechaFin >= hoy;
          
          // Crear copia de la convocatoria con información adicional para UI
          const convocatoriaUI = {
            ...convocatoria,
            inscripcionesAbiertas,
            estado: inscripcionesAbiertas ? 'abierta' : 'cerrada'
          };
          
          convocatoriasActualizadas.push(convocatoriaUI);
        });
        
        setConvocatorias(convocatoriasActualizadas);
        console.log('Convocatorias disponibles:', convocatoriasActualizadas);
        
        // Obtener inscripciones del estudiante actual
        if (currentUser) {
          try {
            const inscripcionesKey = 'olimpiadas_inscripciones';
            const todasLasInscripciones = JSON.parse(localStorage.getItem(inscripcionesKey) || '[]');
            
            // Filtrar inscripciones del estudiante actual
            const inscripcionesEstudiante = todasLasInscripciones.filter(
              inscripcion => inscripcion.estudiante_id === currentUser.id
            );
            
            console.log('Inscripciones del estudiante:', inscripcionesEstudiante);
            setInscripciones(inscripcionesEstudiante);
          } catch (inscripcionesError) {
            console.error('Error al cargar inscripciones:', inscripcionesError);
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      cargarDatos();
    } else {
      setLoading(false);
    }
  }, [currentUser, navigate]);
  
  // Manejar la selección de una convocatoria para inscripción
  const handleSeleccionarConvocatoria = (convocatoriaId) => {
    // Verificar si la convocatoria está abierta
    const convocatoriaSeleccionada = convocatorias.find(c => c.id === convocatoriaId);
    
    if (!convocatoriaSeleccionada || !convocatoriaSeleccionada.inscripcionesAbiertas) {
      setError('Esta convocatoria no está disponible para inscripciones en este momento.');
      return;
    }
    
    // Guardar ID de la convocatoria seleccionada en sessionStorage
    sessionStorage.setItem('convocatoriaSeleccionadaId', convocatoriaId);
    
    // Navegar a la página de inscripción
    navigate('/estudiante/inscripcion-area');
  };
  
  // Renderizar tarjeta de convocatoria
  const renderConvocatoriaCard = (convocatoria) => {
    // Verificar si el estudiante ya está inscrito en esta convocatoria
    const yaInscrito = inscripciones.some(i => i.convocatoria_id === convocatoria.id);
    
    return (
      <Card className="mb-3" key={convocatoria.id}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <span className="fw-bold">{convocatoria.nombre}</span>
            <span className={`ms-2 badge ${convocatoria.inscripcionesAbiertas ? 'bg-success' : 'bg-secondary'}`}>
              {convocatoria.inscripcionesAbiertas ? 'Abierta' : 'Cerrada'}
            </span>
          </div>
        </Card.Header>
        <Card.Body>
          <p>{convocatoria.descripcion}</p>
          <Row className="mb-3">
            <Col md={6}>
              <p><strong>Período de inscripción:</strong><br />
                {new Date(convocatoria.fecha_inicio_inscripciones).toLocaleDateString()} - {new Date(convocatoria.fecha_fin_inscripciones).toLocaleDateString()}
              </p>
            </Col>
            <Col md={6}>
              <p><strong>Costo por área:</strong> Bs. {convocatoria.costo_por_area}</p>
              <p><strong>Máx. áreas por estudiante:</strong> {convocatoria.maximo_areas}</p>
            </Col>
          </Row>
          
          {yaInscrito ? (
            <Alert variant="info">
              Ya estás inscrito en esta convocatoria. Puedes ver tus inscripciones en la sección "Mis Inscripciones".
            </Alert>
          ) : (
            <div className="d-flex justify-content-end">
              <Button 
                variant="primary" 
                disabled={!convocatoria.inscripcionesAbiertas}
                onClick={() => handleSeleccionarConvocatoria(convocatoria.id)}
              >
                {convocatoria.inscripcionesAbiertas ? 'Inscribirme' : 'Inscripciones cerradas'}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando convocatorias...</p>
      </div>
    );
  }
  
  return (
    <div className="container py-4">
      <h2>Mis Convocatorias</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {convocatorias.length === 0 ? (
        <Alert variant="info">
          No hay convocatorias disponibles en este momento. Por favor, verifica más tarde.
        </Alert>
      ) : (
        <div className="mt-4">
          {convocatorias.map(renderConvocatoriaCard)}
        </div>
      )}
    </div>
  );
};

export default MisConvocatorias;
