import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { apiService } from '../../services/api';
import { formatearFecha } from '../utils/formatoFechas';

const SeleccionConvocatoria = ({ onSeleccionarConvocatoria }) => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarConvocatorias();
  }, []);

  const cargarConvocatorias = async () => {
    setLoading(true);
    try {
      const data = await apiService.getConvocatoriasAbiertas();
      setConvocatorias(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar convocatorias:', err);
      setError('No se pudieron cargar las convocatorias disponibles. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionar = (convocatoria) => {
    if (onSeleccionarConvocatoria) {
      onSeleccionarConvocatoria(convocatoria);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando convocatorias disponibles...</p>
      </div>
    );
  }

  if (convocatorias.length === 0) {
    return (
      <div className="my-4">
        <Alert variant="info">
          <Alert.Heading>No hay convocatorias abiertas</Alert.Heading>
          <p>
            Actualmente no hay convocatorias disponibles para inscripción. 
            Por favor revisa más tarde cuando se abra una nueva convocatoria.
          </p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="convocatorias-seleccion">
      <h3 className="mb-4">Selecciona una convocatoria</h3>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row xs={1} md={2} className="g-4">
        {convocatorias.map((convocatoria) => (
          <Col key={convocatoria.id}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{convocatoria.nombre}</Card.Title>
                <Card.Text>
                  <strong>Inscripciones:</strong> {formatearFecha(convocatoria.fecha_inicio_inscripciones)} al {formatearFecha(convocatoria.fecha_fin_inscripciones)}
                </Card.Text>
                <Card.Text>
                  <strong>Costo por área:</strong> Bs. {convocatoria.costo_por_area}
                </Card.Text>
                <Card.Text>
                  <strong>Máximo de áreas:</strong> {convocatoria.maximo_areas} por estudiante
                </Card.Text>
                <Card.Text>
                  <strong>Áreas disponibles:</strong> {convocatoria.areas.length}
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Button 
                  variant="primary" 
                  onClick={() => handleSeleccionar(convocatoria)}
                >
                  Seleccionar esta convocatoria
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SeleccionConvocatoria;
