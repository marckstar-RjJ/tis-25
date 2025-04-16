// Simulación de base de datos local en localStorage
const USERS_KEY = 'olimpiadas_users';
const STUDENTS_KEY = 'olimpiadas_students';

// Inicializar un estudiante por defecto si no existe
const initializeDefaultStudent = () => {
  const students = getStudents();
  if (students.length === 0) {
    const defaultStudent = {
      id: '1001',
      nombre: 'Juan',
      apellidos: 'Pérez Gómez',
      ci: '12345678',
      nacimiento: '2013-05-15', // 10 años
      correo: 'juan.perez@gmail.com',
      celular: '78901234',
      colegio: 'Instituto Educativo Modelo',
      curso: '5to de Primaria',
      tutor: {
        nombre: 'Carlos',
        apellidos: 'Pérez Martínez',
        ci: '87654321',
        celular: '76543210',
        correo: 'carlos.perez@gmail.com'
      },
      areasInscritas: [] // Inicialmente no está inscrito en ninguna área
    };
    
    students.push(defaultStudent);
    saveStudents(students);
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
        
        // Crear un nuevo usuario con ID único
        const newUser = {
          id: Date.now().toString(),
          ...userData,
          createdAt: new Date().toISOString()
        };
        
        // Guardar el usuario
        users.push(newUser);
        saveUsers(users);
        
        resolve(newUser);
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

// Obtener estudiante (simulado)
const getStudentById = (studentId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Asegurar que existe el estudiante predeterminado
        initializeDefaultStudent();
        
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

// Obtener estudiante actual (siempre retorna el primer estudiante para este ejemplo)
const getCurrentStudent = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Asegurar que existe el estudiante predeterminado
        initializeDefaultStudent();
        
        const students = getStudents();
        if (students.length > 0) {
          resolve(students[0]); // Retorna el primer estudiante
        } else {
          reject({ message: 'No hay estudiantes registrados' });
        }
      } catch (error) {
        reject({ message: 'Error al obtener estudiante actual', error });
      }
    }, 300);
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
        
        // Actualizar áreas inscritas
        students[studentIndex].areasInscritas = areas;
        saveStudents(students);
        
        resolve(students[studentIndex]);
      } catch (error) {
        reject({ message: 'Error al inscribir en áreas', error });
      }
    }, 800);
  });
};

export const apiService = {
  createUser,
  login,
  getUserById,
  getStudentById,
  getCurrentStudent,
  inscribirEstudianteEnAreas
}; 