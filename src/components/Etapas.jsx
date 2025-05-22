import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';

function Etapas() {
  const [convocatoriasActivas, setConvocatoriasActivas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConvocatorias = async () => {
      try {
        const data = await apiService.getConvocatoriasAbiertas();
        setConvocatoriasActivas(data);
      } catch (err) {
        console.error('Error al cargar convocatorias:', err);
        setError('No se pudieron cargar las convocatorias disponibles.');
      } finally {
        setLoading(false);
      }
    };

    fetchConvocatorias();
  }, []);
  
  // Función para formatear fechas
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString || new Date());
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <Link to="/">
            <img src="/logo_umss.png" alt="Logo UMSS" className="logo" />
          </Link>
          <nav className="main-nav">
            <Link to="/convocatorias">Convocatorias</Link>
            <Link to="/etapas" className="active">Etapas</Link>
            <Link to="/reglamento">Reglamento</Link>
            <Link to="/contactanos">Contactanos</Link>
          </nav>
        </div>
        <div className="auth-buttons">
          <Link to="/" className="btn btn-ingresar">
            Volver al Inicio
          </Link>
        </div>
      </header>

      <div className="etapas-container" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)', margin: '30px auto', maxWidth: '1200px' }}>
        <h1>Etapas de las Olimpiadas</h1>
        
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando información de convocatorias...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : convocatoriasActivas.length === 0 ? (
          <Alert variant="info">
            <Alert.Heading>No hay convocatorias activas</Alert.Heading>
            <p>En este momento no hay convocatorias abiertas para inscripción. Revisa más tarde para ver nuevas convocatorias.</p>
          </Alert>
        ) : (
          <>
            <p className="lead mb-4">A continuación se muestran las etapas de las convocatorias actualmente disponibles para inscripción.</p>
            
            <Row xs={1} className="g-4">
              {convocatoriasActivas.map((convocatoria) => (
                <Col key={convocatoria.id}>
                  <Card className="mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)' }}>
                    <Card.Header className="bg-primary text-white">
                      <h3 className="mb-0">{convocatoria.nombre}</h3>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-4">
                        <h4>Información General</h4>
                        <p>
                          <strong>Periodo de inscripciones:</strong> {formatearFecha(convocatoria.fecha_inicio_inscripciones)} al {formatearFecha(convocatoria.fecha_fin_inscripciones)}
                        </p>
                        <p>
                          <strong>Áreas disponibles:</strong> {convocatoria.areas ? convocatoria.areas.length : 0}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <h4>Etapa Clasificatoria</h4>
                        <div className="etapa-info p-3 border rounded mb-3">
                          <p>
                            <strong>Fecha:</strong> {formatearFecha(convocatoria.fecha_clasificatoria || '2025-05-31')}
                          </p>
                          <p>
                            <strong>Modalidad:</strong> Pruebas presenciales
                          </p>
                          <p>
                            <strong>Lugar:</strong> Campus de la UMSS
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h4>Etapa Final</h4>
                        <div className="etapa-info p-3 border rounded mb-3">
                          <p>
                            <strong>Fecha:</strong> {formatearFecha(convocatoria.fecha_final || '2025-07-11')}
                          </p>
                          <p>
                            <strong>Modalidad:</strong> Pruebas presenciales
                          </p>
                          <p>
                            <strong>Lugar:</strong> Campus de la UMSS
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h4>Premiación</h4>
                        <div className="etapa-info p-3 border rounded">
                          <p>
                            <strong>Fecha:</strong> {formatearFecha(convocatoria.fecha_premiacion || '2025-07-11')}
                          </p>
                          <p>
                            <strong>Lugar:</strong> Campus de la UMSS
                          </p>
                          <p>
                            <strong>Hora:</strong> 15:00 pm
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-center mt-3">
                        <Link to="/registro" className="btn btn-primary">
                          Inscribirse a esta convocatoria
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </div>
    </div>
  );
}

export default Etapas;
