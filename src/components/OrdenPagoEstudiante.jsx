import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import jsPDF from 'jspdf'; // Importar jsPDF
import '../App.css';
import { sendPaymentOrderEmail } from '../InscripcionIndividual';

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
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener configuración de olimpiadas
        const configData = await apiService.getOlympiadConfig();
        setConfig(configData);
        
        // Obtener datos del estudiante
        const estudianteData = await apiService.getCurrentStudent();
        setEstudiante(estudianteData);
        
        if (!estudianteData.areasInscritas || estudianteData.areasInscritas.length === 0) {
          // No hay áreas inscritas
          setError('No tienes áreas académicas inscritas. Por favor, inscríbete primero.');
          setLoading(false);
          return;
        }
        
        // Obtener detalles de las áreas inscritas
        const areasData = await apiService.getAreas();
        const areasDetalles = areasData.filter(area => 
          estudianteData.areasInscritas.includes(area.id)
        );
        
        setAreasInscritas(areasDetalles);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos necesarios. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  const handleGenerarOrden = async () => {
    if (!estudiante || areasInscritas.length === 0) {
      setError('No hay áreas inscritas para generar una orden de pago.');
      return;
    }

    // Verificar que el estudiante tenga un correo válido
    if (!estudiante.email || !estudiante.email.includes('@')) {
      setError('El estudiante no tiene un correo electrónico válido.');
      return;
    }
    
    setGenerandoOrden(true);
    setError('');
    
    try {
      // Preparar datos para la orden de pago
      const ordenData = {
        studentId: estudiante.id,
        areas: areasInscritas,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido || estudiante.apellidos,
        email: estudiante.email,
        total: areasInscritas.length * (config?.precioPorArea || 16)
      };
      
      console.log("Datos del estudiante:", {
        email: estudiante.email,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido || estudiante.apellidos
      });
      
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
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setOrdenGenerada(result);

      // Verificar que el correo no esté vacío antes de enviar
      if (!estudiante.email) {
        throw new Error('El correo del estudiante está vacío');
      }

      console.log("Intentando enviar correo a:", estudiante.email);

      // Enviar correo con la orden de pago
      const emailSent = await sendPaymentOrderEmail(
        estudiante.email,
        areasInscritas,
        ordenData.total,
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

      setModalTitle('Orden de Pago Generada');
      setModalContent(
        <div className="modal-content-container">
          <div className="modal-message">
            <p>La orden de pago ha sido generada exitosamente.</p>
            <p>Se ha enviado un correo con los detalles a {estudiante.email}</p>
          </div>
          <div className="modal-actions">
            <button 
              onClick={() => {
                setShowModal(false);
                navigate('/estudiante/areas');
              }}
              className="modal-button"
            >
              Continuar
            </button>
          </div>
        </div>
      );
      setShowModal(true);

    } catch (error) {
      console.error('Error al generar orden de pago:', error);
      setError(error.message || 'Error al generar la orden de pago');
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
    doc.text('Orden de Pago - Olimpiadas del Saber', 14, 22);

    // Datos del Estudiante
    doc.setFontSize(12);
    doc.text(`ID Orden: ${ordenGenerada.id}`, 14, 40);
    doc.text(`Fecha: ${new Date(ordenGenerada.fecha).toLocaleDateString()}`, 14, 48);
    doc.text(`Estudiante: ${ordenGenerada.estudiante.nombre}`, 14, 56);
    doc.text(`CI: ${estudiante.ci}`, 14, 64);
    doc.text(`Colegio: ${estudiante.colegio?.nombre || estudiante.colegio || 'No asignado'}`, 14, 72);
    
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
  
  if (loading) {
    return <p className="loading-message">Cargando información...</p>;
  }
  
  return (
    <div className="orden-pago-container">
      <h2>Generación de Orden de Pago</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {!ordenGenerada ? (
        <div className="orden-pago-form">
          {areasInscritas.length > 0 ? (
            <>
              <div className="resumen-areas">
                <h3>Resumen de Áreas Inscritas</h3>
                <ul className="areas-list">
                  {areasInscritas.map(area => (
                    <li key={area.id} className="area-item">
                      <span className="area-nombre">{area.nombre}</span>
                      <span className="area-precio">${config?.precioPorArea || 16}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="total-pago">
                  <span>Total a pagar:</span>
                  <span className="precio-total">
                    ${areasInscritas.length * (config?.precioPorArea || 16)}
                  </span>
                </div>
              </div>
              
              <div className="datos-estudiante">
                <h3>Datos del Estudiante</h3>
                <p><strong>Nombre:</strong> {estudiante.nombre} {estudiante.apellido || estudiante.apellidos}</p>
                <p><strong>CI:</strong> {estudiante.ci}</p>
                <p><strong>Email:</strong> {estudiante.email}</p>
                <p><strong>Colegio:</strong> {estudiante.colegio?.nombre || estudiante.colegio || 'No asignado'}</p>
              </div>
              
              <div className="botones-accion">
                <button 
                  onClick={handleVolver} 
                  className="btn-secundario"
                >
                  Volver
                </button>
                <button 
                  onClick={handleGenerarOrden} 
                  className="btn-primario"
                  disabled={generandoOrden}
                >
                  {generandoOrden ? 'Generando...' : 'Generar Orden de Pago'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-areas">
              <p>No tienes áreas inscritas para generar una orden de pago.</p>
              <button onClick={handleVolver} className="btn-primario">
                Volver al Panel de Estudiante
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="orden-generada">
          <div className="orden-header">
            <h3>¡Orden de pago generada correctamente!</h3>
            <p className="orden-id">Código: <strong>{ordenGenerada.id}</strong></p>
          </div>
          
          <div className="orden-detalles">
            <div className="orden-info">
              <p><strong>Fecha:</strong> {new Date(ordenGenerada.fecha).toLocaleDateString()}</p>
              <p><strong>Estudiante:</strong> {ordenGenerada.estudiante.nombre}</p>
              <p><strong>Áreas:</strong> {ordenGenerada.areas}</p>
              <p><strong>Total a pagar:</strong> ${ordenGenerada.total}</p>
              <p><strong>Fecha de expiración:</strong> {new Date(ordenGenerada.fechaExpiracion).toLocaleDateString()}</p>
            </div>
            
            <div className="orden-instrucciones">
              <h4>Instrucciones de Pago</h4>
              <p>{ordenGenerada.instrucciones}</p>
            </div>
          </div>
          
          <div className="orden-acciones">
            <button onClick={handleDescargarPDF} className="btn-descargar">
              Descargar PDF
            </button>
            <button onClick={handleVolver} className="btn-volver">
              Volver al Panel
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{modalTitle}</h2>
            <p>{modalContent}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdenPagoEstudiante; 