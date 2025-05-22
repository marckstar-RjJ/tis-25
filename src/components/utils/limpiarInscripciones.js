/**
 * Utilidad para limpiar inscripciones incorrectas y duplicadas
 */

/**
 * Elimina las inscripciones de prueba generadas automáticamente
 * @returns {boolean} True si se eliminó alguna inscripción, false si no
 */
export const limpiarInscripcionesAutomaticas = () => {
  try {
    // Obtener estudiantes del localStorage
    const studentsJSON = localStorage.getItem('olimpiadas_students');
    if (!studentsJSON) return false;

    const students = JSON.parse(studentsJSON);
    let seRealizaronCambios = false;

    // Recorrer cada estudiante y eliminar inscripciones de prueba
    students.forEach(student => {
      // Verificar si el estudiante tiene inscripciones
      if (student.inscripciones && Array.isArray(student.inscripciones)) {
        // Filtrar para eliminar inscripciones con ID específico de prueba
        const inscripcionesOriginales = student.inscripciones.length;
        student.inscripciones = student.inscripciones.filter(inscripcion => 
          inscripcion.id !== 'inscripcion-cientifica-2025'
        );
        
        // Verificar si se eliminó alguna inscripción
        if (student.inscripciones.length < inscripcionesOriginales) {
          seRealizaronCambios = true;
        }
      }
    });

    // Guardar los cambios si se modificaron datos
    if (seRealizaronCambios) {
      localStorage.setItem('olimpiadas_students', JSON.stringify(students));
      console.log('Se eliminaron inscripciones automáticas');
    }

    return seRealizaronCambios;
  } catch (error) {
    console.error('Error al limpiar inscripciones automáticas:', error);
    return false;
  }
};

/**
 * Elimina inscripciones duplicadas para un mismo estudiante y convocatoria
 * @returns {boolean} True si se eliminaron duplicados, false si no
 */
export const eliminarInscripcionesDuplicadas = () => {
  try {
    // Obtener estudiantes del localStorage
    const studentsJSON = localStorage.getItem('olimpiadas_students');
    if (!studentsJSON) return false;

    const students = JSON.parse(studentsJSON);
    let seRealizaronCambios = false;

    // Recorrer cada estudiante y eliminar inscripciones duplicadas
    students.forEach(student => {
      // Verificar si el estudiante tiene inscripciones
      if (student.inscripciones && Array.isArray(student.inscripciones) && student.inscripciones.length > 1) {
        const inscripcionesOriginales = student.inscripciones.length;
        
        // Usar un Map para agrupar inscripciones por convocatoria
        const inscripcionesPorConvocatoria = new Map();
        
        // Procesar cada inscripción
        student.inscripciones.forEach(inscripcion => {
          const convocatoriaId = inscripcion.convocatoriaId;
          
          // Si ya tenemos una inscripción para esta convocatoria, nos quedamos con la más reciente
          if (inscripcionesPorConvocatoria.has(convocatoriaId)) {
            const inscripcionExistente = inscripcionesPorConvocatoria.get(convocatoriaId);
            const fechaExistente = new Date(inscripcionExistente.fechaInscripcion || 0);
            const fechaActual = new Date(inscripcion.fechaInscripcion || 0);
            
            // Quedarnos con la inscripción más reciente
            if (fechaActual > fechaExistente) {
              inscripcionesPorConvocatoria.set(convocatoriaId, inscripcion);
            }
          } else {
            // Primera inscripción para esta convocatoria
            inscripcionesPorConvocatoria.set(convocatoriaId, inscripcion);
          }
        });
        
        // Crear nuevo array con inscripciones únicas
        const inscripcionesUnicas = Array.from(inscripcionesPorConvocatoria.values());
        
        // Verificar si se eliminaron duplicados
        if (inscripcionesUnicas.length < inscripcionesOriginales) {
          student.inscripciones = inscripcionesUnicas;
          seRealizaronCambios = true;
          console.log(`Se eliminaron ${inscripcionesOriginales - inscripcionesUnicas.length} inscripciones duplicadas para el estudiante ${student.nombre} ${student.apellido || ''}`);
        }
      }
    });

    // Guardar los cambios si se modificaron datos
    if (seRealizaronCambios) {
      localStorage.setItem('olimpiadas_students', JSON.stringify(students));
      console.log('Se eliminaron inscripciones duplicadas');
    }

    return seRealizaronCambios;
  } catch (error) {
    console.error('Error al eliminar inscripciones duplicadas:', error);
    return false;
  }
};

/**
 * Sincroniza los datos antiguos (areasInscritas) con el nuevo formato de inscripciones
 * @returns {boolean} True si se realizaron cambios, false si no
 */
export const sincronizarFormatoInscripciones = () => {
  try {
    // Obtener estudiantes del localStorage
    const studentsJSON = localStorage.getItem('olimpiadas_students');
    if (!studentsJSON) return false;

    const students = JSON.parse(studentsJSON);
    let seRealizaronCambios = false;

    // Obtener convocatorias
    const convocatoriasJSON = localStorage.getItem('olimpiadas_convocatorias');
    const convocatorias = convocatoriasJSON ? JSON.parse(convocatoriasJSON) : [];
    const convocatoriaDefecto = convocatorias.find(c => c.activa) || convocatorias[0];

    // Obtener áreas
    const areasJSON = localStorage.getItem('olimpiadas_areas');
    const allAreas = areasJSON ? JSON.parse(areasJSON) : [];

    // Recorrer cada estudiante y sincronizar formatos
    students.forEach(student => {
      // Caso 1: Tiene formato antiguo (areasInscritas) pero no el nuevo (inscripciones)
      if (student.areasInscritas && student.areasInscritas.length > 0 && 
          (!student.inscripciones || student.inscripciones.length === 0)) {
        
        // Crear inscripción con formato nuevo
        const convocatoriaId = student.convocatoriaId || (convocatoriaDefecto ? convocatoriaDefecto.id : null);
        
        if (convocatoriaId) {
          const convocatoria = convocatorias.find(c => c.id === convocatoriaId) || convocatoriaDefecto;
          const areasSeleccionadas = allAreas.filter(area => student.areasInscritas.includes(area.id));
          
          const nuevaInscripcion = {
            id: `inscripcion-${convocatoriaId}-${Date.now()}`,
            convocatoriaId: convocatoriaId,
            fechaInscripcion: student.boletaPago?.fecha || new Date().toISOString(),
            areas: areasSeleccionadas,
            ordenPago: student.boletaPago || {
              id: `ORDEN-${Date.now()}`,
              fecha: new Date().toISOString(),
              estado: 'pendiente',
              total: (convocatoria.costo_por_area || 16) * areasSeleccionadas.length
            }
          };
          
          // Inicializar array de inscripciones si no existe
          if (!student.inscripciones) {
            student.inscripciones = [];
          }
          
          // Agregar la nueva inscripción
          student.inscripciones.push(nuevaInscripcion);
          seRealizaronCambios = true;
        }
      }
    });

    // Guardar los cambios si se modificaron datos
    if (seRealizaronCambios) {
      localStorage.setItem('olimpiadas_students', JSON.stringify(students));
      console.log('Se sincronizaron formatos de inscripción');
    }

    return seRealizaronCambios;
  } catch (error) {
    console.error('Error al sincronizar formatos de inscripción:', error);
    return false;
  }
};

/**
 * Función principal para limpiar datos incorrectos
 */
export const limpiarDatosIncorrectos = () => {
  // Ejecutar todas las funciones de limpieza en secuencia
  const resultadoAutomaticas = limpiarInscripcionesAutomaticas();
  const resultadoDuplicadas = eliminarInscripcionesDuplicadas();
  const resultadoSincronizacion = sincronizarFormatoInscripciones();
  
  // Eliminar duplicados una vez más después de la sincronización
  const resultadoFinal = resultadoSincronizacion ? eliminarInscripcionesDuplicadas() : false;
  
  return resultadoAutomaticas || resultadoDuplicadas || resultadoSincronizacion || resultadoFinal;
};
