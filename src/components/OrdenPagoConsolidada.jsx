import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

const OrdenPagoConsolidada = () => {
  const [ordenesPago, setOrdenesPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordenesGeneradas, setOrdenesGeneradas] = useState({});
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Migrar orden antigua (si existe) al array de órdenes nuevas
    const ordenAntigua = JSON.parse(localStorage.getItem('datosInscripcionGrupal'));
    let ordenes = JSON.parse(localStorage.getItem('ordenesPagoConsolidadas')) || [];
    if (ordenAntigua) {
      // Si la orden antigua no está ya en el array, la agregamos
      if (!ordenes.some(o => JSON.stringify(o) === JSON.stringify(ordenAntigua))) {
        ordenes.push(ordenAntigua);
        localStorage.setItem('ordenesPagoConsolidadas', JSON.stringify(ordenes));
      }
      // Borramos la orden antigua para evitar que se bloquee la inscripción
      localStorage.removeItem('datosInscripcionGrupal');
    }
    setOrdenesPago(ordenes);
    setLoading(false);
  }, []);

  function generarOrdenPago(idx, datosInscripcion) {
    const orden = {
      id: `ORDEN-${Date.now()}`,
      fecha: new Date().toISOString(),
      convocatoria: datosInscripcion.convocatoria,
      areas: datosInscripcion.areas,
      estudiantes: datosInscripcion.estudiantes,
      totalEstudiantes: datosInscripcion.estudiantes.length,
      estado: 'generada'
    };
    setOrdenesGeneradas(prev => ({ ...prev, [idx]: orden }));
    setShowModal(true);
  }

  function descargarOrdenPagoGrupalPDF(orden, idx) {
    const doc = new jsPDF();
    const precioPorArea = 16; // Cambia esto si tienes el precio real en la convocatoria
    const fechaExpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    // Título
    doc.setFontSize(16);
    doc.text('ORDEN DE PAGO CONSOLIDADA', 105, 20, { align: 'center' });

    // Agregar el ID de la orden (código de pago)
    doc.setFontSize(12);
    doc.text(`ID Orden: ${orden.id}`, 20, 30);

    // Convocatoria y áreas
    doc.setFontSize(12);
    doc.text(`Convocatoria: ${orden.convocatoria.nombre}`, 20, 35);
    doc.text(`Áreas: ${orden.areas.map(a => a.nombre).join(', ')}`, 20, 43);

    // Fecha de emisión y expiración
    doc.text(`Fecha de emisión: ${new Date(orden.fecha).toLocaleDateString()}`, 20, 51);
    doc.text(`Fecha de expiración: ${fechaExpiracion.toLocaleDateString()}`, 20, 59);

    // Tabla de estudiantes
    doc.setFontSize(12);
    doc.text('Estudiantes:', 20, 70);
    let y = 78;
    doc.setFontSize(10);
    doc.text('NOMBRE', 20, y);
    doc.text('CI', 90, y);
    doc.text('CURSO', 120, y);
    y += 6;
    doc.line(20, y, 180, y);
    y += 6;

    orden.estudiantes.forEach((est, i) => {
      doc.text(`${est.nombre} ${est.apellidos}`, 20, y);
      doc.text(est.ci, 90, y);
      doc.text(
        est.curso <= 6 ? `${est.curso}° Primaria` : `${est.curso - 6}° Secundaria`,
        120,
        y
      );
      y += 6;
      if (y > 270 && i < orden.estudiantes.length - 1) {
        doc.addPage();
        y = 20;
      }
    });

    y += 8;
    doc.setFontSize(12);
    doc.text(`Total estudiantes: ${orden.estudiantes.length}`, 20, y);
    y += 8;
    doc.text(
      `Total a pagar: Bs. ${orden.areas.length * orden.estudiantes.length * precioPorArea}`,
      20,
      y
    );

    y += 12;
    doc.setFontSize(11);
    doc.text('Instrucciones de pago:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(
      'Presentar esta orden en la oficina de tesorería de la UMSS en horario de 8:00 a 16:00, de lunes a viernes.',
      20,
      y
    );

    doc.save(
      `orden_pago_consolidada_${orden.convocatoria.nombre.replace(/\s+/g, '_')}_${idx + 1}.pdf`
    );
  }
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!ordenesPago || ordenesPago.length === 0) {
    return (
      <div className="alert alert-warning m-4" role="alert">
        No hay órdenes de pago consolidadas disponibles
      </div>
    );
  }
  
  return (
    <div className="container-fluid p-4">
      {ordenesPago.map((datosInscripcion, idx) => (
        <div className="card shadow-sm mb-4" key={idx}>
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">Orden de Pago Consolidada</h5>
                </div>
          <div className="card-body">
            {/* Información de la Convocatoria */}
            <div className="mb-4">
              <h6 className="text-success mb-3">
                <i className="bi bi-calendar-event me-2"></i>
                Convocatoria
              </h6>
              <div className="bg-light p-3 rounded">
                <h5 className="mb-2">{datosInscripcion.convocatoria.nombre}</h5>
                <p className="mb-0 text-muted">
                  <i className="bi bi-calendar-range me-2"></i>
                  Del {new Date(datosInscripcion.convocatoria.fecha_inicio).toLocaleDateString()} 
                  al {new Date(datosInscripcion.convocatoria.fecha_fin).toLocaleDateString()}
                </p>
              </div>
              </div>
              
            {/* Áreas Seleccionadas */}
            <div className="mb-4">
              <h6 className="text-success mb-3">
                <i className="bi bi-list-check me-2"></i>
                Áreas Seleccionadas
              </h6>
              <div className="row g-3">
                {datosInscripcion.areas && datosInscripcion.areas.length > 0 ? (
                  datosInscripcion.areas.map(area => (
                    <div key={area.id} className="col-md-6">
                      <div className="bg-light p-3 rounded">
                        <h6 className="mb-1">{area.nombre}</h6>
                        <p className="mb-0 text-muted small">{area.descripcion}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="alert alert-warning mb-0">
                      No hay áreas seleccionadas.
                    </div>
                  </div>
                )}
                  </div>
            </div>

            {/* Lista de Estudiantes */}
            <div className="mb-4">
              <h6 className="text-success mb-3">
                <i className="bi bi-people me-2"></i>
                Estudiantes Inscritos ({datosInscripcion.estudiantes.length})
              </h6>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre Completo</th>
                      <th>CI</th>
                      <th>Curso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosInscripcion.estudiantes.map(estudiante => (
                      <tr key={estudiante.id}>
                        <td>{`${estudiante.nombre} ${estudiante.apellidos}`}</td>
                        <td>{estudiante.ci}</td>
                        <td>
                          {estudiante.curso <= 6 
                            ? `${estudiante.curso}° Primaria` 
                            : `${estudiante.curso - 6}° Secundaria`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
              
            {/* Botones de Acción */}
            <div className="d-flex justify-content-end gap-2">
                <button 
                onClick={() => navigate('/tutor/estudiantes')}
                className="btn btn-outline-secondary"
                >
                <i className="bi bi-arrow-left me-2"></i>
                  Volver
                </button>
                <button 
                onClick={() => generarOrdenPago(idx, datosInscripcion)}
                className="btn btn-success"
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Generar Orden de Pago
              </button>
            </div>

            {/* Resumen de la orden generada */}
            {ordenesGeneradas[idx] && (
              <div className="alert alert-success mt-4">
                <h5>Resumen de la Orden Generada</h5>
                <p><b>ID Orden:</b> {ordenesGeneradas[idx].id}</p>
                <p><b>Convocatoria:</b> {ordenesGeneradas[idx].convocatoria.nombre}</p>
                <p><b>Áreas:</b> {ordenesGeneradas[idx].areas.map(a => a.nombre).join(', ')}</p>
                <p><b>Total de estudiantes:</b> {ordenesGeneradas[idx].totalEstudiantes}</p>
                <p><b>Fecha:</b> {new Date(ordenesGeneradas[idx].fecha).toLocaleString()}</p>
                <button
                  className="btn btn-outline-primary btn-sm mt-2"
                  onClick={() => descargarOrdenPagoGrupalPDF(ordenesGeneradas[idx], idx)}
                >
                  Descargar PDF
                </button>
              </div>
            )}
            </div>
        </div>
      ))}
      {/* Modal de éxito */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-success">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">¡Éxito!</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <i className="bi bi-check-circle-fill" style={{ fontSize: 48, color: '#198754' }}></i>
                <p className="mt-3 mb-0 fs-5">¡Orden de pago generada con éxito!</p>
          </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-success" onClick={() => setShowModal(false)}>
                  Cerrar
                </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenPagoConsolidada;