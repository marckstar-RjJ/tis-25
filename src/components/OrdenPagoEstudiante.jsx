import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import jsPDF from 'jspdf'; // Importar jsPDF
import '../App.css';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';

function OrdenPagoEstudiante() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estudiante, setEstudiante] = useState(null);
  const [inscripcion, setInscripcion] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Obtener la inscripción actual del sessionStorage
        const inscripcionStr = sessionStorage.getItem('inscripcionActual');
        console.log('Inscripción en sessionStorage:', inscripcionStr);
        
        if (!inscripcionStr) {
          throw new Error('No se encontró la información de la inscripción. Por favor, vuelve a realizar la inscripción.');
        }

        const inscripcion = JSON.parse(inscripcionStr);
        console.log("FetchData: Inscripción cargada:", inscripcion);

        if (!inscripcion || !inscripcion.convocatoria) {
          throw new Error('La información de la inscripción no es válida o no contiene la convocatoria.');
        }

        // Verificar que la convocatoria sea la correcta
        const convocatorias = JSON.parse(localStorage.getItem('olimpiadas_convocatorias') || '[]');
        const convocatoriaActual = convocatorias.find(c => c.id === inscripcion.convocatoriaId);
        
        if (!convocatoriaActual) {
          console.error('Convocatoria no encontrada en localStorage:', inscripcion.convocatoriaId);
          throw new Error('No se encontró la información de la convocatoria.');
        }

        // Actualizar la convocatoria en la inscripción con los datos más recientes
        inscripcion.convocatoria = convocatoriaActual;
        console.log("Inscripción actualizada con convocatoria:", inscripcion);
        
        // Obtener datos del estudiante
        let studentData;
        try {
          studentData = await apiService.getCurrentStudent();
          if (!studentData || !studentData.id) {
            throw new Error('No se pudo obtener la información del estudiante');
          }
        } catch (studentError) {
          console.error('Error al obtener datos del estudiante:', studentError);
          if (currentUser) {
            studentData = currentUser;
          } else {
            throw new Error('No se pudo obtener la información del estudiante');
          }
        }

        setEstudiante(studentData);
        setInscripcion(inscripcion);

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error al cargar los datos necesarios. Intente nuevamente.');
        setTimeout(() => navigate('/estudiante/inscripcion'), 2000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, navigate]);
  
  const handleVolver = () => {
    navigate('/estudiante');
  };
  
  const handleGenerarPDF = async () => {
    try {
      setGenerandoPDF(true);
      
      // Verificar que tenemos la información correcta
      if (!inscripcion || !inscripcion.convocatoria) {
        throw new Error('No se encontró la información necesaria para generar el PDF');
      }

      console.log('Generando PDF para inscripción:', inscripcion);
      
      // Crear el contenido del PDF
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text('Orden de Pago', 105, 20, { align: 'center' });
      
      // Información de la convocatoria
      doc.setFontSize(16);
      doc.text(inscripcion.convocatoria.nombre, 105, 30, { align: 'center' });
      
      // Información del estudiante
      doc.setFontSize(12);
      doc.text('Información del Estudiante:', 20, 45);
      doc.setFontSize(10);
      doc.text(`Nombre: ${estudiante.nombre} ${estudiante.apellido || estudiante.apellidos || ''}`, 20, 55);
      doc.text(`CI: ${estudiante.ci}`, 20, 60);
      doc.text(`Curso: ${estudiante.curso <= 6 ? `${estudiante.curso}° Primaria` : `${estudiante.curso - 6}° Secundaria`}`, 20, 65);
      doc.text(`Colegio: ${estudiante.colegio?.nombre || estudiante.colegio || 'No asignado'}`, 20, 70);
      
      // Detalles de la inscripción
      doc.setFontSize(12);
      doc.text('Áreas Inscritas:', 20, 85);
      doc.setFontSize(10);
      
      let yPos = 95;
      inscripcion.areas.forEach((area, index) => {
        doc.text(`${index + 1}. ${area.nombre}`, 25, yPos);
        yPos += 7;
      });
      
      // Información de pago
      doc.setFontSize(12);
      doc.text('Información de Pago:', 20, yPos + 10);
      doc.setFontSize(10);
      doc.text(`Costo por área: Bs. ${inscripcion.convocatoria.costo_por_area}`, 25, yPos + 20);
      doc.text(`Total a pagar: Bs. ${inscripcion.costoTotal}`, 25, yPos + 25);
      
      doc.setFontSize(12);
      doc.text('Instrucciones de Pago:', 20, yPos + 40);
      doc.setFontSize(10);
      doc.text('Tiene que pasar a oficinas de cajas de la UMSS para el pago correspondiente', 25, yPos + 50);
      doc.text('a su orden de compra en horarios de oficina de 8:00 a 12:00 y de 14:00 a 18:00.', 25, yPos + 57);

      // Total
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Total: Bs. ${inscripcion.costoTotal}`, 20, yPos + 70);
      doc.setFont(undefined, 'normal');
      
      // Guardar el PDF con un nombre que incluya la convocatoria
      const nombreArchivo = `orden_pago_${inscripcion.convocatoria.nombre.toLowerCase().replace(/\s+/g, '_')}_${inscripcion.id}.pdf`;
      doc.save(nombreArchivo);
      
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError('No se pudo generar el PDF. Intente nuevamente.');
    } finally {
      setGenerandoPDF(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando información...</p>
        </div>
      </Container>
    );
  }
  
  return (
    <Container fluid className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: 'rgba(245,245,245,0.7)' }}>
      <Card className="shadow-lg p-4 main-card">
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary mb-1">Orden de Pago</h2>
            <div className="fs-5 text-secondary">{inscripcion?.convocatoria?.nombre}</div>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4 shadow-sm">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}

          <Row className="gy-4">
            <Col md={6}>
              <div className="section-title mb-2">
                <i className="fas fa-user-graduate me-2 text-primary"></i>
                <span className="fw-semibold">Estudiante</span>
              </div>
              <div className="info-list">
                <div><span className="label">Nombre:</span> {estudiante?.nombre} {estudiante?.apellido}</div>
                <div><span className="label">CI:</span> {estudiante?.ci}</div>
                <div><span className="label">Curso:</span> {estudiante?.curso <= 6 ? `${estudiante?.curso}° Primaria` : `${estudiante?.curso - 6}° Secundaria`}</div>
                <div><span className="label">Colegio:</span> {estudiante?.colegio?.nombre || (typeof estudiante?.colegio === 'string' ? estudiante.colegio : 'No asignado')}</div>
                <div><span className="label">Correo:</span> {estudiante?.email || 'No registrado'}</div>
              </div>
            </Col>
            <Col md={6}>
              <div className="section-title mb-2">
                <i className="fas fa-info-circle me-2 text-primary"></i>
                <span className="fw-semibold">Inscripción</span>
                </div>
              <div className="info-list">
                <div><span className="label">Convocatoria:</span> {inscripcion?.convocatoria?.nombre}</div>
                <div><span className="label">Fecha de Inscripción:</span> {new Date(inscripcion?.fechaInscripcion).toLocaleDateString()}</div>
                <div><span className="label">N° de Orden:</span> {inscripcion?.id}</div>
                <div><span className="label">Estado:</span> <Badge bg={inscripcion?.estado === 'pendiente' ? 'warning' : 'success'} className="text-uppercase">{inscripcion?.estado}</Badge></div>
              </div>
            </Col>
          </Row>

          <hr className="my-4" />

          <Row className="gy-4">
            <Col md={7}>
              <div className="section-title mb-2">
                <i className="fas fa-book me-2 text-primary"></i>
                <span className="fw-semibold">Áreas Inscritas</span>
              </div>
              <div className="d-flex flex-wrap gap-3">
                {inscripcion?.areas.map(area => (
                  <Card key={area.id} className="area-card flex-fill">
                    <Card.Body>
                      <div className="fw-semibold mb-1">{area.nombre}</div>
                      <div className="text-muted small">{area.descripcion}</div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
            <Col md={5}>
              <div className="section-title mb-2">
                <i className="fas fa-money-bill-wave me-2 text-primary"></i>
                <span className="fw-semibold">Resumen de Pago</span>
              </div>
              <div className="payment-box p-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Costo por área:</span>
                  <span className="fw-bold">Bs. {inscripcion?.convocatoria?.costo_por_area}</span>
            </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Número de áreas:</span>
                  <span className="fw-bold">{inscripcion?.areas.length}</span>
        </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="fw-semibold fs-5 text-success">Total a Pagar:</span>
                  <span className="fw-bold fs-5 text-success">Bs. {inscripcion?.costoTotal}</span>
          </div>
            </div>
            </Col>
          </Row>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
            <Button
              variant="outline-secondary"
              onClick={handleVolver}
              disabled={generandoPDF}
              className="px-4"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Volver
            </Button>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={handleGenerarPDF}
                disabled={generandoPDF}
                className="px-4"
              >
                {generandoPDF ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-pdf me-2"></i>
                    Descargar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default OrdenPagoEstudiante; 