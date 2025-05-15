import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import jsPDF from 'jspdf';
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
        
        // Obtener estudiantes del tutor
        const studentsData = await apiService.getStudentsByTutor(currentUser.id);
        
        // Filtrar solo estudiantes con áreas inscritas
        const studentsWithAreas = studentsData.filter(student => 
          student.areasInscritas && student.areasInscritas.length > 0
        );
        
        setStudents(studentsWithAreas);
        
        if (studentsWithAreas.length === 0) {
          setError('No tiene estudiantes con áreas académicas inscritas.');
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
      const estudiantesInfo = students
        .filter(student => estudiantesSeleccionados.includes(student.id))
        .map(student => ({
          id: student.id,
          nombre: student.nombre,
          apellido: student.apellido || student.apellidos,
          email: student.email,
          areas: student.areasInscritas
        }));
      
      // Preparar datos para la orden de pago consolidada
      const ordenData = {
        tutorId: currentUser.id,
        tutorNombre: `${currentUser.nombre} ${currentUser.apellido || ''}`,
        tutorEmail: currentUser.email,
        estudiantes: estudiantesInfo,
        cantidadEstudiantes: estudiantesSeleccionados.length,
        totalAreas: contarAreasSeleccionadas(),
        total: calcularTotal()
      };
      
      console.log('Generando orden de pago consolidada:', ordenData);
      
      // En un entorno real, aquí llamaríamos al backend:
      // const result = await apiService.generarOrdenPagoConsolidada(ordenData);
      
      // Simulación para desarrollo:
      const result = {
        id: `ORDEN-GRUPO-${Date.now()}`,
        fecha: new Date().toISOString(),
        total: ordenData.total,
        tutor: {
          id: currentUser.id,
          nombre: ordenData.tutorNombre,
          email: currentUser.email
        },
        cantidadEstudiantes: ordenData.cantidadEstudiantes,
        cantidadAreas: ordenData.totalAreas,
        estudiantes: estudiantesInfo,
        instrucciones: "Para completar el pago, presente este código en la oficina de tesorería de la UMSS en horario de 8:00 a 16:00, de lunes a viernes.",
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
      };
      
      setOrdenGenerada(result);
    } catch (err) {
      console.error('Error al generar orden de pago consolidada:', err);
      setError('Ocurrió un error al generar la orden de pago. Intente nuevamente.');
    } finally {
      setGenerandoOrden(false);
    }
  };
  
  const handleVolver = () => {
    navigate('/tutor');
  };
  
  const handleDescargarPDF = () => {
    if (!ordenGenerada || !config) return;
    
    // Crear un nuevo documento PDF
    const doc = new jsPDF();
    
    // Añadir texto centrado de título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDEN DE PAGO CONSOLIDADA', 105, 20, { align: 'center' });
    
    // Añadir número de orden
    doc.setFontSize(12);
    doc.text(`Orden N°: ${ordenGenerada.id}`, 105, 30, { align: 'center' });
    
    // Añadir fecha
    const fecha = new Date(ordenGenerada.fecha).toLocaleDateString();
    doc.text(`Fecha de emisión: ${fecha}`, 105, 38, { align: 'center' });
    
    // Información del tutor
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL TUTOR:', 20, 50);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${ordenGenerada.tutor.nombre}`, 20, 58);
    doc.text(`Email: ${ordenGenerada.tutor.email}`, 20, 66);
    
    // Resumen
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN:', 20, 80);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de estudiantes: ${ordenGenerada.cantidadEstudiantes}`, 20, 88);
    doc.text(`Total de áreas académicas: ${ordenGenerada.cantidadAreas}`, 20, 96);
    doc.text(`Monto por área: $${config.precioPorArea || 16}`, 20, 104);
    doc.text(`Monto total a pagar: $${ordenGenerada.total}`, 20, 112);
    
    // Fecha de expiración
    const fechaExpiracion = new Date(ordenGenerada.fechaExpiracion).toLocaleDateString();
    doc.text(`Fecha límite de pago: ${fechaExpiracion}`, 20, 120);
    
    // Instrucciones
    doc.setFont('helvetica', 'bold');
    doc.text('INSTRUCCIONES DE PAGO:', 20, 134);
    
    doc.setFont('helvetica', 'normal');
    doc.text(ordenGenerada.instrucciones, 20, 142);
    
    // Lista de estudiantes
    doc.setFont('helvetica', 'bold');
    doc.text('ESTUDIANTES INCLUIDOS:', 20, 156);
    
    doc.setFont('helvetica', 'normal');
    let yPosition = 164;
    
    ordenGenerada.estudiantes.forEach((estudiante, index) => {
      // Si estamos cerca del final de la página, crear una nueva
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        doc.setFont('helvetica', 'bold');
        doc.text('ESTUDIANTES INCLUIDOS (continuación):', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition += 10;
      }
      
      const areasText = estudiante.areas.length > 0 
        ? `${estudiante.areas.length} áreas` 
        : 'Sin áreas';
      
      doc.text(`${index + 1}. ${estudiante.nombre} ${estudiante.apellido} - ${areasText}`, 20, yPosition);
      yPosition += 8;
    });
    
    // Guardar el PDF
    doc.save(`orden_pago_consolidada_${ordenGenerada.id}.pdf`);
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
