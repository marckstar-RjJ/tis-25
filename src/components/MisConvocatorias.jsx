import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { apiService } from '../services/api';

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
        
        // Obtener convocatorias desde la API
        console.log('Obteniendo convocatorias desde la API...');
        let convocatoriasData;
        
        try {
          // Intentar obtener desde la API
          convocatoriasData = await apiService.getConvocatorias();
          console.log('Convocatorias obtenidas de la API:', convocatoriasData);
        } catch (apiError) {
          console.error('Error al obtener convocatorias de la API:', apiError);
          
          // Si falla, usar datos de respaldo / localStorage
          console.log('Usando datos de respaldo...');
          convocatoriasData = JSON.parse(localStorage.getItem('olimpiadas_convocatorias') || '[]');
          
          // Si no hay datos de respaldo, crear convocatorias de muestra
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
                estado: 'abierta'
              },
              {
                id: '2',
                nombre: 'Olimpiadas Oh Sansi!',
                descripcion: 'Competencia de conocimientos científicos para todos los niveles',
                fecha_inicio_inscripciones: '2025-07-15T00:00:00',
                fecha_fin_inscripciones: '2025-08-15T23:59:59',
                costo_por_area: 25,
                maximo_areas: 2,
                estado: 'programada'
              }
            ];
          }
        }
        
        // Definir áreas para cada convocatoria
        // Áreas científicas estándar
        const areasCientificas = [
          { id: "1", nombre: "Astronomía", descripcion: "Estudio del universo y los cuerpos celestes" },
          { id: "2", nombre: "Biología", descripcion: "Estudio de los seres vivos" },
          { id: "3", nombre: "Física", descripcion: "Estudio de la materia y la energía" },
          { id: "4", nombre: "Matemáticas", descripcion: "Estudio de números, estructuras y patrones" },
          { id: "5", nombre: "Informática", descripcion: "Estudio de la computación y programación" },
          { id: "6", nombre: "Robótica", descripcion: "Diseño y construcción de robots" },
          { id: "7", nombre: "Química", descripcion: "Estudio de la composición de la materia" }
        ];
        
        // Asignar áreas a convocatorias que no las tengan
        const convocatoriasActualizadas = convocatoriasData.map(convocatoria => {
          // Si la convocatoria ya tiene áreas definidas, mantenerlas
          if (convocatoria.areas && convocatoria.areas.length > 0) {
            return convocatoria;
          }
          
          // Asignar áreas basadas en el tipo de convocatoria
          return { ...convocatoria, areas: areasCientificas };
        });
        
        // Guardar en localStorage como respaldo
        localStorage.setItem('olimpiadas_convocatorias', JSON.stringify(convocatoriasActualizadas));
        
        // Obtener inscripciones del estudiante
        let inscripcionesEstudiante = [];
        try {
          const student = await apiService.getCurrentStudent();
          
          if (student) {
            // Buscar inscripciones en el estudiante
            if (student.areasInscritas && student.areasInscritas.length > 0) {
              inscripcionesEstudiante.push({
                id: student.id + '-inscripcion',
                areas: student.areasInscritas,
                convocatoriaId: student.convocatoriaId || '1', // ID por defecto
                fechaInscripcion: student.boletaPago?.fecha || new Date().toISOString(),
                ordenPago: student.boletaPago
              });
            }
            
            // Si hay una estructura específica para inscripciones, usarla
            if (student.inscripciones && Array.isArray(student.inscripciones)) {
              student.inscripciones.forEach(insc => inscripcionesEstudiante.push(insc));
            }
          }
        } catch (profileError) {
          console.error('Error al obtener perfil del estudiante:', profileError);
          // Usar datos vacíos si no se puede obtener el perfil
          inscripcionesEstudiante = [];
        }
        
        console.log('Inscripciones del estudiante:', inscripcionesEstudiante);
        setInscripciones(inscripcionesEstudiante);
        setConvocatorias(convocatoriasActualizadas);
        console.log('Convocatorias disponibles:', convocatoriasActualizadas);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos necesarios.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, []);
  
  // Verificar si el estudiante ya está inscrito en una convocatoria específica
  const estaInscritoEnConvocatoria = (convocatoriaId) => {
    return inscripciones.some(inscripcion => 
      inscripcion.convocatoriaId === convocatoriaId || 
      (inscripcion.convocatoria && inscripcion.convocatoria.id === convocatoriaId)
    );
  };
  
  // Función para determinar el estado de una convocatoria
  const getEstadoConvocatoria = (convocatoria) => {
    const inscrito = estaInscritoEnConvocatoria(convocatoria.id);
    const hoy = new Date();
    const fechaInicio = new Date(convocatoria.fecha_inicio_inscripciones);
    const fechaFin = new Date(convocatoria.fecha_fin_inscripciones);
    
    if (inscrito) {
      return { estado: 'Inscrito', variant: 'secondary', mensaje: 'Ya estás inscrito en esta convocatoria', inscribible: false };
    }
    
    if (hoy < fechaInicio) {
      return { 
        estado: 'Programada', 
        variant: 'info', 
        mensaje: `Las inscripciones se abren el ${formatearFecha(convocatoria.fecha_inicio_inscripciones)}`,
        inscribible: false 
      };
    }
    
    if (hoy > fechaFin) {
      return { 
        estado: 'Cerrada', 
        variant: 'danger', 
        mensaje: `Las inscripciones cerraron el ${formatearFecha(convocatoria.fecha_fin_inscripciones)}`,
        inscribible: false 
      };
    }
    
    // Convocatoria con inscripciones abiertas actualmente
    return { 
      estado: 'Abierta', 
      variant: 'success', 
      mensaje: 'Inscripciones abiertas',
      inscribible: true 
    };
  };
  
  // Función para formatear fechas
  const formatearFecha = (isoString) => {
    if (!isoString) return '';
    
    // Parsear la fecha ISO string manualmente para evitar el ajuste de zona horaria
    const [year, month, day] = isoString.split('T')[0].split('-').map(Number);
    
    // Crear un objeto Date local (usando el constructor con año, mes-1, día)
    const fecha = new Date(year, month-1, day);
    
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Función para seleccionar una convocatoria e ir a inscripción de áreas
  const seleccionarConvocatoria = (convocatoriaId) => {
    // Guardar el ID de la convocatoria seleccionada en sessionStorage
    sessionStorage.setItem('convocatoriaSeleccionadaId', convocatoriaId);
    navigate('/estudiante/inscripcion-areas');
  };
  
  // Función para ver las áreas en las que ya estás inscrito
  const verMisAreas = () => {
    navigate('/estudiante/mis-areas');
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
    <div className="mis-convocatorias">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis Convocatorias</h2>
        <Button variant="outline-primary" onClick={verMisAreas}>
          Ver mis áreas inscritas
        </Button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {convocatorias.length === 0 ? (
        <div className="alert alert-info">
          <h4>No hay convocatorias disponibles</h4>
          <p>Actualmente no hay convocatorias activas para inscripción. Por favor, vuelve más tarde.</p>
        </div>
      ) : (
        <div className="row">
          {convocatorias.map(convocatoria => {
            const estadoInfo = getEstadoConvocatoria(convocatoria);
            
            return (
              <div key={convocatoria.id} className="col-md-6 mb-4">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{convocatoria.nombre}</h5>
                    <Badge bg={estadoInfo.variant}>{estadoInfo.estado}</Badge>
                  </Card.Header>
                  
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Período de inscripción:</strong>
                      <p>{formatearFecha(convocatoria.fecha_inicio_inscripciones)} al {formatearFecha(convocatoria.fecha_fin_inscripciones)}</p>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Costo por área:</strong>
                      <p>{convocatoria.costo_por_area} Bs</p>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Áreas disponibles:</strong>
                      <p>{convocatoria.areas?.length || 0} áreas</p>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Máximo de áreas por estudiante:</strong>
                      <p>{convocatoria.maximo_areas}</p>
                    </div>
                    
                    <div className="text-center mt-3">
                      {estaInscritoEnConvocatoria(convocatoria.id) ? (
                        <>
                          <Button 
                            variant="secondary" 
                            disabled
                          >
                            Inscrito
                          </Button>
                          <div className="mt-2">
                            <small className="text-muted">Ya estás inscrito en esta convocatoria</small>
                          </div>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant={estadoInfo.inscribible ? "primary" : "outline-" + estadoInfo.variant} 
                            onClick={() => seleccionarConvocatoria(convocatoria.id)}
                            disabled={!estadoInfo.inscribible}
                          >
                            {estadoInfo.inscribible ? "Inscribirme en áreas" : estadoInfo.estado}
                          </Button>
                          <div className="mt-2">
                            <small className={estadoInfo.inscribible ? "text-success" : "text-muted"}>
                              {estadoInfo.mensaje}
                            </small>
                          </div>
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisConvocatorias;
