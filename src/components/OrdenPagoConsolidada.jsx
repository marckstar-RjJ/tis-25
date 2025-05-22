import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { guardarOrdenGrupal, descargarOrdenGrupalPDF } from './utils/ordenesGrupales';
import '../App.css';

const OrdenPagoConsolidada = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [config, setConfig] = useState(null);
  const [generandoOrden, setGenerandoOrden] = useState(false);
  const [ordenGenerada, setOrdenGenerada] = useState(null);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener configuración de olimpiadas
        const configData = await apiService.getOlympiadConfig();
        setConfig(configData);
        
        // Obtener estudiantes del tutor - explícitamente excluir los que ya tienen orden
        const studentsData = await apiService.getStudentsByTutor(currentUser.id, false);
        console.log('Estudiantes obtenidos (sin órdenes activas):', studentsData);
        
        // Filtrar solo estudiantes con áreas inscritas
        const studentsWithAreas = studentsData.filter(student => 
          student.areasInscritas && student.areasInscritas.length > 0
        );
        
        console.log('Estudiantes con áreas inscritas sin órdenes pendientes:', studentsWithAreas);
        setStudents(studentsWithAreas);
        
        // Mensaje apropiado según la cantidad de estudiantes disponibles
        if (studentsWithAreas.length === 0) {
          setError('No hay estudiantes disponibles con áreas inscritas sin órdenes de pago pendientes.');
        } else if (studentsWithAreas.length === 1) {
          setError('Para utilizar el módulo de Orden de Pago Grupal se necesitan al menos 2 estudiantes inscritos con áreas sin órdenes de pago pendientes.');
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos necesarios. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  const handleToggleSelectAll = () => {
    const newSelectAllValue = !selectAll;
    setSelectAll(newSelectAllValue);
    
    if (newSelectAllValue) {
      // Seleccionar todos los estudiantes
      setEstudiantesSeleccionados(students.map(student => student.id));
    } else {
      // Deseleccionar todos
      setEstudiantesSeleccionados([]);
    }
  };
  
  const handleToggleEstudiante = (studentId) => {
    if (estudiantesSeleccionados.includes(studentId)) {
      // Quitar de la selección
      setEstudiantesSeleccionados(prev => prev.filter(id => id !== studentId));
      setSelectAll(false);
    } else {
      // Agregar a la selección
      setEstudiantesSeleccionados(prev => [...prev, studentId]);
      
      // Verificar si todos están seleccionados
      if (students.length === estudiantesSeleccionados.length + 1) {
        setSelectAll(true);
      }
    }
  };

  const calcularTotalPorEstudiante = (student) => {
    if (!student.areasInscritas || !config) return 0;
    return student.areasInscritas.length * (config.precioPorArea || 16);
  };
  
  const calcularTotal = () => {
    if (!config || estudiantesSeleccionados.length === 0) return 0;
    
    return students
      .filter(student => estudiantesSeleccionados.includes(student.id))
      .reduce((total, student) => {
        return total + calcularTotalPorEstudiante(student);
      }, 0);
  };
  
  const contarAreasSeleccionadas = () => {
    if (estudiantesSeleccionados.length === 0) return 0;
    
    return students
      .filter(student => estudiantesSeleccionados.includes(student.id))
      .reduce((total, student) => {
        return total + (student.areasInscritas ? student.areasInscritas.length : 0);
      }, 0);
  };
  
  const handleGenerarOrden = async () => {
    if (estudiantesSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un estudiante.');
      return;
    }
    
    setGenerandoOrden(true);
    setError('');
    
    try {
      const estudiantesInfo = estudiantesSeleccionados.map(id => {
        const estudiante = students.find(e => e.id === id);
        return {
          id: estudiante.id,
          nombre: estudiante.nombre,
          apellido: estudiante.apellido || '',
          curso: estudiante.curso,
          areasInscritas: estudiante.areasInscritas || []
        };
      });
      
      const cantidadAreas = estudiantesInfo.reduce((total, est) => 
        total + (est.areasInscritas?.length || 0), 0);
      
      const precioPorArea = config.precioPorArea || 16;
      const total = cantidadAreas * precioPorArea;
      
      const ordenData = {
        tutorNombre: `${currentUser.nombre} ${currentUser.apellido || ''}`,
        cantidadEstudiantes: estudiantesInfo.length,
        cantidadAreas,
        total
      };
      
      const fechaActual = new Date();
      const fechaExpiracion = new Date(fechaActual);
      fechaExpiracion.setHours(fechaExpiracion.getHours() + 48);
      
      const ordenGrupal = {
        id: `ORDEN-GRUPO-${Date.now()}`,
        fecha: fechaActual.toISOString(),
        fechaExpiracion: fechaExpiracion.toISOString(),
        total: ordenData.total,
        precioPorArea,
        cantidadAreas: ordenData.cantidadAreas,
        tutor: { 
          id: currentUser.id, 
          nombre: ordenData.tutorNombre, 
          email: currentUser.email 
        },
        cantidadEstudiantes: ordenData.cantidadEstudiantes,
        estudiantes: estudiantesInfo,
        estado: 'Pendiente',
        instrucciones: "Esta orden tiene validez por 48 horas. Realice el pago a través de transferencia bancaria a la cuenta XXXX-XXXX-XXXX-XXXX y envíe el comprobante al correo booleanssolutions@gmail.com"
      };
      
      const result = guardarOrdenGrupal(ordenGrupal);
      
      // Almacenar los IDs para actualización posterior
      const idsEstudiantesSeleccionados = [...estudiantesSeleccionados];
      
      // Marcar a los estudiantes como con orden de pago generada
      // Promise.all para manejar todas las actualizaciones en paralelo
      await Promise.all(
        idsEstudiantesSeleccionados.map(async (studentId) => {
          try {
            console.log(`Marcando estudiante ${studentId} con orden ${result.id}`);
            await apiService.marcarEstudianteConOrden(studentId, result.id);
          } catch (err) {
            console.error(`Error al marcar estudiante ${studentId}:`, err);
          }
        })
      );
      
      setOrdenGenerada(result);
      
      // Actualizar la lista local de estudiantes
      setStudents(prevStudents => {
        return prevStudents.filter(student => !idsEstudiantesSeleccionados.includes(student.id));
      });
      
      // Limpiar selecciones
      setEstudiantesSeleccionados([]);
      setSelectAll(false);
      
      // Alternativamente, volver a cargar los datos para asegurar consistencia
      const refreshData = async () => {
        try {
          const freshStudentsData = await apiService.getStudentsByTutor(currentUser.id, false);
          const freshWithAreas = freshStudentsData.filter(student => 
            student.areasInscritas && student.areasInscritas.length > 0
          );
          
          setStudents(freshWithAreas);
          
          if (freshWithAreas.length < 2) {
            setError('Para utilizar el módulo de Orden de Pago Grupal se necesitan al menos 2 estudiantes inscritos con áreas sin órdenes de pago pendientes.');
          }
        } catch (refreshError) {
          console.error('Error al actualizar datos:', refreshError);
        }
      };
      
      // Ejecutar la actualización de datos
      refreshData();
    } catch (err) {
      console.error('Error al generar orden de pago consolidada:', err);
      setError('Ocurrió un error al generar la orden de pago. Intente nuevamente.');
    } finally {
      setGenerandoOrden(false);
    }
  };
  
  // Descargar PDF
  const handleDescargarPDF = async () => {
    if (!ordenGenerada) return;
    
    try {
      setGenerandoOrden(true);
      
      // Usar la utilidad para descargar el PDF
      const pdfBlob = await descargarOrdenGrupalPDF(ordenGenerada.id);
      
      // Descargar PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orden_pago_grupal_${ordenGenerada.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError('No se pudo generar el PDF de la orden de pago.');
    } finally {
      setGenerandoOrden(false);
    }
  };
  
  const handleVolver = () => {
    navigate('/tutor');
  };
  
  if (loading) {
    return <p className="loading-message">Cargando información...</p>;
  }
  
  return (
    <div className="orden-pago-container">
      <h2>Generación de Orden de Pago Consolidada</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {!ordenGenerada ? (
        <div className="orden-pago-form">
          {students.length > 0 ? (
            <>
              <div className="estudiantes-selection">
                <h3>Seleccione los estudiantes a incluir en la orden de pago</h3>
                
                <div className="select-all-container">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={selectAll} 
                      onChange={handleToggleSelectAll} 
                    />
                    <span className="checkbox-text">Seleccionar todos</span>
                  </label>
                </div>
                
                <ul className="estudiantes-list">
                  {students.map(student => (
                    <li key={student.id} className="estudiante-item">
                      <label className="checkbox-container">
                        <input 
                          type="checkbox" 
                          checked={estudiantesSeleccionados.includes(student.id)} 
                          onChange={() => handleToggleEstudiante(student.id)} 
                        />
                        <div className="estudiante-info">
                          <span className="estudiante-nombre">
                            {student.nombre} {student.apellido || student.apellidos}
                          </span>
                          <span className="estudiante-detalle">
                            {student.areasInscritas.length} áreas - ${calcularTotalPorEstudiante(student)}
                          </span>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="resumen-orden">
                <h3>Resumen de la Orden</h3>
                <div className="resumen-detalles">
                  <p><strong>Estudiantes seleccionados:</strong> {estudiantesSeleccionados.length}</p>
                  <p><strong>Total de áreas académicas:</strong> {contarAreasSeleccionadas()}</p>
                  <p><strong>Precio por área:</strong> ${config?.precioPorArea || 16}</p>
                  <div className="total-pago">
                    <span>Total a pagar:</span>
                    <span className="precio-total">
                      ${calcularTotal()}
                    </span>
                  </div>
                </div>
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
                  disabled={generandoOrden || estudiantesSeleccionados.length === 0}
                >
                  {generandoOrden ? 'Generando...' : 'Generar Orden de Pago Consolidada'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-estudiantes">
              <p>No tiene estudiantes con áreas inscritas para generar una orden de pago.</p>
              <button onClick={handleVolver} className="btn-primario">
                Volver al Panel de Tutor
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="orden-generada">
          <div className="orden-header">
            <h3>¡Orden de pago consolidada generada correctamente!</h3>
            <p className="orden-id">Código: <strong>{ordenGenerada.id}</strong></p>
          </div>
          
          <div className="orden-detalles">
            <div className="orden-info">
              <p><strong>Fecha:</strong> {new Date(ordenGenerada.fecha).toLocaleDateString()}</p>
              <p><strong>Tutor:</strong> {ordenGenerada.tutor.nombre}</p>
              <p><strong>Estudiantes incluidos:</strong> {ordenGenerada.cantidadEstudiantes}</p>
              <p><strong>Total de áreas:</strong> {ordenGenerada.cantidadAreas}</p>
              <p><strong>Total a pagar:</strong> ${ordenGenerada.total}</p>
              <p><strong>Fecha de expiración:</strong> {new Date(ordenGenerada.fechaExpiracion).toLocaleDateString()}</p>
            </div>
            
            <div className="orden-instrucciones">
              <h4>Instrucciones de Pago</h4>
              <p>{ordenGenerada.instrucciones}</p>
            </div>
          </div>
          
          <div className="orden-estudiantes">
            <h4>Estudiantes incluidos:</h4>
            <ul className="estudiantes-incluidos">
              {ordenGenerada.estudiantes.map(estudiante => (
                <li key={estudiante.id}>
                  {estudiante.nombre} {estudiante.apellido} - {estudiante.areas.length} áreas
                </li>
              ))}
            </ul>
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
    </div>
  );
};

export default OrdenPagoConsolidada;
