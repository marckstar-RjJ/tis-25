/**
 * Formatea una fecha en formato ISO a formato DD/MM/YYYY
 * @param {string} isoString - Fecha en formato ISO
 * @returns {string} - Fecha en formato DD/MM/YYYY
 */
export const formatearFecha = (isoString) => {
  if (!isoString) return '';
  
  // Parsear la fecha ISO string manualmente para evitar el ajuste de zona horaria
  const [year, month, day] = isoString.split('T')[0].split('-').map(Number);
  
  // Formatear manualmente para evitar problemas con zonas horarias
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
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
