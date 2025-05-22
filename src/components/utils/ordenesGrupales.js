/**
 * Utilidades para manejar órdenes de pago grupales
 */

// Clave para almacenar las órdenes en localStorage
const ORDENES_GRUPALES_KEY = 'olimpiadas_ordenes_grupales';

/**
 * Obtener todas las órdenes de pago grupales
 * @returns {Array} Lista de órdenes grupales
 */
export const obtenerOrdenesGrupales = () => {
  const ordenesJSON = localStorage.getItem(ORDENES_GRUPALES_KEY);
  return ordenesJSON ? JSON.parse(ordenesJSON) : [];
};

/**
 * Guardar órdenes grupales en localStorage
 * @param {Array} ordenes - Lista de órdenes a guardar
 */
export const guardarOrdenesGrupales = (ordenes) => {
  localStorage.setItem(ORDENES_GRUPALES_KEY, JSON.stringify(ordenes));
};

/**
 * Obtener una orden grupal por su ID
 * @param {string} ordenId - ID de la orden a buscar
 * @returns {Object|null} Orden encontrada o null
 */
export const obtenerOrdenGrupalPorId = (ordenId) => {
  const ordenes = obtenerOrdenesGrupales();
  return ordenes.find(orden => orden.id === ordenId) || null;
};

/**
 * Guardar una nueva orden de pago grupal
 * @param {Object} ordenData - Datos de la orden a guardar
 * @returns {Object} Orden guardada con ID
 */
export const guardarOrdenGrupal = (ordenData) => {
  const ordenes = obtenerOrdenesGrupales();
  
  // Generar ID único si no existe
  if (!ordenData.id) {
    ordenData.id = `ORDEN-GRUPO-${Date.now()}`;
  }
  
  // Verificar si ya existe y actualizar en lugar de agregar
  const ordenExistenteIndex = ordenes.findIndex(orden => orden.id === ordenData.id);
  
  if (ordenExistenteIndex !== -1) {
    // Actualizar orden existente
    ordenes[ordenExistenteIndex] = {...ordenData};
  } else {
    // Agregar nueva orden
    ordenes.push(ordenData);
  }
  
  guardarOrdenesGrupales(ordenes);
  return ordenData;
};

/**
 * Obtener órdenes grupales por tutor
 * @param {string} tutorId - ID del tutor
 * @returns {Array} Lista de órdenes del tutor
 */
export const obtenerOrdenesGrupalesPorTutor = (tutorId) => {
  const ordenes = obtenerOrdenesGrupales();
  return ordenes.filter(orden => orden.tutor?.id === tutorId || orden.tutorId === tutorId);
};

/**
 * Verificar si un estudiante pertenece a una orden grupal y obtener la orden
 * @param {string} studentId - ID del estudiante a buscar
 * @returns {Object|null} La orden grupal si existe, o null
 */
export const obtenerOrdenGrupalDeEstudiante = (studentId) => {
  const ordenes = obtenerOrdenesGrupales();
  
  // Buscar en todas las órdenes si contiene al estudiante
  return ordenes.find(orden => {
    // Verificar si la orden tiene la propiedad estudiantes y es un array
    if (!orden.estudiantes || !Array.isArray(orden.estudiantes)) return false;
    
    // Buscar el estudiante en la lista de estudiantes de la orden
    return orden.estudiantes.some(est => {
      // Manejar diferentes formatos de ID (string o number)
      const estId = est.id?.toString();
      const targetId = studentId?.toString();
      return estId === targetId;
    });
  }) || null;
};

/**
 * Descargar una orden de pago grupal como PDF
 * @param {string} ordenId - ID de la orden
 * @returns {Promise<Blob>} Blob del PDF generado
 */
export const descargarOrdenGrupalPDF = async (ordenId) => {
  const orden = obtenerOrdenGrupalPorId(ordenId);
  
  if (!orden) {
    throw new Error('Orden no encontrada');
  }
  
  // Generar PDF
  const doc = new (await import('jspdf')).default();
  const anchoLinea = 190;
  
  // Título y encabezado
  doc.setFontSize(18);
  doc.text('UNIVERSIDAD MAYOR DE SAN SIMÓN', 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('ORDEN DE PAGO GRUPAL - OLIMPIADAS ACADÉMICAS 2025', 105, 30, { align: 'center' });
  
  // Información de la orden
  doc.setFontSize(12);
  doc.text(`Nº DE ORDEN: ${orden.id}`, 20, 45);
  doc.text(`FECHA DE EMISIÓN: ${new Date(orden.fecha).toLocaleDateString()}`, 20, 55);
  doc.text(`TUTOR: ${orden.tutor?.nombre || 'No especificado'}`, 20, 65);
  doc.text(`EMAIL: ${orden.tutor?.email || 'No especificado'}`, 20, 75);
  
  // Detalles de la orden
  doc.setFillColor(220, 220, 220);
  doc.rect(20, 85, anchoLinea, 10, 'F');
  doc.text('DETALLE DE LA ORDEN', 105, 92, { align: 'center' });
  
  // Tabla de estudiantes
  let yPos = 100;
  doc.setFontSize(10);
  doc.text('ESTUDIANTE', 20, yPos);
  doc.text('ÁREAS', 100, yPos);
  doc.text('SUBTOTAL', 180, yPos);
  
  yPos += 5;
  doc.line(20, yPos, 20 + anchoLinea, yPos);
  yPos += 10;
  
  // Lista de estudiantes
  orden.estudiantes?.forEach((estudiante, index) => {
    const nombre = `${estudiante.nombre} ${estudiante.apellido || ''}`;
    const areas = estudiante.areas?.length || 0;
    const subtotal = areas * (orden.precioPorArea || 16);
    
    doc.text(nombre, 20, yPos);
    doc.text(`${areas} área(s)`, 100, yPos);
    doc.text(`$${subtotal}`, 180, yPos);
    
    yPos += 10;
    
    // Agregar nueva página si es necesario
    if (yPos > 270 && index < orden.estudiantes.length - 1) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  // Línea final
  doc.line(20, yPos, 20 + anchoLinea, yPos);
  yPos += 10;
  
  // Total
  doc.setFontSize(12);
  doc.text(`TOTAL ESTUDIANTES: ${orden.cantidadEstudiantes || orden.estudiantes?.length || 0}`, 20, yPos);
  yPos += 10;
  doc.text(`TOTAL ÁREAS: ${orden.cantidadAreas || 0}`, 20, yPos);
  yPos += 10;
  doc.text(`MONTO TOTAL A PAGAR: $${orden.total}`, 20, yPos);
  
  // Instrucciones de pago
  yPos += 20;
  doc.setFontSize(11);
  doc.text('INSTRUCCIONES DE PAGO:', 20, yPos);
  yPos += 10;
  doc.setFontSize(10);
  doc.text(orden.instrucciones || 'Presentar esta orden en la oficina de tesorería de la UMSS.', 20, yPos);
  
  // Fecha de expiración
  yPos += 20;
  doc.text(`Esta orden expira el: ${new Date(orden.fechaExpiracion).toLocaleDateString()}`, 20, yPos);
  
  // Retornar como blob
  return doc.output('blob');
};
