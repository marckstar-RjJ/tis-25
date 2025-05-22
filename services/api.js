// Simulación de base de datos local en localStorage
const USERS_KEY = 'olimpiadas_users';
const STUDENTS_KEY = 'olimpiadas_students';
const COLLEGES_KEY = 'olimpiadas_colleges';
const OLYMPIAD_CONFIG_KEY = 'olimpiadas_config';
const AREAS_KEY = 'olimpiadas_areas';
const CONVOCATORIAS_KEY = 'olimpiadas_convocatorias';

// Inicializar colegios habilitados y configuración de olimpiadas
const initializeSystem = () => {
  initializeColleges();
  initializeOlympiadConfig();
  initializeAreas();
  initializeConvocatorias();
};

// Inicializar colegios si no existen
const initializeColleges = () => {
  const colleges = getColleges();
  if (colleges.length === 0) {
    const defaultColleges = [
      { id: '1', nombre: 'Instituto Eduardo Laredo' },
      { id: '2', nombre: 'Colegio Gualberto Villaroel' },
      { id: '3', nombre: 'Colegio Loyola' },
      { id: '4', nombre: 'Colegio Aleman Federico Froebel' },
      { id: '5', nombre: 'Colegio La Salle' },
      { id: '6', nombre: 'Colegio Don Bosco' },
      { id: '7', nombre: 'Colegio San Agustin' }
    ];
    
    saveColleges(defaultColleges);
  }
};

// Inicializar configuración de olimpiadas si no existe
const initializeOlympiadConfig = () => {
  const config = getOlympiadConfig();
  if (!config) {
    const defaultConfig = {
      fechaInicio: new Date(new Date().getFullYear(), 5, 1).toISOString(), // 1 de junio del año actual
      fechaFin: new Date(new Date().getFullYear(), 7, 31).toISOString(), // 31 de agosto del año actual
      precioPorArea: 16,
      maxAreasEstudiante: 2
    };
    
    saveOlympiadConfig(defaultConfig);
  }
};

// Inicializar áreas académicas si no existen
const initializeAreas = () => {
  const areas = getAreas();
  if (areas.length === 0) {
    const defaultAreas = [
      { id: '1', nombre: 'Matemática', descripcion: 'Olimpiada de Matemática' },
      { id: '2', nombre: 'Física', descripcion: 'Olimpiada de Física' },
      { id: '3', nombre: 'Química', descripcion: 'Olimpiada de Química' },
      { id: '4', nombre: 'Astronomía', descripcion: 'Olimpiada de Astronomía' },
      { id: '5', nombre: 'Informática', descripcion: 'Olimpiada de Informática' },
      { id: '6', nombre: 'Biología', descripcion: 'Olimpiada de Biología' },
      { id: '7', nombre: 'Robótica', descripcion: 'Olimpiada de Robótica' }
    ];
    
    saveAreas(defaultAreas);
  }
};

// Inicializar convocatorias (se define en otra parte del código)

// Obtener todos los usuarios
const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Guardar usuarios en localStorage
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Obtener todos los estudiantes
const getStudents = () => {
  const students = localStorage.getItem(STUDENTS_KEY);
  return students ? JSON.parse(students) : [];
};

// Guardar estudiantes en localStorage
const saveStudents = (students) => {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

// Obtener todos los colegios
const getColleges = () => {
  const colleges = localStorage.getItem(COLLEGES_KEY);
  return colleges ? JSON.parse(colleges) : [];
};

// Guardar colegios en localStorage
const saveColleges = (colleges) => {
  localStorage.setItem(COLLEGES_KEY, JSON.stringify(colleges));
};

// Obtener configuración de olimpiadas
const getOlympiadConfig = () => {
  const config = localStorage.getItem(OLYMPIAD_CONFIG_KEY);
  return config ? JSON.parse(config) : null;
};

// Guardar configuración de olimpiadas
const saveOlympiadConfig = (config) => {
  localStorage.setItem(OLYMPIAD_CONFIG_KEY, JSON.stringify(config));
};

// Las funciones getConvocatorias, saveConvocatorias y getConvocatoriaById están definidas más adelante

// Obtener todas las áreas
const getAreas = () => {
  const areas = localStorage.getItem(AREAS_KEY);
  return areas ? JSON.parse(areas) : [];
};

// Guardar áreas en localStorage
const saveAreas = (areas) => {
  localStorage.setItem(AREAS_KEY, JSON.stringify(areas));
};

// Crear un nuevo área
const createArea = (areaData) => {
  return new Promise((resolve, reject) => {
    try {
      const areas = getAreas();
      const newArea = {
        id: Date.now().toString(),
        ...areaData,
        createdAt: new Date().toISOString()
      };
      areas.push(newArea);
      saveAreas(areas);
      resolve(newArea);
    } catch (error) {
      reject({ message: 'Error al crear área', error });
    }
  });
};

// Esta función se definirá más abajo

// Crear un nuevo usuario
const createUser = (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const users = getUsers();
        
        // Verificar si el email ya existe
        const existingUser = users.find(user => user.email === userData.email);
        if (existingUser) {
          reject({ message: 'El email ya está registrado' });
          return;
        }
        
        // Asegurarnos que tipoUsuario esté establecido correctamente
        if (!userData.tipoUsuario || !['estudiante', 'tutor', 'administrador'].includes(userData.tipoUsuario)) {
          reject({ message: 'Tipo de usuario no válido' });
          return;
        }
        
        // Crear un nuevo usuario con ID único
        const newUser = {
          id: Date.now().toString(),
          ...userData,
          createdAt: new Date().toISOString()
        };
        
        // Si es estudiante, también guardarlo en la colección de estudiantes
        if (userData.tipoUsuario === 'estudiante') {
          // Verificar que el colegio exista si se proporciona
          if (userData.colegio) {
            const colleges = getColleges();
            const college = colleges.find(college => college.id === userData.colegio);
            
            if (!college) {
              reject({ message: 'El colegio seleccionado no existe' });
              return;
            }
            
            // Asociar el objeto colegio completo
            newUser.colegio = college;
          }
          
          // Guardar en usuarios
          users.push(newUser);
          saveUsers(users);
          
          // Guardar en estudiantes
          const students = getStudents();
          const newStudent = {
            ...newUser,
            areasInscritas: []
          };
          students.push(newStudent);
          saveStudents(students);
          
          resolve(newUser);
        }
        // Si es administrador, guardar directamente
        else if (userData.tipoUsuario === 'administrador') {
          users.push(newUser);
          saveUsers(users);
          resolve(newUser);
        }
        // Si es tutor, verificar que el colegio exista
        else if (userData.tipoUsuario === 'tutor') {
          const colleges = getColleges();
          const college = colleges.find(college => college.id === userData.colegio);
          
          if (!college) {
            reject({ message: 'El colegio seleccionado no existe' });
            return;
          }
          
          // Asociar el objeto colegio completo
          newUser.colegio = college;
          
          users.push(newUser);
          saveUsers(users);
          resolve(newUser);
        }
      } catch (error) {
        reject({ message: 'Error al crear el usuario', error });
      }
    }, 800); // Simulando retraso de red
  });
};

// Iniciar sesión
const login = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Inicializar sistema (colegios y configuración)
        initializeSystem();
        
        const users = getUsers();
        const user = users.find(
          user => user.email === email && user.password === password
        );
        
        if (user) {
          // No enviar la contraseña al cliente
          const { password, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } else {
          reject({ message: 'Credenciales incorrectas' });
        }
      } catch (error) {
        reject({ message: 'Error al iniciar sesión', error });
      }
    }, 800);
  });
};

// Obtener usuario por ID
const getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const users = getUsers();
        const user = users.find(user => user.id === userId);
        
        if (user) {
          // No enviar la contraseña al cliente
          const { password, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } else {
          reject({ message: 'Usuario no encontrado' });
        }
      } catch (error) {
        reject({ message: 'Error al obtener usuario', error });
      }
    }, 500);
  });
};

// Obtener estudiante por ID
const getStudentById = (studentId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const students = getStudents();
        const student = students.find(student => student.id === studentId);
        
        if (student) {
          resolve(student);
        } else {
          reject({ message: 'Estudiante no encontrado' });
        }
      } catch (error) {
        reject({ message: 'Error al obtener estudiante', error });
      }
    }, 500);
  });
};

// Registrar estudiante como tutor
const registerStudentByTutor = (tutorId, studentData) => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const users = getUsers();
        const tutor = users.find(user => user.id === tutorId && user.tipoUsuario === 'tutor');
        
        if (!tutor) {
          reject({ message: 'Tutor no encontrado o no válido' });
          return;
        }
        
        // Crear un nuevo estudiante con ID único
        const newStudent = {
          id: Date.now().toString(),
          ...studentData,
          tutorId: tutorId,
          tipoUsuario: 'estudiante',
          areasInscritas: [],
          createdAt: new Date().toISOString()
        };
        
        // Guardar en colección de estudiantes
        const students = getStudents();
        students.push(newStudent);
        saveStudents(students);
        
        // También guardar como usuario si se proporcionó email y contraseña
        if (studentData.email && studentData.password) {
          users.push(newStudent);
          saveUsers(users);
        }
        
        resolve(newStudent);
      } catch (error) {
        reject({ message: 'Error al registrar estudiante', error });
      }
    }, 800);
  });
};

// Obtener estudiantes por tutor
const getStudentsByTutor = (tutorId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const students = getStudents();
        const tutorStudents = students.filter(student => student.tutorId === tutorId);
        resolve(tutorStudents);
      } catch (error) {
        reject({ message: 'Error al obtener estudiantes del tutor', error });
      }
    }, 500);
  });
};

// Obtener todos los colegios disponibles
const getAllColleges = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        initializeColleges(); // Asegurar que hay colegios
        const colleges = getColleges();
        resolve(colleges);
      } catch (error) {
        reject({ message: 'Error al obtener colegios', error });
      }
    }, 300);
  });
};

// Añadir un nuevo colegio (solo admin)
const addCollege = (collegeName) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const colleges = getColleges();
        
        // Verificar si ya existe
        if (colleges.some(college => college.nombre.toLowerCase() === collegeName.toLowerCase())) {
          reject({ message: 'Este colegio ya está registrado' });
          return;
        }
        
        const newCollege = {
          id: Date.now().toString(),
          nombre: collegeName
        };
        
        colleges.push(newCollege);
        saveColleges(colleges);
        resolve(newCollege);
      } catch (error) {
        reject({ message: 'Error al añadir colegio', error });
      }
    }, 500);
  });
};

// Inscribir estudiante en áreas
const inscribirEstudianteEnAreas = (studentId, inscripcionData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Compatibilidad con versiones anteriores del API
        let areaIds;
        let convocatoriaId;
        
        if (typeof inscripcionData === 'object' && inscripcionData !== null) {
          if (Array.isArray(inscripcionData)) {
            // Formato antiguo: array de IDs de áreas
            areaIds = inscripcionData;
            convocatoriaId = null;
          } else {
            // Formato nuevo: objeto con areaIds y convocatoriaId
            areaIds = inscripcionData.areaIds;
            convocatoriaId = inscripcionData.convocatoriaId;
          }
        } else {
          reject({ message: 'Formato de datos inválido' });
          return;
        }
        
        if (!areaIds || !Array.isArray(areaIds)) {
          reject({ message: 'Se requiere una lista de áreas para la inscripción' });
          return;
        }
        
        const students = getStudents();
        const studentIndex = students.findIndex(student => student.id === studentId);
        
        if (studentIndex === -1) {
          reject({ message: 'Estudiante no encontrado' });
          return;
        }
        
        // Determinar la configuración a usar (convocatoria o configuración global)
        let configInscripcion;
        
        if (convocatoriaId) {
          // En una implementación real, aquí buscaríamos la convocatoria en la API
          // Por ahora, simularemos los datos de la convocatoria seleccionada
          configInscripcion = {
            id: convocatoriaId,
            nombre: 'Olimpiada ' + convocatoriaId,  // En producción vendría de la API
            maxAreasEstudiante: 2,
            precioPorArea: 16
          };
        } else {
          // Si no hay convocatoria específica, usar la configuración global
          const config = getOlympiadConfig();
          configInscripcion = {
            id: 'default',
            nombre: 'Olimpiadas oh sansi!',
            maxAreasEstudiante: config.maxAreasEstudiante,
            precioPorArea: config.precioPorArea
          };
        }
        
        // Validar máximo de áreas según la configuración
        if (areaIds.length > configInscripcion.maxAreasEstudiante) {
          reject({ message: `No puedes inscribir al estudiante en más de ${configInscripcion.maxAreasEstudiante} áreas` });
          return;
        }
        
        // Actualizar datos del estudiante
        students[studentIndex].areasInscritas = areaIds;
        students[studentIndex].convocatoriaId = convocatoriaId || 'default';
        
        // Generar orden de pago
        const ordenDePago = {
          id: `OP-${Date.now()}`,
          estudianteId: studentId,
          convocatoriaId: configInscripcion.id,
          convocatoriaNombre: configInscripcion.nombre,
          nombreEstudiante: `${students[studentIndex].nombre} ${students[studentIndex].apellido}`,
          fecha: new Date().toISOString(),
          areas: areaIds.map(areaId => {
            const area = getAreas().find(a => a.id === areaId);
            return area ? area.nombre : 'Área Desconocida';
          }),
          cantidadAreas: areaIds.length,
          montoPorArea: configInscripcion.precioPorArea,
          montoTotal: areaIds.length * configInscripcion.precioPorArea,
          estado: 'Pendiente',
          fechaVencimiento: new Date(Date.now() + 2*24*60*60*1000).toISOString() // 48 horas
        };
        
        // Almacenar la orden de pago
        if (!students[studentIndex].ordenesDePago) {
          students[studentIndex].ordenesDePago = [];
        }
        students[studentIndex].ordenesDePago.push(ordenDePago);
        saveStudents(students);
        
        resolve({
          student: students[studentIndex],
          ordenDePago
        });
      } catch (error) {
        reject({ message: 'Error al inscribir al estudiante en las áreas seleccionadas', error });
      }
    }, 800);
  });
};

// Obtener configuración de olimpiadas
const getOlympiadSettings = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        initializeOlympiadConfig(); // Asegurar que existe configuración
        const config = getOlympiadConfig();
        resolve(config);
      } catch (error) {
        reject({ message: 'Error al obtener configuración de olimpiadas', error });
      }
    }, 300);
  });
};

// Actualizar configuración de olimpiadas (solo admin)
const updateOlympiadSettings = (newConfig) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const currentConfig = getOlympiadConfig();
        const updatedConfig = { ...currentConfig, ...newConfig };
        saveOlympiadConfig(updatedConfig);
        resolve(updatedConfig);
      } catch (error) {
        reject({ message: 'Error al actualizar configuración', error });
      }
    }, 500);
  });
};

// Actualizar áreas de estudiante
const updateStudentAreas = (studentId, areas) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const students = getStudents();
        const studentIndex = students.findIndex(student => student.id === studentId);
        
        if (studentIndex === -1) {
          reject({ message: 'Estudiante no encontrado' });
          return;
        }
        
        // Obtener configuración para validar máximo de áreas
        const config = getOlympiadConfig();
        if (areas.length > config.maxAreasEstudiante) {
          reject({ message: `No puedes inscribir al estudiante en más de ${config.maxAreasEstudiante} áreas` });
          return;
        }
        
        // Actualizar áreas inscritas
        students[studentIndex].areasInscritas = areas;
        saveStudents(students);
        
        resolve(students[studentIndex]);
      } catch (error) {
        reject({ message: 'Error al actualizar áreas del estudiante', error });
      }
    }, 800);
  });
};

// Obtener todas las áreas
const getAllAreas = () => {
  return new Promise((resolve, reject) => {
    try {
      // Simulamos una llamada a la API con un pequeño retardo
      setTimeout(() => {
        const areas = getAreas();
        resolve(areas);
      }, 300);
    } catch (error) {
      console.error('Error al obtener áreas:', error);
      reject({ message: 'Error al obtener áreas', error });
    }
  });
};

// Obtener configuración de olimpiadas para el cliente
const fetchOlympiadConfig = () => {
  return getOlympiadSettings();
};

// Obtener datos del estudiante actual
const getCurrentStudent = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Obtener el usuario actual desde localStorage
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          reject({ message: 'No hay ningún usuario autenticado' });
          return;
        }

        const currentUser = JSON.parse(currentUserStr);
        
        // Verificar que sea un estudiante
        if (currentUser.tipoUsuario !== 'estudiante') {
          reject({ message: 'El usuario actual no es un estudiante' });
          return;
        }

        // Buscar los datos completos del estudiante
        const students = getStudents();
        const student = students.find(student => student.id === currentUser.id);
        
        if (!student) {
          reject({ message: 'No se encontraron datos del estudiante' });
          return;
        }
        
        resolve(student);
      } catch (error) {
        reject({ message: 'Error al obtener datos del estudiante actual', error });
      }
    }, 500);
  });
};

// La clave CONVOCATORIAS_KEY ya está definida arriba

// Obtener convocatorias del localStorage
const getConvocatorias = () => {
  const convocatorias = localStorage.getItem(CONVOCATORIAS_KEY);
  return convocatorias ? JSON.parse(convocatorias) : [];
};

// Guardar convocatorias en localStorage
const saveConvocatorias = (convocatorias) => {
  localStorage.setItem(CONVOCATORIAS_KEY, JSON.stringify(convocatorias));
};

// Inicializar convocatorias de ejemplo si no existen
const initializeConvocatorias = () => {
  const convocatorias = getConvocatorias();
  if (convocatorias.length === 0) {
    const areas = getAreas();
    const areasIds = areas.map(area => area.id);
    
    const defaultConvocatorias = [
      {
        id: '1',
        nombre: 'Olimpiadas Académicas 2025',
        fecha_inicio_inscripciones: new Date(2025, 3, 1).toISOString(), // 1 de Abril 2025
        fecha_fin_inscripciones: new Date(2025, 4, 15).toISOString(), // 15 de Mayo 2025
        costo_por_area: 16.00,
        maximo_areas: 2,
        activa: true,
        areas: areas
      },
      {
        id: '2',
        nombre: 'Olimpiadas Escolares 2024',
        fecha_inicio_inscripciones: new Date(2024, 2, 15).toISOString(), // 15 de Marzo 2024
        fecha_fin_inscripciones: new Date(2024, 3, 30).toISOString(), // 30 de Abril 2024
        costo_por_area: 14.00,
        maximo_areas: 2,
        activa: false,
        areas: areas.filter((_, index) => index % 2 === 0) // Solo áreas pares para este ejemplo
      }
    ];
    
    saveConvocatorias(defaultConvocatorias);
  }
};

// Llamamos a la inicialización de convocatorias
initializeConvocatorias();

// Obtener todas las convocatorias (solo para administradores)
const getAllConvocatorias = () => {
  return new Promise((resolve, reject) => {
    try {
      // Forzamos la inicialización de convocatorias
      if (typeof initializeConvocatorias === 'function') {
        initializeConvocatorias();
      }
      
      // Simulamos una pequeña demora para simular una llamada a la API
      setTimeout(() => {
        try {
          const convocatorias = getConvocatorias();
          console.log("Convocatorias disponibles:", convocatorias);
          
          // Aseguramos que siempre haya al menos una convocatoria por defecto
          if (!convocatorias || convocatorias.length === 0) {
            const currentYear = new Date().getFullYear();
            const defaultConvocatoria = { 
              id: '1', 
              nombre: `Olimpiadas Escolares ${currentYear} - Primera Fase`, 
              fecha_inicio_inscripciones: new Date(currentYear, 4, 1).toISOString(),
              fecha_fin_inscripciones: new Date(currentYear, 5, 30).toISOString(),
              costo_por_area: 16,
              maximo_areas: 2,
              activa: true,
              areas: getAreas()
            };
            
            // Guardar la convocatoria por defecto
            const nuevoArray = [defaultConvocatoria];
            saveConvocatorias(nuevoArray);
            resolve(nuevoArray);
          } else {
            resolve(convocatorias);
          }
        } catch (innerError) {
          console.error("Error interno al obtener convocatorias:", innerError);
          reject({ message: 'Error interno al obtener convocatorias', error: innerError });
        }
      }, 500);
    } catch (error) {
      console.error('Error al obtener convocatorias:', error);
      reject({ message: 'Error al obtener convocatorias', error });
    }
  });
};

// Obtener convocatorias abiertas (públicas)
const getConvocatoriasAbiertas = () => {
  return new Promise((resolve, reject) => {
    try {
      // Simulamos una pequeña demora para simular una llamada a la API
      setTimeout(() => {
        const convocatorias = getConvocatorias();
        // Filtramos solo las convocatorias activas y con fechas vigentes
        const fechaActual = new Date();
        const convocatoriasAbiertas = convocatorias.filter(conv => {
          const fechaInicio = new Date(conv.fecha_inicio_inscripciones);
          const fechaFin = new Date(conv.fecha_fin_inscripciones);
          return conv.activa && fechaActual >= fechaInicio && fechaActual <= fechaFin;
        });
        resolve(convocatoriasAbiertas);
      }, 300);
    } catch (error) {
      console.error('Error al obtener convocatorias abiertas:', error);
      reject({ message: 'Error al obtener convocatorias abiertas', error });
    }
  });
};

// Obtener una convocatoria específica
const getConvocatoriaById = (id) => {
  return new Promise((resolve, reject) => {
    try {
      // Simulamos una pequeña demora para simular una llamada a la API
      setTimeout(() => {
        const convocatorias = getConvocatorias();
        const convocatoria = convocatorias.find(c => c.id === id);
        
        if (!convocatoria) {
          reject({ message: `No se encontró la convocatoria con ID ${id}` });
          return;
        }
        
        // Asegurémonos de incluir las áreas completas, no solo IDs
        const areasCompletas = getAreas().filter(area => convocatoria.areas.some(a => a.id === area.id || a === area.id));
        
        // Crear una copia con áreas completas
        const convocatoriaConAreas = {
          ...convocatoria,
          areas: areasCompletas
        };
        
        resolve(convocatoriaConAreas);
      }, 300);
    } catch (error) {
      console.error(`Error al obtener convocatoria ${id}:`, error);
      reject({ message: `Error al obtener convocatoria ${id}`, error });
    }
  });
};

// Crear una nueva convocatoria (solo administrador)
const crearConvocatoria = (convocatoriaData) => {
  return new Promise((resolve, reject) => {
    try {
      // Validar datos mínimos
      if (!convocatoriaData.nombre || convocatoriaData.nombre.trim() === '') {
        reject({ message: 'El nombre de la convocatoria es requerido' });
        return;
      }
      
      if (!convocatoriaData.fecha_inicio_inscripciones || !convocatoriaData.fecha_fin_inscripciones) {
        reject({ message: 'Las fechas de inicio y fin son requeridas' });
        return;
      }
      
      // Simulamos una pequeña demora para simular una llamada a la API
      setTimeout(() => {
        const convocatorias = getConvocatorias();
        
        // Generar ID único
        const nuevoId = convocatorias.length > 0 ?
          (Math.max(...convocatorias.map(c => parseInt(c.id, 10))) + 1).toString() :
          '1';
        
        // Si las áreas vienen como IDs, obtenemos los objetos completos
        let areasSeleccionadas = [];
        if (Array.isArray(convocatoriaData.areas)) {
          const todasLasAreas = getAreas();
          areasSeleccionadas = convocatoriaData.areas.map(areaId => {
            const area = todasLasAreas.find(a => a.id === areaId || a.id === areaId.toString());
            return area || { id: areaId };
          });
        }
        
        // Crear nueva convocatoria
        const nuevaConvocatoria = {
          id: nuevoId,
          nombre: convocatoriaData.nombre.trim(),
          fecha_inicio_inscripciones: convocatoriaData.fecha_inicio_inscripciones,
          fecha_fin_inscripciones: convocatoriaData.fecha_fin_inscripciones,
          costo_por_area: parseFloat(convocatoriaData.costo_por_area) || 16.00,
          maximo_areas: parseInt(convocatoriaData.maximo_areas, 10) || 2,
          activa: convocatoriaData.activa === undefined ? true : convocatoriaData.activa,
          areas: areasSeleccionadas
        };
        
        // Guardar en localStorage
        const convocatoriasActualizadas = [...convocatorias, nuevaConvocatoria];
        saveConvocatorias(convocatoriasActualizadas);
        
        resolve(nuevaConvocatoria);
      }, 500);
    } catch (error) {
      console.error('Error al crear convocatoria:', error);
      reject({ message: 'Error al crear convocatoria', error });
    }
  });
};

// Actualizar una convocatoria (solo administrador)
const actualizarConvocatoria = (id, convocatoriaData) => {
  return new Promise((resolve, reject) => {
    try {
      // Validar datos mínimos
      if (!convocatoriaData.nombre || convocatoriaData.nombre.trim() === '') {
        reject({ message: 'El nombre de la convocatoria es requerido' });
        return;
      }
      
      // Simulamos una pequeña demora para simular una llamada a la API
      setTimeout(() => {
        const convocatorias = getConvocatorias();
        const index = convocatorias.findIndex(c => c.id === id);
        
        if (index === -1) {
          reject({ message: `No se encontró la convocatoria con ID ${id}` });
          return;
        }
        
        // Si las áreas vienen como IDs, obtenemos los objetos completos
        let areasSeleccionadas = [];
        if (Array.isArray(convocatoriaData.areas)) {
          const todasLasAreas = getAreas();
          areasSeleccionadas = convocatoriaData.areas.map(areaId => {
            const area = todasLasAreas.find(a => a.id === areaId || a.id === areaId.toString());
            return area || { id: areaId };
          });
        } else {
          // Mantener las áreas actuales si no se especifican nuevas
          areasSeleccionadas = convocatorias[index].areas;
        }
        
        // Actualizar la convocatoria
        const convocatoriaActualizada = {
          ...convocatorias[index],
          nombre: convocatoriaData.nombre.trim(),
          fecha_inicio_inscripciones: convocatoriaData.fecha_inicio_inscripciones || convocatorias[index].fecha_inicio_inscripciones,
          fecha_fin_inscripciones: convocatoriaData.fecha_fin_inscripciones || convocatorias[index].fecha_fin_inscripciones,
          costo_por_area: parseFloat(convocatoriaData.costo_por_area) || convocatorias[index].costo_por_area,
          maximo_areas: parseInt(convocatoriaData.maximo_areas, 10) || convocatorias[index].maximo_areas,
          activa: convocatoriaData.activa === undefined ? convocatorias[index].activa : convocatoriaData.activa,
          areas: areasSeleccionadas
        };
        
        // Actualizar en localStorage
        convocatorias[index] = convocatoriaActualizada;
        saveConvocatorias(convocatorias);
        
        resolve(convocatoriaActualizada);
      }, 500);
    } catch (error) {
      console.error(`Error al actualizar convocatoria ${id}:`, error);
      reject({ message: `Error al actualizar convocatoria ${id}`, error });
    }
  });
};

// Eliminar una convocatoria (solo administrador)
const eliminarConvocatoria = (id) => {
  return new Promise((resolve, reject) => {
    try {
      // Simulamos una pequeña demora para simular una llamada a la API
      setTimeout(() => {
        const convocatorias = getConvocatorias();
        const index = convocatorias.findIndex(c => c.id === id);
        
        if (index === -1) {
          reject({ message: `No se encontró la convocatoria con ID ${id}` });
          return;
        }
        
        // Eliminar la convocatoria
        const convocatoriaEliminada = convocatorias[index];
        convocatorias.splice(index, 1);
        
        // Actualizar localStorage
        saveConvocatorias(convocatorias);
        
        resolve({ message: `Convocatoria ${id} eliminada con éxito`, convocatoria: convocatoriaEliminada });
      }, 300);
    } catch (error) {
      console.error(`Error al eliminar convocatoria ${id}:`, error);
      reject({ message: `Error al eliminar convocatoria ${id}`, error });
    }
  });
};

// Actualizar áreas de una convocatoria (solo administrador)
const actualizarAreasConvocatoria = (id, areasIds) => {
  return new Promise((resolve, reject) => {
    try {
      // Simulamos una pequeña demora para simular una llamada a la API
      setTimeout(() => {
        const convocatorias = getConvocatorias();
        const index = convocatorias.findIndex(c => c.id === id);
        
        if (index === -1) {
          reject({ message: `No se encontró la convocatoria con ID ${id}` });
          return;
        }
        
        if (!Array.isArray(areasIds)) {
          reject({ message: 'La lista de áreas debe ser un array' });
          return;
        }
        
        // Obtener todas las áreas disponibles para verificar que los IDs existan
        const todasLasAreas = getAreas();
        const areasSeleccionadas = areasIds.map(areaId => {
          const area = todasLasAreas.find(a => a.id === areaId || a.id === areaId.toString());
          return area || { id: areaId };
        });
        
        // Actualizar la convocatoria con las nuevas áreas
        const convocatoriaActualizada = {
          ...convocatorias[index],
          areas: areasSeleccionadas
        };
        
        // Actualizar en localStorage
        convocatorias[index] = convocatoriaActualizada;
        saveConvocatorias(convocatorias);
        
        resolve(convocatoriaActualizada);
      }, 400);
    } catch (error) {
      console.error(`Error al actualizar áreas de convocatoria ${id}:`, error);
      reject({ message: `Error al actualizar áreas de convocatoria ${id}`, error });
    }
  });
};

// Crear una nueva área (solo administrador)
const crearArea = (areaDatos) => {
  return new Promise((resolve, reject) => {
    // Validar los datos mínimos necesarios
    if (!areaDatos.nombre || areaDatos.nombre.trim() === '') {
      reject({ message: 'El nombre del área es requerido.' });
      return;
    }
    
    try {
      // Simular una llamada a la API para almacenar la nueva área
      setTimeout(() => {
        // Obtener la lista actual de áreas
        let areas = getAreas();
        if (!Array.isArray(areas)) areas = [];
        
        // Generar un ID único
        let nuevoId = 1;
        if (areas.length > 0) {
          const ids = areas.map(a => parseInt(a.id, 10)).filter(id => !isNaN(id));
          if (ids.length > 0) {
            nuevoId = Math.max(...ids) + 1;
          }
        }
        
        // Crear el objeto de la nueva área
        const nuevaArea = {
          id: nuevoId.toString(),
          nombre: areaDatos.nombre.trim(),
          descripcion: areaDatos.descripcion?.trim() || `Olimpiada de ${areaDatos.nombre.trim()}`
        };
        
        // Guardar en localStorage
        const areasActualizadas = [...areas, nuevaArea];
        saveAreas(areasActualizadas);
        
        console.log("Área creada con éxito:", nuevaArea);
        resolve(nuevaArea);
      }, 500); // Simular un pequeño retardo de red
    } catch (error) {
      console.error("Error al crear área:", error);
      reject({ message: 'Error al crear área. Por favor, intente nuevamente.' });
    }
  });
};

// Exportar servicios
export const apiService = {
  createUser,
  login,
  getUserById,
  getStudentById,
  registerStudentByTutor,
  getStudentsByTutor,
  getAllColleges,
  addCollege,
  inscribirEstudianteEnAreas,
  updateStudentAreas,
  getAllAreas,
  getStudentAreas,
  getAreasForStudent,
  
    // Métodos para convocatorias
  getAllConvocatorias,
  getConvocatoriasAbiertas,
  
  getOlympiadConfigById: (convocatoriaId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          console.log('Buscando convocatoria con ID:', convocatoriaId);
          const convocatorias = getConvocatorias();
          console.log('Total de convocatorias disponibles:', convocatorias.length);
          
          // Si no hay convocatorias, intentar inicializarlas
          if (!convocatorias || convocatorias.length === 0) {
            if (typeof initializeConvocatorias === 'function') {
              console.log('Intentando inicializar convocatorias...');
              initializeConvocatorias();
            }
          }
          
          // Buscar la convocatoria por ID
          const convocatoria = getConvocatorias().find(c => c.id === convocatoriaId);
          console.log('Convocatoria encontrada:', convocatoria);
          
          if (convocatoria) {
            // Adaptar el formato de los campos para que coincida con lo que espera el componente
            const config = {
              id: convocatoria.id,
              nombre: convocatoria.nombre,
              // Compatibilidad con ambos formatos de nombres de campos
              fechaInicio: convocatoria.fecha_inicio_inscripciones || convocatoria.fechaInicio,
              fechaFin: convocatoria.fecha_fin_inscripciones || convocatoria.fechaFin,
              precioPorArea: convocatoria.costo_por_area || convocatoria.precioPorArea || 16,
              maxAreasEstudiante: convocatoria.maximo_areas || convocatoria.maxAreasEstudiante || 2,
              activa: convocatoria.activa !== undefined ? convocatoria.activa : true
            };
            console.log('Configuración adaptada:', config);
            resolve(config);
          } else {
            // Si no se encuentra la convocatoria, crear una por defecto
            console.log('Convocatoria no encontrada, creando una por defecto');
            const currentYear = new Date().getFullYear();
            const defaultConfig = {
              id: convocatoriaId || '1',
              nombre: `Olimpiadas Escolares ${currentYear}`,
              fechaInicio: new Date(currentYear, 4, 1).toISOString(),
              fechaFin: new Date(currentYear, 7, 31).toISOString(),
              precioPorArea: 16, // Precio establecido en la memoria del proyecto
              maxAreasEstudiante: 2, // Máximo de áreas por estudiante establecido en la memoria
              activa: true
            };
            console.log('Usando configuración por defecto:', defaultConfig);
            resolve(defaultConfig);
          }
        } catch (error) {
          console.error('Error al obtener la configuración de la convocatoria:', error);
          // Proporcionar una configuración de respaldo en caso de error
          const currentYear = new Date().getFullYear();
          const backupConfig = {
            id: convocatoriaId || 'backup',
            nombre: `Olimpiadas Escolares ${currentYear} (Configuración de respaldo)`,
            fechaInicio: new Date(currentYear, 4, 1).toISOString(),
            fechaFin: new Date(currentYear, 7, 31).toISOString(),
            precioPorArea: 16,
            maxAreasEstudiante: 2,
            activa: true
          };
          console.log('Usando configuración de respaldo debido a error:', backupConfig);
          resolve(backupConfig);
        }
      }, 300);
    });
  },
  
  // Actualizar el método para que acepte la convocatoria seleccionada
  updateStudentAreas: (studentId, areaIds, convocatoriaId) => {
    return inscribirEstudianteEnAreas(studentId, { areaIds, convocatoriaId });
  },
  
  // Función para crear nuevas áreas
  crearArea,
  
  // Servicios para convocatorias
  getAllConvocatorias,
  getConvocatoriasAbiertas,
  getConvocatoriaById,
  crearConvocatoria,
  actualizarConvocatoria,
  eliminarConvocatoria,
  actualizarAreasConvocatoria
};