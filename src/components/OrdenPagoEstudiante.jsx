import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import jsPDF from 'jspdf'; // Importar jsPDF
import '../App.css';
import { sendPaymentOrderEmail } from '../InscripcionIndividual';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';

function OrdenPagoEstudiante() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estudiante, setEstudiante] = useState(null);
  const [areasInscritas, setAreasInscritas] = useState([]);
  const [config, setConfig] = useState(null);
  const [generandoOrden, setGenerandoOrden] = useState(false);
  const [ordenGenerada, setOrdenGenerada] = useState(null);
  const [ordenActivaExistente, setOrdenActivaExistente] = useState(false);
  const [inscripcion, setInscripcion] = useState(null);
  const [total, setTotal] = useState(0);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Obtener la inscripción actual del sessionStorage
        const inscripcionStr = sessionStorage.getItem('inscripcionActual');
        if (!inscripcionStr) {
          throw new Error('No se encontró la información de la inscripción. Por favor, vuelve a realizar la inscripción.');
        }

        const inscripcion = JSON.parse(inscripcionStr);
        console.log("FetchData: Inscripción cargada:", inscripcion);

        if (!inscripcion) {
          throw new Error('La información de la inscripción no es válida.');
        }
        
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
        setTotal(inscripcion.costoTotal);

        // Enviar correo automáticamente al cargar la orden
        if (studentData.email) {
          setEnviandoCorreo(true);
          const emailEnviado = await sendPaymentOrderEmail(
            studentData.email,
            inscripcion.areas,
            inscripcion.costoTotal,
            `Número de Orden: ${inscripcion.id}\nFecha: ${new Date().toLocaleDateString()}`
          );
          if (emailEnviado) {
            setMensaje('Se envió la orden de pago a su correo');
            setTimeout(() => setMensaje(''), 5000);
          } else {
            setError('No se pudo enviar el correo electrónico.');
          }
          setEnviandoCorreo(false);
        }

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
  
  const handleGenerarOrden = async () => {
    if (!estudiante || !config) return;
    
    // Si ya hay una verificación que indica que existe orden, bloquear directamente
    if (ordenActivaExistente) {
      setError('Ya tienes una orden de pago activa. No puedes generar una nueva.');
      return;
    }
    
    setGenerandoOrden(true);
    setError('');
    
    try {
      // Preparar datos para la orden de pago
      const ordenData = {
        studentId: estudiante.id,
        areas: estudiante.areasInscritas,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido || estudiante.apellidos,
        email: estudiante.email,
        total: total
      };
      
      // Simular generación de orden (en producción se llamaría a la API)
      console.log("Generando orden de pago para:", ordenData);
      
      // En un entorno real, aquí llamaríamos al backend:
      // const result = await apiService.generarOrdenPago(ordenData);
      
      // Simulación para desarrollo:
      const result = {
        id: `ORDEN-${Date.now()}`,
        fecha: new Date().toISOString(),
        total: ordenData.total,
        estudiante: {
          id: estudiante.id,
          nombre: `${estudiante.nombre} ${estudiante.apellido || estudiante.apellidos}`,
          email: estudiante.email
        },
        areas: areasInscritas.map(a => a.nombre).join(', '),
        instrucciones: "Para completar el pago, presente este código en la oficina de tesorería de la UMSS en horario de 8:00 a 16:00, de lunes a viernes.",
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
      };
      
      setOrdenGenerada(result);

      // Enviar correo con la orden de pago
      const emailSent = await sendPaymentOrderEmail(
        estudiante.email,
        areasInscritas,
        total,
        `Número de orden: ${result.id}
Fecha de emisión: ${new Date(result.fecha).toLocaleDateString()}
Fecha límite de pago: ${new Date(result.fechaExpiracion).toLocaleDateString()}
Instrucciones de pago: ${result.instrucciones}`
      );

      if (!emailSent) {
        console.error('No se pudo enviar el correo');
        setError('No se pudo enviar el correo con la orden de pago. Por favor, intente nuevamente.');
        return;
      }

      alert('Orden de pago generada exitosamente. Se ha enviado un correo con los detalles de la orden.');
    } catch (err) {
      console.error('Error al generar orden de pago:', err);
      setError('Ocurrió un error al generar la orden de pago. Intente nuevamente.');
    } finally {
      setGenerandoOrden(false);
    }
  };
  
  const handleVolver = () => {
    navigate('/estudiante/areas');
  };
  
  const handleDescargarPDF = () => {
    if (!ordenGenerada || !estudiante || !config) return; // Asegurarse que los datos están cargados

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Orden de Pago - Olimpiadas Oh Sansi!', 14, 22);

    // Datos del Estudiante
    doc.setFontSize(12);
    doc.text(`ID Orden: ${ordenGenerada.id}`, 14, 40);
    doc.text(`Fecha: ${new Date(ordenGenerada.fecha).toLocaleDateString()}`, 14, 48);
    doc.text(`Estudiante: ${ordenGenerada.estudiante.nombre}`, 14, 56);
    doc.text(`CI: ${estudiante.ci}`, 14, 64);
    doc.text(`Colegio: ${estudiante.colegio?.nombre || (typeof estudiante?.colegio === 'string' ? estudiante.colegio : 'No asignado') || 'No asignado'}`, 14, 72);
    
    // Áreas Inscritas
    doc.setFontSize(14);
    doc.text('Áreas Inscritas:', 14, 90);
    doc.setFontSize(12);
    let yPosition = 98;
    areasInscritas.forEach((area) => {
      doc.text(`- ${area.nombre}`, 14, yPosition);
      yPosition += 7;
    });

    // Total a Pagar
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold'); // Poner en negrita
    doc.text(`Total a Pagar: $${ordenGenerada.total}`, 14, yPosition + 10);
    doc.setFont(undefined, 'normal'); // Volver a normal

    // Instrucciones
    doc.setFontSize(10);
    doc.text('Instrucciones:', 14, yPosition + 25);
    // Usar splitTextToSize para manejar texto largo y ajustar el ancho
    const instruccionesTexto = doc.splitTextToSize(ordenGenerada.instrucciones, 180); // 180 es el ancho máximo
    doc.text(instruccionesTexto, 14, yPosition + 32);
    
    doc.setFontSize(10);
    doc.text(`Fecha de Expiración: ${new Date(ordenGenerada.fechaExpiracion).toLocaleDateString()}`, 14, yPosition + 50);


    // Guardar el PDF
    doc.save(`orden_pago_${ordenGenerada.id}.pdf`);
  };
  
  const handleGenerarPDF = async () => {
    try {
      setGenerandoPDF(true);
      
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
      doc.text(`Nombre: ${estudiante.nombre} ${estudiante.apellido}`, 20, 55);
      doc.text(`CI: ${estudiante.ci}`, 20, 60);
      doc.text(`Curso: ${estudiante.curso <= 6 ? `${estudiante.curso}° Primaria` : `${estudiante.curso - 6}° Secundaria`}`, 20, 65);
      doc.text(`Colegio: ${estudiante.colegio?.nombre || 'No asignado'}`, 20, 70);
      
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
      
      // Fecha y número de orden
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, yPos + 35);
      doc.text(`Número de Orden: ${inscripcion.id}`, 20, yPos + 40);
      
      // Guardar el PDF
      doc.save(`orden_pago_${inscripcion.id}.pdf`);
      
      setMensaje('PDF generado exitosamente');
      setTimeout(() => setMensaje(''), 3000);
      
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError('Error al generar el PDF. Intente nuevamente.');
    } finally {
      setGenerandoPDF(false);
    }
  };

  const handleEnviarCorreo = async () => {
    try {
      setEnviandoCorreo(true);
      
      if (!estudiante.email) {
        throw new Error('No se encontró un correo electrónico asociado al estudiante.');
      }

      const areasTexto = inscripcion.areas.map(area => `- ${area.nombre}`).join('\n');
      
      const templateParams = {
        nombre: estudiante.nombre,
        convocatoria: inscripcion.convocatoria.nombre,
        areas: areasTexto,
        total: inscripcion.costoTotal,
        fecha: new Date().toLocaleDateString(),
        numeroOrden: inscripcion.id
      };

      const emailEnviado = await sendPaymentOrderEmail(
        estudiante.email,
        inscripcion.areas,
        inscripcion.costoTotal,
        `Número de Orden: ${inscripcion.id}\nFecha: ${new Date().toLocaleDateString()}`
      );

      if (emailEnviado) {
        setMensaje('Correo enviado exitosamente');
        setTimeout(() => setMensaje(''), 3000);
      } else {
        throw new Error('No se pudo enviar el correo electrónico.');
      }
      
    } catch (err) {
      console.error('Error al enviar correo:', err);
      setError(err.message || 'Error al enviar el correo. Intente nuevamente.');
    } finally {
      setEnviandoCorreo(false);
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

          {mensaje && (
            <Alert variant="success" className="mb-4 shadow-sm">
              <i className="fas fa-check-circle me-2"></i>
              {mensaje}
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
              onClick={() => navigate('/estudiante/inscripcion')}
              disabled={generandoPDF || enviandoCorreo}
              className="px-4"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Volver
            </Button>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={handleGenerarPDF}
                disabled={generandoPDF || enviandoCorreo}
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
        <style jsx>{`
          .main-card {
            max-width: 900px;
            width: 100%;
            border-radius: 1.5rem;
            background: #fff;
          }
          .section-title {
            font-size: 1.1rem;
            letter-spacing: 0.5px;
            color: #222;
            display: flex;
            align-items: center;
          }
          .info-list {
            background: #f8f9fa;
            border-radius: 0.75rem;
            padding: 1rem 1.25rem;
            font-size: 1rem;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          }
          .info-list .label {
            font-weight: 500;
            color: #555;
            margin-right: 0.5rem;
          }
          .area-card {
            min-width: 180px;
            max-width: 220px;
            border-radius: 1rem;
            border: 1px solid #e3e3e3;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            transition: box-shadow 0.2s, transform 0.2s;
          }
          .area-card:hover {
            box-shadow: 0 6px 18px rgba(0,0,0,0.10);
            transform: translateY(-2px) scale(1.03);
          }
          .payment-box {
            background: #f8f9fa;
            border-radius: 0.75rem;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
            font-size: 1.1rem;
          }
        `}</style>
      </Card>
    </Container>
  );
}

export default OrdenPagoEstudiante; 