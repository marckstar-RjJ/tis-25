import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Spinner, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaDownload, FaEdit, FaTrash, FaFileInvoiceDollar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { limpiarDatosIncorrectos } from './utils/limpiarInscripciones';

const MisInscripciones = () => {
  const { currentUser } = useAuth();
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [inscripcionActual, setInscripcionActual] = useState(null);
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [descargandoPDF, setDescargandoPDF] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  
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
        
        // Obtener estudiante actual con sus datos completos
        const estudiante = await apiService.getCurrentStudent();
        
        if (!estudiante) {
          setError('No se pudo obtener información del estudiante.');
          return;
        }
        
        console.log('Estudiante recuperado:', estudiante);
        const todasLasInscripciones = [];
        
        // Comprobar si tiene inscripciones en el formato antiguo
        if (estudiante.areasInscritas && estudiante.areasInscritas.length > 0) {
          // Obtener todas las convocatorias
          const convocatoriaData = await apiService.getAllConvocatorias();
          const convocatoriaDefecto = convocatoriaData.find(c => c.activa) || convocatoriaData[0];
          
          // Obtener áreas completas
          const areasCompletas = await apiService.getAreas();
          const areasSeleccionadas = areasCompletas.filter(area => 
            estudiante.areasInscritas.includes(area.id)
          );
          
          const inscripcionAntigua = {
            id: estudiante.id + '-inscripcion-antigua',
            convocatoriaId: convocatoriaDefecto.id,
            convocatoria: convocatoriaDefecto,
            areas: areasSeleccionadas,
            fechaInscripcion: estudiante.boletaPago?.fecha || new Date().toISOString(),
            ordenPago: estudiante.boletaPago || {
              id: 'orden-' + estudiante.id,
              fecha: new Date().toISOString(),
              estado: 'pendiente',
              total: (convocatoriaDefecto.costo_por_area || 16) * areasSeleccionadas.length
            }
          };
          
          todasLasInscripciones.push(inscripcionAntigua);
        }
        
        // Obtener las inscripciones del nuevo formato
        if (estudiante.inscripciones && Array.isArray(estudiante.inscripciones)) {
          // Obtener detalles completos de cada inscripción
          const inscripcionesCompletas = await Promise.all(
            estudiante.inscripciones.map(async (inscripcion) => {
              // Si la inscripción ya tiene toda la información necesaria, usarla
              if (inscripcion.convocatoria && inscripcion.areas && inscripcion.ordenPago) {
                return inscripcion;
              }
              
              // Si no, obtener información complementaria
              let convocatoria;
              try {
                convocatoria = await apiService.getConvocatoriaById(inscripcion.convocatoriaId);
              } catch (error) {
                console.warn('No se pudo obtener la convocatoria:', error);
                // Obtener todas las convocatorias y buscar la coincidencia
                const todasConvocatorias = await apiService.getAllConvocatorias();
                convocatoria = todasConvocatorias.find(c => c.id === inscripcion.convocatoriaId) ||
                              todasConvocatorias[0]; // Usar la primera como fallback
              }
              
              // Asegurarnos de que las áreas sean objetos completos
              let areasCompletas = inscripcion.areas;
              if (inscripcion.areas && inscripcion.areas.some(a => typeof a === 'string' || !a.nombre)) {
                const todasAreas = await apiService.getAreas();
                areasCompletas = inscripcion.areas.map(areaId => {
                  const id = typeof areaId === 'string' ? areaId : areaId.id;
                  return todasAreas.find(a => a.id === id) || { id, nombre: `Área ${id}` };
                });
              }
              
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
            })
          );
          
          todasLasInscripciones.push(...inscripcionesCompletas);
        }
        
        // Se eliminó el código de prueba que generaba inscripciones automáticas
        
        // Filtrar inscripciones duplicadas o erróneas
        // Esta función elimina inscripciones duplicadas basadas en la convocatoria
        // y se asegura de que el estudiante esté realmente inscrito en las áreas mostradas
        const inscripcionesFiltradas = [];
        const convocatoriasVistas = new Map();
        
        todasLasInscripciones.forEach(inscripcion => {
          const convocatoriaId = inscripcion.convocatoriaId;
          const areasIds = inscripcion.areas?.map(a => a.id || a).sort().join(',') || '';
          const clave = `${convocatoriaId}-${areasIds}`;
          
          // Si es la primera vez que vemos esta combinación de convocatoria y áreas, la agregamos
          if (!convocatoriasVistas.has(clave)) {
            // Ignorar específicamente la inscripción errónea (Biología en Oh Sansi)
            const esBiologiaOhSansi = 
              inscripcion.convocatoria?.nombre === 'Olimpiadas Oh Sansi!' && 
              inscripcion.areas?.length === 1 && 
              inscripcion.areas[0]?.nombre === 'Biología';
              
            // Solo agregar si no es la inscripción errónea específica o si fue explícitamente confirmada
            if (!esBiologiaOhSansi || inscripcion.confirmada === true) {
              inscripcionesFiltradas.push(inscripcion);
              convocatoriasVistas.set(clave, true);
            }
          }
        });
        
        console.log('Inscripciones encontradas (originales):', todasLasInscripciones);
        console.log('Inscripciones filtradas (a mostrar):', inscripcionesFiltradas);
        setInscripciones(inscripcionesFiltradas);
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
      // Obtener convocatoria completa
      const convocatoria = await apiService.getConvocatoriaById(convocatoriaId);
      if (convocatoria && convocatoria.areas) {
        setAreasDisponibles(convocatoria.areas);
      } else {
        // Si no hay información de áreas, obtener áreas generales
        const todasLasAreas = await apiService.getAreas();
        setAreasDisponibles(todasLasAreas);
      }
    } catch (err) {
      console.error('Error al cargar áreas disponibles:', err);
      // Usar un array vacío en caso de error
      setAreasDisponibles([]);
    }
  };
  
  // Abrir modal para editar inscripción
  const handleEditarInscripcion = async (inscripcion) => {
    setInscripcionActual(inscripcion);
    // Cargar áreas disponibles para esta convocatoria
    await cargarAreasDisponibles(inscripcion.convocatoriaId);
    // Establecer áreas ya seleccionadas
    setAreasSeleccionadas(inscripcion.areas.map(area => area.id || area));
    setShowModalEditar(true);
  };
  
  // Abrir modal para eliminar inscripción
  const handleEliminarInscripcion = (inscripcion) => {
    setInscripcionActual(inscripcion);
    setShowModalEliminar(true);
  };
  
  // Descargar orden de pago
  const handleDescargarOrden = async (ordenId) => {
    try {
      setDescargandoPDF(true);
      const pdfBlob = await apiService.descargarOrdenPDF(ordenId);
      
      // Crear URL para el blob y forzar descarga
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orden_pago_${ordenId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar orden de pago:', err);
      alert('No se pudo descargar la orden de pago. Intenta nuevamente.');
    } finally {
      setDescargandoPDF(false);
    }
  };
  
  // Actualizar áreas seleccionadas
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
  
  // Guardar cambios en la inscripción
  const handleGuardarCambios = async () => {
    if (!inscripcionActual || !currentUser) return;
    
    try {
      setLoadingAction(true);
      
      // Verificar que se hayan seleccionado áreas
      if (areasSeleccionadas.length === 0) {
        alert('Debes seleccionar al menos un área');
        return;
      }
      
      // Verificar que no se exceda el límite de áreas
      if (inscripcionActual.convocatoria && 
          inscripcionActual.convocatoria.maximo_areas && 
          areasSeleccionadas.length > inscripcionActual.convocatoria.maximo_areas) {
        alert(`Solo puedes seleccionar hasta ${inscripcionActual.convocatoria.maximo_areas} áreas.`);
        return;
      }
      
      // Actualizar áreas del estudiante
      await apiService.updateStudentAreas(currentUser.id, areasSeleccionadas);
      
      // Actualizar la inscripción en el estado local
      const updatedInscripciones = inscripciones.map(insc => {
        if (insc.id === inscripcionActual.id) {
          // Obtener objetos completos de las áreas
          const areasActualizadas = areasDisponibles.filter(area => areasSeleccionadas.includes(area.id));
          return {
            ...insc,
            areas: areasActualizadas
          };
        }
        return insc;
      });
      
      setInscripciones(updatedInscripciones);
      setShowModalEditar(false);
      
      // Mostrar mensaje de éxito
      alert('Inscripción actualizada correctamente');
    } catch (err) {
      console.error('Error al actualizar inscripción:', err);
      alert('No se pudo actualizar la inscripción. Intenta nuevamente.');
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Confirmar eliminación de inscripción
  const handleConfirmarEliminar = async () => {
    if (!inscripcionActual || !currentUser) return;
    
    try {
      setLoadingAction(true);
      
      // Lógica para eliminar inscripción
      // Asumimos que hay un método para esto, si no existe se tendría que implementar
      await apiService.updateStudentAreas(currentUser.id, []);
      
      // Eliminar la inscripción del estado local
      const updatedInscripciones = inscripciones.filter(insc => insc.id !== inscripcionActual.id);
      setInscripciones(updatedInscripciones);
      
      setShowModalEliminar(false);
      
      // Mostrar mensaje de éxito
      alert('Inscripción eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar inscripción:', err);
      alert('No se pudo eliminar la inscripción. Intenta nuevamente.');
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
                    {inscripcion.areas.map((area, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{area.nombre}</td>
                      </tr>
                    ))}
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
                  <ul>
                    {areasSeleccionadas.map((areaId) => {
                      const area = areasDisponibles.find(a => a.id === areaId);
                      return area ? (
                        <li key={areaId}>{area.nombre}</li>
                      ) : null;
                    })}
                  </ul>
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
            onClick={handleGuardarCambios}
            disabled={loadingAction || areasSeleccionadas.length === 0}
          >
            {loadingAction ? 'Guardando...' : 'Guardar cambios'}
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
    </div>
  );
};

export default MisInscripciones;
