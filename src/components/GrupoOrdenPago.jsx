import React, { useState } from 'react';
import { FaDownload, FaUsers, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { descargarOrdenGrupalPDF, obtenerOrdenGrupalPorId } from './utils/ordenesGrupales';
import './styles/GrupoOrdenPago.css';

/**
 * Componente para mostrar un grupo de estudiantes con orden de pago consolidada
 */
const GrupoOrdenPago = ({ ordenId, estudiantes, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');
  
  // Obtener la orden completa
  const orden = obtenerOrdenGrupalPorId(ordenId);
  
  if (!orden) {
    return (
      <div className="grupo-orden-error">
        <p>No se encontró la información de la orden #{ordenId}</p>
      </div>
    );
  }
  
  const handleDescargarOrden = async () => {
    try {
      setDescargando(true);
      setError('');
      
      const pdfBlob = await descargarOrdenGrupalPDF(ordenId);
      
      // Crear URL para el blob y forzar descarga
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orden_pago_grupal_${ordenId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error al descargar la orden grupal:', err);
      setError('No se pudo descargar la orden de pago. Intente nuevamente.');
    } finally {
      setDescargando(false);
    }
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className="grupo-orden-container">
      <div className="grupo-orden-header" onClick={toggleExpanded}>
        <div className="grupo-orden-titulo">
          <FaUsers className="grupo-icon" />
          <h3>Orden de Pago Grupal: {ordenId}</h3>
        </div>
        <div className="grupo-orden-info">
          <span>{estudiantes.length} estudiantes</span>
          <span className="grupo-orden-total">${orden.total}</span>
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>
      
      {expanded && (
        <div className="grupo-orden-detalles">
          <div className="grupo-orden-metadata">
            <p><strong>Fecha:</strong> {new Date(orden.fecha).toLocaleDateString()}</p>
            <p><strong>Total de áreas:</strong> {orden.cantidadAreas}</p>
            <p><strong>Estado:</strong> <span className="estado-orden">{orden.estado || 'Pendiente'}</span></p>
            <p><strong>Expira:</strong> {new Date(orden.fechaExpiracion).toLocaleDateString()}</p>
          </div>
          
          <div className="grupo-estudiantes">
            <h4>Estudiantes incluidos:</h4>
            <table className="tabla-estudiantes">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Áreas</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((estudiante, index) => {
                  const numAreas = estudiante.areasInscritas?.length || 
                                  (estudiante.areas?.length || 0);
                  const subtotal = numAreas * (orden.precioPorArea || 16);
                  
                  return (
                    <tr key={estudiante.id}>
                      <td>{index + 1}</td>
                      <td>{estudiante.nombre} {estudiante.apellido || estudiante.apellidos || ''}</td>
                      <td>{numAreas} área(s)</td>
                      <td>${subtotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="grupo-orden-acciones">
            <button 
              onClick={handleDescargarOrden}
              className="btn-descargar-orden"
              disabled={descargando}
            >
              <FaDownload /> {descargando ? 'Descargando...' : 'Descargar Orden de Pago'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrupoOrdenPago;
