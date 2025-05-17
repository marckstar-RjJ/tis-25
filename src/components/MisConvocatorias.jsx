import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge, Card, Button, Spinner } from 'react-bootstrap';

const MisConvocatorias = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [convocatorias, setConvocatorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cargar todas las convocatorias disponibles
  useEffect(() => {
    const cargarConvocatorias = () => {
      try {
        setLoading(true);
        
        // Obtener convocatorias desde localStorage
        const convocatoriasKey = 'olimpiadas_convocatorias';
        const data = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
        
        // Mostrar todas las convocatorias y garantizar áreas correctas por convocatoria
        console.log('Convocatorias encontradas:', data);
        
        // Obtener todas las áreas disponibles
        const todasLasAreas = JSON.parse(localStorage.getItem('olimpiadas_areas') || '[]');
        
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
        
        // Asignar áreas según el nombre exacto de cada convocatoria
        const convocatoriasActualizadas = data.map(convocatoria => {
          if (convocatoria.nombre === 'Olimpiadas Oh Sansi!') {
            console.log('RESET: Asignando áreas fijas para Oh Sansi!');
            return { ...convocatoria, areas: areasOhSansi };
          }
          else if (convocatoria.nombre === 'Olimpiadas Skillparty') {
            console.log('RESET: Asignando áreas fijas para Skillparty!');
            return { ...convocatoria, areas: areasSkillparty };
          }
          else if (convocatoria.nombre === 'Torneo Lolsito') {
            console.log('RESET: Asignando áreas fijas para Lolsito!');
            return { ...convocatoria, areas: areasLolsito };
          }
          else {
            return { ...convocatoria, areas: convocatoria.areas || [] };
          }
        });
        
        // Guardar las convocatorias actualizadas en localStorage
        localStorage.setItem(convocatoriasKey, JSON.stringify(convocatoriasActualizadas));
        
        setConvocatorias(convocatoriasActualizadas);
        console.log('Convocatorias actualizadas con áreas filtradas:', convocatoriasActualizadas);
      } catch (err) {
        console.error('Error al cargar convocatorias:', err);
        setError('No se pudieron cargar las convocatorias disponibles.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarConvocatorias();
  }, []);
  
  // Función para determinar el estado de una convocatoria
  const getEstadoConvocatoria = (convocatoria) => {
    // Por defecto, mostrar todas las convocatorias como disponibles
    // para que el usuario pueda verlas durante la fase de desarrollo
    return { estado: 'Disponible', variant: 'success' };
  };
  
  // Función para formatear fechas
  const formatearFecha = (isoString) => {
    if (!isoString) return '';
    const fecha = new Date(isoString);
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
                      <Button 
                        variant="primary" 
                        onClick={() => seleccionarConvocatoria(convocatoria.id)}
                      >
                        Inscribirme en áreas
                      </Button>
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
