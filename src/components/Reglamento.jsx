import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Card, Row, Col, Alert, Spinner, Table, Badge } from 'react-bootstrap';

function Reglamento() {
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
  
  // Función para obtener requisitos de área
  const getRequisitos = (nombreArea) => {
    const area = defaultAreasRequisitos.find(a => a.area === nombreArea);
    return area ? area.requisitos : '1° Secundaria - 6° Secundaria';
  };
  
  // Datos de áreas por defecto y sus pre-requisitos (cursos)
  const defaultAreasRequisitos = [
    { 
      area: 'Astronomía', 
      requisitos: '4° Primaria - 6° Secundaria' 
    },
    { 
      area: 'Biología', 
      requisitos: '3° Primaria - 6° Secundaria' 
    },
    { 
      area: 'Física', 
      requisitos: '1° Secundaria - 6° Secundaria' 
    },
    { 
      area: 'Matemáticas', 
      requisitos: '3° Primaria - 6° Secundaria' 
    },
    { 
      area: 'Informática', 
      requisitos: '1° Secundaria - 6° Secundaria' 
    },
    { 
      area: 'Robótica', 
      requisitos: '3° Primaria - 6° Secundaria' 
    },
    { 
      area: 'Química', 
      requisitos: '1° Secundaria - 6° Secundaria' 
    }
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <Link to="/">
            <img src="/logo_umss.png" alt="Logo UMSS" className="logo" />
          </Link>
          <nav className="main-nav">
            <Link to="/convocatorias">Convocatorias</Link>
            <Link to="/etapas">Etapas</Link>
            <Link to="/reglamento" className="active">Reglamento</Link>
            <Link to="/contactanos">Contactanos</Link>
          </nav>
        </div>
        <div className="auth-buttons">
          <Link to="/" className="btn btn-ingresar">
            Volver al Inicio
          </Link>
        </div>
      </header>

      <div className="reglamento-container" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)', margin: '30px auto', maxWidth: '1200px' }}>
        <h1>Reglamento de las Olimpiadas</h1>
        
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
            <p className="lead mb-4">A continuación se muestra el reglamento para las convocatorias actualmente disponibles.</p>
            
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
                          <strong>Costo por área:</strong> ${convocatoria.costo_por_area}
                        </p>
                        <p>
                          <strong>Número máximo de áreas por estudiante:</strong> {convocatoria.maximo_areas}
                        </p>
                        <p>
                          <strong>Costo total por {convocatoria.maximo_areas} áreas:</strong> ${convocatoria.costo_por_area * convocatoria.maximo_areas}
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <h4>Áreas Disponibles y Requisitos</h4>
                        <p>Cada estudiante puede inscribirse en hasta {convocatoria.maximo_areas} áreas de las {convocatoria.areas ? convocatoria.areas.length : 0} disponibles.</p>
                        
                        <Table striped bordered hover responsive className="mt-3">
                          <thead className="bg-light">
                            <tr>
                              <th>Área</th>
                              <th>Cursos Permitidos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {convocatoria.areas ? (
                              convocatoria.areas.map((area, index) => (
                                <tr key={index}>
                                  <td><Badge bg="secondary" className="me-2">{index + 1}</Badge> {area.nombre}</td>
                                  <td>{area.requisitos || getRequisitos(area.nombre)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="2" className="text-center">No hay áreas disponibles en esta convocatoria</td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>
                      
                      <div className="reglamento-info p-3 border rounded mb-4">
                        <h4>Reglamento General</h4>
                        <ul className="mb-0">
                          <li>Cada área tiene un costo de inscripción de ${convocatoria.costo_por_area} dólares americanos.</li>
                          <li>La inscripción en {convocatoria.maximo_areas} áreas tiene un costo total de ${convocatoria.costo_por_area * convocatoria.maximo_areas} dólares americanos.</li>
                          <li>El pago debe realizarse dentro de las 48 horas siguientes a la generación de la orden de pago.</li>
                          <li>Si el pago no se realiza en el tiempo establecido, la inscripción será cancelada automáticamente.</li>
                          <li>Los estudiantes deben presentarse a las pruebas con su carnet de identidad.</li>
                        </ul>
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

export default Reglamento;
