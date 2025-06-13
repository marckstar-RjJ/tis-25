import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Spinner, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaDownload, FaEdit, FaTrash, FaFileInvoiceDollar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { limpiarDatosIncorrectos } from './utils/limpiarInscripciones';
import { jsPDF } from 'jspdf';

const MisInscripciones = () => {
  const { currentUser } = useAuth();
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [showModalExito, setShowModalExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [inscripcionActual, setInscripcionActual] = useState(null);
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [descargandoPDF, setDescargandoPDF] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [costoTotalActualizado, setCostoTotalActualizado] = useState(0);
  
  // Limpiar inscripciones incorrectas al iniciar el componente
  useEffect(() => {
    // Limpiar cualquier inscripción automática que se haya generado incorrectamente
    limpiarDatosIncorrectos();
  }, []);

  // Cargar inscripciones del estudiante al iniciar
  useEffect(() => {
    const fetchInscripciones = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Obtener estudiante actual con sus datos completos
        const estudiante = await apiService.getCurrentStudent();
        console.log('Estudiante recuperado completo:', estudiante);
        
        if (!estudiante) {
          setError('No se pudo obtener información del estudiante.');
          return;
        }
        
        // Obtener todas las convocatorias del localStorage y sessionStorage
        const convocatoriasKey = 'olimpiadas_convocatorias';
        let convocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
        
        // Intentar obtener convocatoria del sessionStorage
        const convocatoriaSession = sessionStorage.getItem('convocatoriaSeleccionada');
        if (convocatoriaSession) {
          try {
            const convocatoriaActual = JSON.parse(convocatoriaSession);
            // Verificar si la convocatoria ya existe en el array
            const existe = convocatorias.some(c => c.id === convocatoriaActual.id);
            if (!existe) {
              convocatorias.push(convocatoriaActual);
            }
          } catch (err) {
            console.error('Error al parsear convocatoria del sessionStorage:', err);
          }
        }
        
        console.log('Convocatorias obtenidas:', convocatorias);
        
        // Obtener todas las áreas del localStorage
        const areasKey = 'olimpiadas_areas';
        const areas = JSON.parse(localStorage.getItem(areasKey) || '[]');
        console.log('Áreas obtenidas:', areas);
        
        // Obtener las inscripciones del localStorage
        const inscripcionesKey = 'olimpiadas_inscripciones';
        const todasLasInscripciones = JSON.parse(localStorage.getItem(inscripcionesKey) || '[]');
        console.log('Todas las inscripciones:', todasLasInscripciones);
        
        // Filtrar las inscripciones del estudiante actual
        const inscripcionesEstudiante = todasLasInscripciones.filter(
          inscripcion => {
            // Verificar tanto el estudianteId como el id dentro del objeto estudiante
            return inscripcion.estudianteId === estudiante.id || 
                   (inscripcion.estudiante && inscripcion.estudiante.id === estudiante.id);
          }
        );
        console.log('Inscripciones del estudiante:', inscripcionesEstudiante);
        
        // Procesar las inscripciones con datos completos
        const inscripcionesCompletas = inscripcionesEstudiante.map(inscripcion => {
          // Obtener la convocatoria correspondiente
          let convocatoria = null;
          
          // Primero intentar usar la convocatoria guardada en la inscripción
          if (inscripcion.convocatoria && inscripcion.convocatoria.id) {
            convocatoria = inscripcion.convocatoria;
          }
          
          // Si no hay convocatoria en la inscripción, buscar por convocatoriaId
          if (!convocatoria && inscripcion.convocatoriaId) {
            convocatoria = convocatorias.find(c => c.id === inscripcion.convocatoriaId);
          }
          
          if (!convocatoria) {
            console.warn('Convocatoria no encontrada para inscripción:', inscripcion);
            return null;
          }
          
          // Obtener las áreas completas
          const areasCompletas = inscripcion.areas.map(area => {
            // Si el área ya tiene toda la información, usarla directamente
            if (area.nombre && area.descripcion) {
              return area;
            }
            
            // Si no, buscar en las áreas de la convocatoria
            const areaConvocatoria = convocatoria.areas?.find(a => a.id === area.id);
            if (areaConvocatoria) {
              return areaConvocatoria;
            }
            
            // Si no está en la convocatoria, buscar en el listado general de áreas
            const areaGeneral = areas.find(a => a.id === area.id);
            if (areaGeneral) {
              return areaGeneral;
            }
            
            // Si no se encuentra, devolver un objeto con la información mínima
            return { 
              id: area.id, 
              nombre: `Área ${area.id}`,
              descripcion: 'Área no encontrada'
            };
          });
              
          return {
            ...inscripcion,
            convocatoria,
            areas: areasCompletas,
            ordenPago: inscripcion.ordenPago || {
              id: 'orden-' + Date.now(),
              fecha: inscripcion.fechaInscripcion || new Date().toISOString(),
              estado: 'pendiente',
              total: (convocatoria.costo_por_area || 16) * areasCompletas.length
            }
          };
        }).filter(inscripcion => inscripcion !== null); // Filtrar inscripciones sin convocatoria
        
        // Guardar las convocatorias actualizadas en localStorage
        localStorage.setItem(convocatoriasKey, JSON.stringify(convocatorias));
        
        console.log('Inscripciones procesadas:', inscripcionesCompletas);
        setInscripciones(inscripcionesCompletas);
      } catch (err) {
        console.error('Error al cargar inscripciones:', err);
        setError('No se pudieron cargar tus inscripciones. Intenta nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchInscripciones();
    }
  }, [currentUser]);
  
  // Cargar áreas disponibles para la edición
  const cargarAreasDisponibles = async (convocatoriaId) => {
    try {
      console.log("Cargando áreas para convocatoria:", convocatoriaId);
      
      // Obtener convocatoria del localStorage
      const convocatorias = JSON.parse(localStorage.getItem('olimpiadas_convocatorias') || '[]');
      const convocatoria = convocatorias.find(c => c.id === convocatoriaId);
      
      console.log("Convocatoria encontrada:", convocatoria);
      
      if (convocatoria && convocatoria.areas && convocatoria.areas.length > 0) {
        console.log("Áreas de la convocatoria:", convocatoria.areas);
        setAreasDisponibles(convocatoria.areas);
      } else {
        // Si no hay áreas en la convocatoria, intentar obtener las áreas generales
        const areasGenerales = JSON.parse(localStorage.getItem('areas') || '[]');
        console.log("Áreas generales:", areasGenerales);
        
        if (areasGenerales.length > 0) {
          setAreasDisponibles(areasGenerales);
        } else {
          console.error('No se encontraron áreas disponibles');
          setAreasDisponibles([]);
        }
      }
    } catch (err) {
      console.error('Error al cargar áreas disponibles:', err);
      setAreasDisponibles([]);
    }
  };
  
  // Abrir modal para editar inscripción
  const handleEditarInscripcion = async (inscripcion) => {
    try {
      console.log("Editando inscripción:", inscripcion);
      setInscripcionActual(inscripcion);
      
      // Asegurarnos de que tenemos el ID de la convocatoria
      const convocatoriaId = inscripcion.convocatoriaId || inscripcion.convocatoria?.id;
      if (!convocatoriaId) {
        throw new Error('No se encontró el ID de la convocatoria');
      }
      
      // Cargar áreas disponibles para esta convocatoria
      await cargarAreasDisponibles(convocatoriaId);
      
      // Establecer áreas ya seleccionadas
      const areasIds = inscripcion.areas.map(area => {
        if (typeof area === 'object' && area.id) {
          return area.id;
        }
        return area;
      });
      console.log("Áreas seleccionadas actuales:", areasIds);
      setAreasSeleccionadas(areasIds);
      
      setShowModalEditar(true);
    } catch (err) {
      console.error('Error al abrir modal de edición:', err);
      alert('Error al cargar la información de la inscripción. Por favor, inténtalo de nuevo.');
    }
  };
  
  // Abrir modal para eliminar inscripción
  const handleEliminarInscripcion = (inscripcion) => {
    setInscripcionActual(inscripcion);
    setShowModalEliminar(true);
  };
  
  // Descargar orden de pago
  const handleDescargarOrden = async (ordenId) => {
    if (!inscripciones || inscripciones.length === 0) return;
    
    try {
      setDescargandoPDF(true);
      
      const inscripcionConOrden = inscripciones.find(insc => insc.ordenPago && insc.ordenPago.id === ordenId);
      
      if (!inscripcionConOrden) {
        throw new Error('Orden de pago no encontrada.');
      }
      
      const ordenPago = inscripcionConOrden.ordenPago;
      const estudiante = inscripcionConOrden.estudiante || currentUser;
      const convocatoria = inscripcionConOrden.convocatoria;

      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(16);
      doc.text("ORDEN DE PAGO", 105, 20, { align: "center" });
      
      // Información básica
      doc.setFontSize(12);
      doc.text(`ID: ${ordenPago.id}`, 20, 40);
      doc.text(`Fecha: ${formatearFecha(ordenPago.fecha)}`, 20, 50);
      doc.text(`Estado: ${ordenPago.estado.toUpperCase()}`, 20, 60);
      doc.text(`Total: ${ordenPago.total ? ordenPago.total.toFixed(2) : 'N/A'} Bs.`, 20, 70);
      
      // Datos del estudiante
      doc.text(`Estudiante: ${estudiante.nombre} ${estudiante.apellido || ''}`, 20, 90);
      doc.text(`Email: ${estudiante.email || 'N/A'}`, 20, 100);
      doc.text(`CI: ${estudiante.ci || 'N/A'}`, 20, 110);
      
      // Datos de la convocatoria
      doc.text(`Convocatoria: ${convocatoria?.nombre || 'No disponible'}`, 20, 130);
      doc.text(`Inicio: ${convocatoria?.fecha_inicio ? formatearFecha(convocatoria.fecha_inicio) : 'No disponible'}`, 20, 140);
      doc.text(`Fin: ${convocatoria?.fecha_fin ? formatearFecha(convocatoria.fecha_fin) : 'No disponible'}`, 20, 150);
      
      // Áreas
      if (inscripcionConOrden.areas && inscripcionConOrden.areas.length > 0) {
        doc.text("Áreas inscritas:", 20, 170);
        inscripcionConOrden.areas.forEach((area, index) => {
          const areaNombre = typeof area === 'object' ? area.nombre : area;
          doc.text(`- ${areaNombre || 'Área sin nombre'}`, 20, 180 + (index * 10));
        });
      }

      doc.save(`orden_pago_${ordenId}.pdf`);
      
    } catch (err) {
      console.error('Error al descargar orden de pago:', err);
      alert('No se pudo descargar la orden de pago. Intenta nuevamente.');
    } finally {
      setDescargandoPDF(false);
    }
  };
  
  // Actualizar áreas seleccionadas y calcular costo
  const handleToggleArea = (areaId) => {
    if (areasSeleccionadas.includes(areaId)) {
      // Si ya está seleccionada, quitarla
      setAreasSeleccionadas(prev => prev.filter(id => id !== areaId));
    } else {
      // Si la convocatoria tiene un límite de áreas, verificar que no se exceda
      if (inscripcionActual && 
          inscripcionActual.convocatoria && 
          inscripcionActual.convocatoria.maximo_areas && 
          areasSeleccionadas.length >= inscripcionActual.convocatoria.maximo_areas) {
        alert(`Solo puedes seleccionar hasta ${inscripcionActual.convocatoria.maximo_areas} áreas.`);
        return;
      }
      // Si no está seleccionada, agregarla
      setAreasSeleccionadas(prev => [...prev, areaId]);
    }
  };
  
  // Calcular costo total cuando cambian las áreas seleccionadas
  useEffect(() => {
    if (inscripcionActual && inscripcionActual.convocatoria) {
      const costoPorArea = inscripcionActual.convocatoria.costo_por_area || 16;
      const nuevoTotal = areasSeleccionadas.length * costoPorArea;
      setCostoTotalActualizado(nuevoTotal);
    }
  }, [areasSeleccionadas, inscripcionActual]);
  
  // Guardar cambios en la inscripción
  const handleGuardarCambios = async (inscripcionId) => {
    try {
      setGuardando(true);
      
      // Obtener inscripciones actuales
      const inscripcionesActuales = JSON.parse(localStorage.getItem('olimpiadas_inscripciones') || '[]');
      
      // Encontrar la inscripción a actualizar
      const inscripcionIndex = inscripcionesActuales.findIndex(insc => insc.id === inscripcionId);
      
      if (inscripcionIndex === -1) {
        throw new Error('Inscripción no encontrada');
      }
      
      // Obtener la convocatoria actual
      const convocatorias = JSON.parse(localStorage.getItem('olimpiadas_convocatorias') || '[]');
      const convocatoria = convocatorias.find(c => c.id === inscripcionesActuales[inscripcionIndex].convocatoriaId);
      
      if (!convocatoria) {
        throw new Error('Convocatoria no encontrada');
      }
      
      // Obtener las áreas seleccionadas de la convocatoria
      const areasConvocatoria = convocatoria.areas || [];
      
      // Filtrar las áreas seleccionadas para mantener solo las que están en la convocatoria
      const areasFiltradas = areasSeleccionadas
        .filter(areaId => areasConvocatoria.some(a => a.id === areaId))
        .map(areaId => {
          const area = areasConvocatoria.find(a => a.id === areaId);
          return {
            id: area.id,
            nombre: area.nombre,
            descripcion: area.descripcion
          };
        });

      // Calcular nuevo costo total
      const costoPorArea = convocatoria.costo_por_area || 16;
      const nuevoTotal = areasFiltradas.length * costoPorArea;
      
      // Actualizar la inscripción
      const inscripcionActualizada = {
        ...inscripcionesActuales[inscripcionIndex],
        areas: areasFiltradas,
        fechaActualizacion: new Date().toISOString(),
        costoTotal: nuevoTotal,
        ordenPago: {
          id: 'orden-' + Date.now(),
          fecha: new Date().toISOString(),
          estado: 'pendiente',
          total: nuevoTotal
        }
      };

      // Actualizar en localStorage
      inscripcionesActuales[inscripcionIndex] = inscripcionActualizada;
      localStorage.setItem('olimpiadas_inscripciones', JSON.stringify(inscripcionesActuales));

      // Cerrar el modal de edición
      setShowModalEditar(false);
      
      // Mostrar mensaje de éxito en el modal
      setMensajeExito('Inscripción actualizada correctamente. Se ha generado una nueva orden de pago con el monto actualizado.');
      setShowModalExito(true);

    } catch (err) {
      console.error('Error al guardar cambios:', err);
      setError(err.message || 'Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };
  
  // Función para manejar el cierre del modal de éxito
  const handleCerrarModalExito = () => {
    setShowModalExito(false);
    // Recargar la página
    window.location.reload();
  };
  
  // Confirmar eliminación de inscripción
  const handleConfirmarEliminar = async () => {
    if (!inscripcionActual) return;
    
    try {
      setLoadingAction(true);
      
      // Obtener inscripciones actuales
      const inscripcionesActuales = JSON.parse(localStorage.getItem('olimpiadas_inscripciones') || '[]');
      
      // Filtrar la inscripción a eliminar
      const inscripcionesActualizadas = inscripcionesActuales.filter(
        insc => insc.id !== inscripcionActual.id
      );
      
      // Guardar cambios
      localStorage.setItem('olimpiadas_inscripciones', JSON.stringify(inscripcionesActualizadas));
      
      // Cerrar el modal de eliminación
      setShowModalEliminar(false);
      setInscripcionActual(null);
      
      // Mostrar mensaje de éxito en el modal
      setMensajeExito('Inscripción eliminada correctamente.');
      setShowModalExito(true);
      
    } catch (err) {
      console.error('Error al eliminar inscripción:', err);
      setError('Error al eliminar la inscripción. Por favor, inténtalo de nuevo.');
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Renderizar estado de pago con el color adecuado
  const renderEstadoPago = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pagado':
      case 'verificado':
      case 'aprobado':
        return <Badge bg="success">Pago verificado <FaCheckCircle /></Badge>;
      case 'pendiente':
        return <Badge bg="warning">Pendiente de verificación</Badge>;
      case 'rechazado':
        return <Badge bg="danger">Pago rechazado <FaTimesCircle /></Badge>;
      default:
        return <Badge bg="secondary">Sin información</Badge>;
    }
  };
  
  // Formatear fecha para mostrar
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'No disponible';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando tus inscripciones...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }
  
  if (inscripciones.length === 0) {
    return (
      <Alert variant="info" className="my-4">
        <Alert.Heading>No tienes inscripciones activas</Alert.Heading>
        <p>
          Todavía no te has inscrito en ninguna convocatoria. 
          Puedes revisar las convocatorias disponibles e inscribirte en ellas.
        </p>
        <Button variant="primary" href="/estudiante/convocatorias">
          Ver convocatorias disponibles
        </Button>
      </Alert>
    );
  }
  
  return (
    <div className="mis-inscripciones-container">
      <h2 className="border-bottom pb-2 mb-4">Mis Inscripciones</h2>
      
      <Alert variant="info" className="mb-4">
        <Alert.Heading>Información importante</Alert.Heading>
        <p>
          Recuerda que solo puedes modificar tus áreas si tu pago aún no ha sido verificado.
          Una vez que el pago sea aprobado, no podrás realizar cambios en tu inscripción.
        </p>
      </Alert>
      
      {inscripciones.map((inscripcion) => (
        <Card key={inscripcion.id} className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="m-0 fs-5">
                {inscripcion.convocatoria?.nombre || 'Convocatoria'}
              </h3>
              <div>
                {renderEstadoPago(inscripcion.ordenPago?.estado)}
              </div>
            </div>
          </Card.Header>
          
          <Card.Body>
            <Row className="mb-4">
              <Col md={6}>
                <h5>Información de la inscripción</h5>
                <p><strong>Fecha de inscripción:</strong> {formatearFecha(inscripcion.fechaInscripcion)}</p>
                <p>
                  <strong>Periodo válido:</strong> {formatearFecha(inscripcion.convocatoria?.fecha_inicio_inscripciones)} 
                  al {formatearFecha(inscripcion.convocatoria?.fecha_fin_inscripciones)}
                </p>
                <p><strong>Costo por área:</strong> ${inscripcion.convocatoria?.costo_por_area || 16}</p>
                <p><strong>Costo total:</strong> ${(inscripcion.convocatoria?.costo_por_area || 16) * inscripcion.areas.length}</p>
              </Col>
              
              <Col md={6}>
                <h5>Áreas seleccionadas</h5>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Área</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscripcion.areas && inscripcion.areas.length > 0 ? (
                      inscripcion.areas
                        .filter(area => {
                          // Verificar si el área está en las áreas permitidas de la convocatoria
                          const convocatoria = JSON.parse(localStorage.getItem('convocatorias') || '[]')
                            .find(c => c.id === inscripcion.convocatoria.id);
                          return convocatoria?.areas?.some(a => a.id === area.id);
                        })
                        .map((area, index) => (
                          <tr key={`${inscripcion.id}-${index}-${area.id}`}>
                        <td>{index + 1}</td>
                        <td>{area.nombre}</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-center text-gray-500">
                          No hay áreas seleccionadas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>
            </Row>
            
            <div className="orden-pago-section p-3 border rounded bg-light mb-3">
              <h5 className="d-flex align-items-center">
                <FaFileInvoiceDollar className="me-2" /> Información de pago
              </h5>
              
              {inscripcion.ordenPago ? (
                <>
                  <p><strong>Número de orden:</strong> {inscripcion.ordenPago.id || inscripcion.ordenPago.numeroOrden}</p>
                  <p><strong>Estado:</strong> {inscripcion.ordenPago.estado || 'Pendiente'}</p>
                  {inscripcion.ordenPago.fechaPago && (
                    <p><strong>Fecha de pago:</strong> {formatearFecha(inscripcion.ordenPago.fechaPago)}</p>
                  )}
                </>
              ) : (
                <p>No hay información de pago disponible</p>
              )}
            </div>
            
            <div className="d-flex justify-content-end">
              {inscripcion.ordenPago && (
                <Button 
                  variant="outline-primary" 
                  className="me-2"
                  onClick={() => handleDescargarOrden(inscripcion.ordenPago.id)}
                  disabled={descargandoPDF}
                >
                  <FaDownload className="me-1" /> 
                  {descargandoPDF ? 'Descargando...' : 'Descargar orden de pago'}
                </Button>
              )}
              
              {(inscripcion.ordenPago?.estado === 'pendiente' || !inscripcion.ordenPago?.estado) && (
                <>
                  <Button 
                    variant="outline-warning" 
                    className="me-2"
                    onClick={() => handleEditarInscripcion(inscripcion)}
                  >
                    <FaEdit className="me-1" /> Editar áreas
                  </Button>
                  
                  <Button 
                    variant="outline-danger"
                    onClick={() => handleEliminarInscripcion(inscripcion)}
                  >
                    <FaTrash className="me-1" /> Eliminar
                  </Button>
                </>
              )}
            </div>
          </Card.Body>
        </Card>
      ))}
      
      {/* Modal para editar inscripción */}
      <Modal show={showModalEditar} onHide={() => setShowModalEditar(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar áreas de inscripción</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {inscripcionActual && (
            <>
              <Alert variant="info">
                <p className="mb-0">
                  Puedes seleccionar hasta {inscripcionActual.convocatoria?.maximo_areas || 2} áreas.
                  El costo por área es de ${inscripcionActual.convocatoria?.costo_por_area || 16}.
                </p>
              </Alert>
              
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Selecciona las áreas en las que deseas participar:</Form.Label>
                  
                  <div className="areas-selection">
                    {areasDisponibles.map((area) => (
                      <Form.Check
                        key={area.id}
                        type="checkbox"
                        id={`area-${area.id}`}
                        label={area.nombre}
                        checked={areasSeleccionadas.includes(area.id)}
                        onChange={() => handleToggleArea(area.id)}
                        className="mb-2"
                      />
                    ))}
                  </div>
                </Form.Group>
              </Form>
              
              <div className="selected-areas-summary mt-4">
                <h6>Áreas seleccionadas: {areasSeleccionadas.length}/{inscripcionActual.convocatoria?.maximo_areas || 2}</h6>
                {areasSeleccionadas.length > 0 ? (
                  <>
                    <ul>
                      {areasSeleccionadas.map((areaId) => {
                        const area = areasDisponibles.find(a => a.id === areaId);
                        return area ? (
                          <li key={areaId}>{area.nombre}</li>
                        ) : null;
                      })}
                    </ul>
                    <div className="alert alert-warning">
                      <strong>Costo total actualizado:</strong> ${costoTotalActualizado}
                      {inscripcionActual.ordenPago && (
                        <div className="mt-2">
                          <small>
                            * Al guardar los cambios, se generará una nueva orden de pago con este monto.
                            El estado de pago se reiniciará a pendiente.
                          </small>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-muted">No has seleccionado ningún área.</p>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEditar(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleGuardarCambios(inscripcionActual.id)}
            disabled={guardando || areasSeleccionadas.length === 0}
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para confirmar eliminación */}
      <Modal show={showModalEliminar} onHide={() => setShowModalEliminar(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro que deseas eliminar esta inscripción?</p>
          <p className="text-danger">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEliminar(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmarEliminar}
            disabled={loadingAction}
          >
            {loadingAction ? 'Eliminando...' : 'Eliminar inscripción'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Éxito */}
      <Modal show={showModalExito} onHide={handleCerrarModalExito} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>¡Éxito!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FaCheckCircle className="text-success mb-3" style={{ fontSize: '3rem' }} />
            <p className="mb-0">{mensajeExito}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleCerrarModalExito}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MisInscripciones;
