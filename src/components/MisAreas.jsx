import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Card, Button, Alert, Badge, Spinner } from 'react-bootstrap';

const MisAreas = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [areasInscritas, setAreasInscritas] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inscripcionExitosa, setInscripcionExitosa] = useState(false);
  const [convocatorias, setConvocatorias] = useState([]);
  const [convocatoriaActual, setConvocatoriaActual] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Obteniendo datos de áreas y convocatorias...");
      
      // Obtener todas las áreas disponibles
      const areasData = await apiService.getAreas();
      setAllAreas(areasData);
      
      // Obtener todas las convocatorias
      const convocatoriasKey = 'olimpiadas_convocatorias';
      const convocatoriasData = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
      setConvocatorias(convocatoriasData);
      
      // Obtener información actualizada del estudiante
      const estudianteData = await apiService.getCurrentStudent();
      
      // Obtener áreas inscritas del estudiante
      if (estudianteData.areasInscritas && estudianteData.areasInscritas.length > 0) {
        // Encontrar los objetos de área completos para las áreas inscritas
        const areasCompletas = areasData.filter(area => 
          estudianteData.areasInscritas.includes(area.id)
        );
        setAreasInscritas(areasCompletas);
        
        // Si el estudiante tiene áreas inscritas, debe estar en alguna convocatoria
        // Buscar la convocatoria correspondiente
        if (estudianteData.convocatoriaId) {
          const convocatoria = convocatoriasData.find(c => c.id === estudianteData.convocatoriaId);
          if (convocatoria) {
            setConvocatoriaActual(convocatoria);
          }
        }
      } else {
        setAreasInscritas([]);
      }
    } catch (err) {
      console.error('Error al cargar áreas inscritas:', err);
      setError('No se pudieron cargar las áreas inscritas. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleInscripcion = () => {
    console.log("Redirigiendo a la selección de convocatorias...");
    navigate('/estudiante/convocatorias');
  };



  // Función para ir a la generación de orden de pago
  const handleGenerarOrdenPago = () => {
    console.log("Redirigiendo a orden de pago...");
    navigate('/estudiante/orden-pago');
  };

  if (loading) {
    return <p>Cargando áreas inscritas...</p>;
  }



  // Formatear fechas
  const formatearFecha = (isoString) => {
    if (!isoString) return '';
    const fecha = new Date(isoString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="mis-areas">
      <h2>Mis Áreas Académicas</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {inscripcionExitosa && <Alert variant="success">¡Inscripción realizada correctamente!</Alert>}
      
      {convocatoriaActual && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Convocatoria: {convocatoriaActual.nombre}</h5>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-6">
                <p><strong>Período de inscripción:</strong> {formatearFecha(convocatoriaActual.fecha_inicio_inscripciones)} al {formatearFecha(convocatoriaActual.fecha_fin_inscripciones)}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Costo por área:</strong> {convocatoriaActual.costo_por_area} Bs</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {areasInscritas.length === 0 ? (
        <div className="text-center p-5 bg-light rounded">
          <h4>No estás inscrito en ninguna área académica todavía</h4>
          <p className="mb-4">Selecciona una convocatoria activa para inscribirte en las áreas de tu interés.</p>
          <Button variant="primary" onClick={handleInscripcion} size="lg">
            Ver convocatorias disponibles
          </Button>
        </div>
      ) : (
        <div className="areas-container">
          <h3 className="mb-3">Áreas inscritas</h3>
          <div className="row">
            {areasInscritas.map(area => (
              <div key={area.id} className="col-md-4 mb-4">
                <Card className="h-100">
                  <Card.Header>
                    <h5 className="mb-0">{area.nombre}</h5>
                  </Card.Header>
                  <Card.Body>
                    <p>{area.descripcion}</p>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="d-flex justify-content-between mt-4">
            <Button variant="outline-primary" onClick={handleInscripcion}>
              Modificar inscripción
            </Button>
            
            <Button 
              variant="success" 
              onClick={handleGenerarOrdenPago} 
              disabled={areasInscritas.length === 0}
            >
              Generar orden de pago
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisAreas; 