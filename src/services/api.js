// Simulación de base de datos local en localStorage
const USERS_KEY = 'olimpiadas_users';
const STUDENTS_KEY = 'olimpiadas_students';
const COLLEGES_KEY = 'olimpiadas_colleges';
const OLYMPIAD_CONFIG_KEY = 'olimpiadas_config';
const AREAS_KEY = 'olimpiadas_areas';

// Inicializar colegios habilitados y configuración de olimpiadas
const initializeSystem = () => {
  initializeColleges();
  initializeOlympiadConfig();
  initializeAreas();
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

// Obtener todas las áreas
const getAreas = () => {
  const areas = localStorage.getItem(AREAS_KEY);
  return areas ? JSON.parse(areas) : [];
};

// Guardar áreas en localStorage
const saveAreas = (areas) => {
  localStorage.setItem(AREAS_KEY, JSON.stringify(areas));
};

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
const inscribirEstudianteEnAreas = (studentId, areas) => {
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
          reject({ message: `No puedes inscribirte en más de ${config.maxAreasEstudiante} áreas` });
          return;
        }
        
        // Obtener las áreas completas
        const allAreas = getAreas();
        const areasSeleccionadas = allAreas.filter(area => areas.includes(area.id));
        
        // Calcular el total a pagar
        const total = areasSeleccionadas.length * config.precioPorArea;
        
        // Crear un número de boleta único
        const boletaId = `BOL-${Date.now()}-${studentId.substr(0, 4)}`;
        
        // Simular envío de boleta por correo electrónico
        console.log(`[API] Enviando boleta de pago ${boletaId} por correo:`);
        console.log(`[API] - Estudiante: ${students[studentIndex].nombre} ${students[studentIndex].apellidos}`);
        console.log(`[API] - Email: ${students[studentIndex].email}`);
        console.log(`[API] - Áreas inscritas: ${areasSeleccionadas.map(a => a.nombre).join(', ')}`);
        console.log(`[API] - Total a pagar: $${total}`);
        
        // Actualizar áreas inscritas
        students[studentIndex].areasInscritas = areas;
        // Guardar información de la boleta
        students[studentIndex].boletaPago = {
          id: boletaId,
          fecha: new Date().toISOString(),
          total,
          pagado: false
        };
        
        saveStudents(students);
        
        resolve({
          ...students[studentIndex],
          boletaEnviada: true
        });
      } catch (error) {
        reject({ message: 'Error al inscribir en áreas', error });
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
        console.log("Actualizando áreas para estudiante:", studentId);
        console.log("Nuevas áreas seleccionadas:", areas);
        
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
        
        // Actualizar boletaPago si es necesario
        if (!students[studentIndex].boletaPago && areas.length > 0) {
          // Crear un número de boleta único para la siguiente vez que se genere una orden
          const boletaId = `BOL-${Date.now()}-${studentId.substr(0, 4)}`;
          students[studentIndex].boletaPendiente = {
            id: boletaId,
            areasPendientes: areas,
            fecha: new Date().toISOString(),
          };
        }
        
        // Guardar los cambios
        saveStudents(students);
        
        // Actualizar el usuario en localStorage si es el usuario actual
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          if (currentUser.id === studentId) {
            currentUser.areasInscritas = areas;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }
        }
        
        console.log("Áreas actualizadas correctamente:", areas);
        resolve(students[studentIndex]);
      } catch (error) {
        console.error("Error en updateStudentAreas:", error);
        reject({ message: 'Error al actualizar áreas del estudiante', error });
      }
    }, 800);
  });
};

// Obtener todas las áreas disponibles
const getAllAreas = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        initializeAreas(); // Asegurar que hay áreas
        const areas = getAreas();
        resolve(areas);
      } catch (error) {
        reject({ message: 'Error al obtener áreas académicas', error });
      }
    }, 300);
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

/**
 * Genera una nueva orden de pago
 * @param {Object} data Información para la orden de pago
 * @returns {Promise<Object>} Promesa con la información de la orden generada
 */
const generarOrdenPago = async (data) => {
  try {
    // En desarrollo, Vite redirigirá automáticamente a través del proxy configurado
    const response = await fetch('/api/ordenes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al generar la orden de pago');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en generarOrdenPago:', error);
    
    // Solo para desarrollo - Simular respuesta exitosa si el backend no está disponible
    if (import.meta.env.DEV && error.message.includes('Failed to fetch')) {
      console.warn('Backend no disponible, devolviendo datos simulados');
      return {
        success: true,
        mensaje: 'Orden de pago generada (SIMULADO)',
        orden: {
          id: 'ORD-' + Date.now(),
          monto: data.areas.length * 16,
          fecha_expiracion: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        }
      };
    }
    
    throw error;
  }
};

/**
 * Descarga el PDF de una orden de pago
 * @param {string} ordenId ID de la orden de pago
 * @returns {Promise<Blob>} Promesa con el blob del PDF
 */
const descargarOrdenPDF = async (ordenId) => {
  try {
    // En desarrollo, Vite redirigirá automáticamente a través del proxy configurado
    const response = await fetch(`/api/ordenes/${ordenId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al descargar el PDF');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error en descargarOrdenPDF:', error);
    
    // Solo para desarrollo - Simular respuesta exitosa si el backend no está disponible
    if (import.meta.env.DEV && error.message.includes('Failed to fetch')) {
      console.warn('Backend no disponible, generando PDF simulado');
      // Crear un blob simple para simular un PDF
      const pdfText = `Orden de Pago simulada ${ordenId}\nEste es un PDF simulado para desarrollo.`;
      return new Blob([pdfText], { type: 'application/pdf' });
    }
    
    throw error;
  }
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
  getAreas: getAllAreas,
  getOlympiadConfig: fetchOlympiadConfig,
  getOlympiadSettings,
  updateOlympiadSettings,
  getCurrentStudent,
  generarOrdenPago,
  descargarOrdenPDF,
}; 