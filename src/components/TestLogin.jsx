import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { loginAsAdmin, loginAsTutor, loginAsEstudiante, logout } from '../utils/authTestHelper';

/**
 * Componente para simular inicio de sesión con diferentes roles
 * SOLO PARA PRUEBAS DURANTE EL DESARROLLO
 */
const TestLogin = () => {
  const navigate = useNavigate();
  
  const handleLoginAs = (role) => {
    // Cerrar sesión actual si existe
    logout();
    
    // Iniciar sesión con el rol seleccionado
    if (role === 'admin') {
      loginAsAdmin();
      navigate('/admin');
    } else if (role === 'tutor') {
      loginAsTutor();
      navigate('/tutor');
    } else if (role === 'estudiante') {
      loginAsEstudiante();
      navigate('/estudiante');
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <Container className="mt-5">
      <Card className="shadow">
        <Card.Header className="bg-primary text-white">
          <h3>Simulador de Inicio de Sesión (Entorno de pruebas)</h3>
        </Card.Header>
        <Card.Body>
          <p className="text-danger">
            <strong>ATENCIÓN</strong>: Este componente es solo para pruebas durante el desarrollo.
          </p>
          
          <Row className="mt-4">
            <Col md={4}>
              <Card className="h-100">
                <Card.Header className="bg-info text-white">Administrador</Card.Header>
                <Card.Body>
                  <p>Iniciar sesión como administrador del sistema para gestionar convocatorias, colegios y otros recursos</p>
                </Card.Body>
                <Card.Footer>
                  <Button variant="info" onClick={() => handleLoginAs('admin')}>
                    Iniciar como Administrador
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="h-100">
                <Card.Header className="bg-success text-white">Tutor</Card.Header>
                <Card.Body>
                  <p>Iniciar sesión como tutor para registrar estudiantes e inscribirlos en áreas de olimpiadas</p>
                </Card.Body>
                <Card.Footer>
                  <Button variant="success" onClick={() => handleLoginAs('tutor')}>
                    Iniciar como Tutor
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="h-100">
                <Card.Header className="bg-warning text-white">Estudiante</Card.Header>
                <Card.Body>
                  <p>Iniciar sesión como estudiante para inscribirse en áreas de olimpiadas y revisar su estado</p>
                </Card.Body>
                <Card.Footer>
                  <Button variant="warning" onClick={() => handleLoginAs('estudiante')}>
                    Iniciar como Estudiante
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-center mt-5">
            <Button variant="danger" onClick={handleLogout}>
              Cerrar Sesión Actual
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TestLogin;
