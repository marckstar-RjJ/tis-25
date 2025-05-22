import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Card, Row, Col, Nav, Tab, Alert, Spinner, Badge } from 'react-bootstrap';

function ConvocatoriasPublicas() {
  const [convocatorias, setConvocatorias] = useState({
    activas: [],
    pasadas: [],
    futuras: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConvocatorias = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAllConvocatorias();
        
        const ahora = new Date();
        const activas = [];
        const pasadas = [];
        const futuras = [];
        
        data.forEach(convocatoria => {
          const fechaInicio = new Date(convocatoria.fecha_inicio_inscripciones);
          const fechaFin = new Date(convocatoria.fecha_fin_inscripciones);
          
          if (fechaInicio > ahora) {
            futuras.push(convocatoria);
          } else if (fechaFin < ahora) {
            pasadas.push(convocatoria);
          } else {
            activas.push(convocatoria);
          }
        });
        
        setConvocatorias({
          activas,
          pasadas,
          futuras
        });
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar convocatorias:', err);
        setError('No se pudieron cargar las convocatorias. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchConvocatorias();
  }, []);

  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderConvocatoriasList = (lista, mensaje) => {
    if (lista.length === 0) {
      return (
        <Alert variant="info" className="text-center mt-3">
          {mensaje}
        </Alert>
      );
    }

    return (
      <Row xs={1} md={2} lg={3} className="g-4 mt-2">
        {lista.map(convocatoria => (
          <Col key={convocatoria.id}>
            <Card className="h-100 shadow-sm" style={{ backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">{convocatoria.nombre}</h5>
              </Card.Header>
              <Card.Body>
                <Card.Title>
                  <Badge bg={
                    lista === convocatorias.activas ? "success" : 
                    lista === convocatorias.futuras ? "info" : "secondary"
                  }>
                    {lista === convocatorias.activas ? "Activa" : 
                     lista === convocatorias.futuras ? "Próximamente" : "Finalizada"}
                  </Badge>
                </Card.Title>
                <Card.Text>
                  <strong>Inscripciones:</strong><br />
                  {formatearFecha(convocatoria.fecha_inicio_inscripciones)} al {formatearFecha(convocatoria.fecha_fin_inscripciones)}
                </Card.Text>
                <Card.Text>
                  <strong>Costo por área:</strong> ${convocatoria.costo_por_area}
                </Card.Text>
                <Card.Text>
                  <strong>Máximo de áreas:</strong> {convocatoria.maximo_areas} por estudiante
                </Card.Text>
                <Card.Text>
                  <strong>Áreas disponibles:</strong> {convocatoria.areas ? convocatoria.areas.length : 0}
                </Card.Text>
                {lista === convocatorias.activas && (
                  <div className="text-center mt-3">
                    <Link to="/registro" className="btn btn-primary">
                      Inscribirse
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <Link to="/">
            <img src="/logo_umss.png" alt="Logo UMSS" className="logo" />
          </Link>
          <nav className="main-nav">
            <Link to="/convocatorias" className="active">Convocatorias</Link>
            <Link to="/etapas">Etapas</Link>
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

      <div className="convocatorias-container" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)', margin: '30px auto', maxWidth: '1200px' }}>
        <h1>Convocatorias Olimpiadas Escolares</h1>
        
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando convocatorias...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Tab.Container defaultActiveKey="activas">
            <Nav variant="pills" className="justify-content-center mb-4">
              <Nav.Item>
                <Nav.Link eventKey="activas" className="mx-2">
                  Convocatorias Activas 
                  {convocatorias.activas.length > 0 && (
                    <Badge bg="success" pill className="ms-2">
                      {convocatorias.activas.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="futuras" className="mx-2">
                  Próximas Convocatorias
                  {convocatorias.futuras.length > 0 && (
                    <Badge bg="info" pill className="ms-2">
                      {convocatorias.futuras.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="pasadas" className="mx-2">
                  Convocatorias Pasadas
                  {convocatorias.pasadas.length > 0 && (
                    <Badge bg="secondary" pill className="ms-2">
                      {convocatorias.pasadas.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
            </Nav>
            
            <Tab.Content>
              <Tab.Pane eventKey="activas">
                <h2 className="text-center mb-4">Convocatorias Activas</h2>
                {renderConvocatoriasList(convocatorias.activas, "No hay convocatorias activas en este momento.")}
              </Tab.Pane>
              <Tab.Pane eventKey="futuras">
                <h2 className="text-center mb-4">Próximas Convocatorias</h2>
                {renderConvocatoriasList(convocatorias.futuras, "No hay próximas convocatorias programadas.")}
              </Tab.Pane>
              <Tab.Pane eventKey="pasadas">
                <h2 className="text-center mb-4">Convocatorias Pasadas</h2>
                {renderConvocatoriasList(convocatorias.pasadas, "No hay convocatorias pasadas.")}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        )}
      </div>
    </div>
  );
}

export default ConvocatoriasPublicas;
