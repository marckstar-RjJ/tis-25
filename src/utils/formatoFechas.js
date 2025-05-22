/**
 * Formatea una fecha en formato ISO a formato DD/MM/YYYY
 * @param {string} isoString - Fecha en formato ISO
 * @returns {string} - Fecha en formato DD/MM/YYYY
 */
export const formatearFecha = (isoString) => {
  if (!isoString) return '';
  
  const fecha = new Date(isoString);
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatea una fecha para su uso en inputs tipo 'date' (YYYY-MM-DD)
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const formatearFechaParaInput = (fecha) => {
  if (!fecha) return '';
  
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  return date.toISOString().split('T')[0];
};
