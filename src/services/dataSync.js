/**
 * Servicio para sincronizar datos entre localStorage y sesiones de usuario
 * Este servicio asegura que los cambios realizados por un usuario (administrador)
 * sean visibles para otros usuarios (estudiantes) incluso cuando los cambios
 * no se guardan correctamente en el backend.
 */

// Clave para guardar el timestamp de la última actualización
const LAST_UPDATE_KEY = 'olimpiadas_last_update';

// Función para actualizar el timestamp de última modificación
export const updateLastModified = () => {
  localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
};

// Función para obtener el timestamp de última modificación
export const getLastModified = () => {
  return localStorage.getItem(LAST_UPDATE_KEY) || '0';
};

// Función para sincronizar convocatorias
export const syncConvocatorias = (convocatorias) => {
  if (!convocatorias || !Array.isArray(convocatorias)) {
    console.error('Error al sincronizar convocatorias: datos inválidos', convocatorias);
    return;
  }
  
  try {
    // Guardar convocatorias en localStorage
    localStorage.setItem('olimpiadas_convocatorias', JSON.stringify(convocatorias));
    // Actualizar timestamp
    updateLastModified();
    console.log('Convocatorias sincronizadas correctamente:', convocatorias.length);
  } catch (error) {
    console.error('Error al sincronizar convocatorias:', error);
  }
};

// Función para cargar convocatorias, priorizando localStorage para asegurar consistencia
export const loadConvocatorias = () => {
  try {
    const convocatorias = JSON.parse(localStorage.getItem('olimpiadas_convocatorias') || '[]');
    console.log('Convocatorias cargadas desde localStorage:', convocatorias.length);
    return convocatorias;
  } catch (error) {
    console.error('Error al cargar convocatorias:', error);
    return [];
  }
};

// Función para filtrar convocatorias activas y con fechas válidas para estudiantes
export const getConvocatoriasActivas = () => {
  const convocatorias = loadConvocatorias();
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día
  
  // Filtrar convocatorias activas y dentro del período de inscripciones
  return convocatorias.filter(convocatoria => {
    // Verificar que la convocatoria esté activa
    if (!convocatoria.activa) return false;
    
    // Convertir fechas a objetos Date
    const fechaInicio = new Date(convocatoria.fecha_inicio_inscripciones);
    const fechaFin = new Date(convocatoria.fecha_fin_inscripciones);
    
    // Verificar que la fecha actual esté dentro del período de inscripciones
    return fechaInicio <= hoy && fechaFin >= hoy;
  });
};

// Función para actualizar una convocatoria específica
export const updateConvocatoria = (convocatoriaId, datosActualizados) => {
  try {
    // Cargar convocatorias actuales
    const convocatorias = loadConvocatorias();
    
    // Encontrar índice de la convocatoria a actualizar
    const index = convocatorias.findIndex(c => c.id === convocatoriaId);
    
    if (index >= 0) {
      // Actualizar convocatoria existente
      convocatorias[index] = {
        ...convocatorias[index],
        ...datosActualizados,
        fecha_actualizacion: new Date().toISOString()
      };
    } else {
      // Si no existe, agregar como nueva
      convocatorias.push({
        id: convocatoriaId,
        ...datosActualizados,
        fecha_creacion: new Date().toISOString()
      });
    }
    
    // Guardar cambios
    syncConvocatorias(convocatorias);
    
    return true;
  } catch (error) {
    console.error('Error al actualizar convocatoria:', error);
    return false;
  }
};

// Objeto de exportación principal
export const dataSync = {
  updateLastModified,
  getLastModified,
  syncConvocatorias,
  loadConvocatorias,
  getConvocatoriasActivas,
  updateConvocatoria
};
