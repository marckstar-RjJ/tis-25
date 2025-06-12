const API_URL = 'https://tis-25-backend.onrender.com/api';

// Métodos para recuperación de contraseña
export const checkUserEmail = async (email) => {
  try {
    const response = await fetch(`${API_URL}/forgot-password/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al verificar el correo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en checkUserEmail:', error);
    throw new Error(`Error al verificar el correo: ${error.message}`);
  }
};

export const generateResetToken = async (email) => {
  try {
    const response = await fetch(`${API_URL}/forgot-password/generate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al generar token de recuperación');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en generateResetToken:', error);
    throw new Error(`Error al generar token: ${error.message}`);
  }
};

export const getEmailFromToken = async (token) => {
  try {
    const response = await fetch(`${API_URL}/get-email-from-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();
    
    // Retornar el objeto completo para que el frontend pueda interpretar success y message
    return data;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw new Error('Error al comunicarse con el servidor');
  }
};

export const resetPassword = async (token, email, password) => {
  try {
    const response = await fetch(`${API_URL}/forgot-password/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, email, password, password_confirmation: password })
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al restablecer la contraseña');
      } catch {
        throw new Error('Error al procesar la solicitud');
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error en resetPassword:', error);
    throw new Error(`Error al restablecer la contraseña: ${error.message}`);
  }
};

// Obtener todos los usuarios (usando fetch a la API)
const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener usuarios');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getUsers:', error);
    throw new Error(`Error al obtener usuarios: ${error.message}`);
  }
};

// Obtener todos los estudiantes (usando fetch a la API)
const getStudents = async () => {
  try {
    const response = await fetch(`${API_URL}/students`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener estudiantes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getStudents:', error);
    throw new Error(`Error al obtener estudiantes: ${error.message}`);
  }
};

// Obtener todos los colegios (usando fetch a la API)
const getColleges = async () => {
  try {
    console.log('Llamando a API para obtener colegios...');
    const response = await fetch(`${API_URL}/colegios`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('Respuesta recibida:', response.status);
    
    if (!response.ok) {
      console.error('Error en respuesta de colegios:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al obtener colegios: ${response.status}`);
    }

    const data = await response.json();
    console.log('Datos de colegios recibidos:', data);
    
    if (!Array.isArray(data)) {
      console.error('Los datos recibidos no son un array:', data);
      return [];
    }
    
    return data.map(colegio => ({
      id: colegio.id,
      nombre: colegio.nombre,
      direccion: colegio.direccion,
      telefono: colegio.telefono,
      verification_code: colegio.verification_code
    }));
  } catch (error) {
    console.error('Error en getColleges:', error);
    throw new Error(`Error al obtener colegios: ${error.message}`);
  }
};

// Obtener todos los colegios (alias para mantener compatibilidad)
const getAllColleges = getColleges;

// Iniciar sesión (usando fetch a la API)
const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Credenciales inválidas');
    }

    const data = await response.json();
    
    // Verificar si hay token en la respuesta, si no, generamos uno (en el caso de este backend)
    if (data.token) {
      localStorage.setItem('token', data.token);
    } else {
      // Generar un token temporal si no viene en la respuesta
      // Esto es solo para mantener compatibilidad con el código existente
      const tempToken = `temp_${Date.now()}`;
      localStorage.setItem('token', tempToken);
    }
    
    // Combinar cuenta y perfil en un objeto de usuario
    let user;
    if (data.cuenta && data.perfil) {
      // Estructura con cuenta y perfil separados
      user = {
        ...data.cuenta,
        ...data.perfil
      };
    } else if (data.user) {
      // Estructura con user
      user = data.user;
    } else {
      // Si no hay una estructura esperada, usar toda la respuesta
      user = data;
    }
    
    // Eliminar el campo password por seguridad
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error en login:', error);
    throw new Error(`Error al iniciar sesión: ${error.message}`);
  }
};

// Cerrar sesión
const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }

    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

// Registrar usuario (para administradores o tutores)
const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al registrar usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en registerUser:', error);
    throw error;
  }
};

// Crear usuario (para administradores o tutores)
const createUser = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createUser:', error);
    throw error;
  }
};

// Obtener convocatorias desde el backend
const getConvocatorias = async () => {
  try {
    const response = await fetch(`${API_URL}/convocatorias`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener las convocatorias');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener convocatorias:', error);
    throw error;
  }
};

// Obtener datos del estudiante actual (usando el token)
const getCurrentStudent = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación disponible.');
    }

    const response = await fetch(`${API_URL}/user-student`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener datos del estudiante actual');
    }

    const data = await response.json();
    console.log("Datos del estudiante actual:", data);

    // Asegurarse de que `areas_inscritas` sea un array, incluso si viene null o indefinido
    if (data && data.areas_inscritas && typeof data.areas_inscritas === 'string') {
      try {
        data.areasInscritas = JSON.parse(data.areas_inscritas);
      } catch (parseError) {
        console.error('Error al parsear areas_inscritas:', parseError);
        data.areasInscritas = []; // Asignar un array vacío si hay un error de parseo
      }
    } else if (!data.areas_inscritas) {
      data.areasInscritas = []; // Si no existe o es null, inicializar como array vacío
    } else {
      data.areasInscritas = data.areas_inscritas; // Si ya es un array, usarlo directamente
    }
    
    // Mapear areas_inscritas a areasInscritas para compatibilidad
    if (data && data.areas_inscritas) {
      data.areasInscritas = data.areas_inscritas;
    } else {
      data.areasInscritas = [];
    }


    // Asegurarse de que `convocatorias_inscritas` sea un array de IDs
    if (data && data.convocatorias_inscritas && typeof data.convocatorias_inscritas === 'string') {
      try {
        data.convocatoriasInscritas = JSON.parse(data.convocatorias_inscritas);
      } catch (parseError) {
        console.error('Error al parsear convocatorias_inscritas:', parseError);
        data.convocatoriasInscritas = [];
      }
    } else if (!data.convocatorias_inscritas) {
      data.convocatoriasInscritas = [];
    } else {
      data.convocatoriasInscritas = data.convocatorias_inscritas;
    }


    return data;
  } catch (error) {
    console.error('Error en getCurrentStudent:', error);
    throw error;
  }
};

// Obtener un estudiante por ID
const getStudentById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/students/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al obtener estudiante con ID ${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en getStudentById (ID: ${id}):`, error);
    throw error;
  }
};

// Obtener todas las convocatorias (incluyendo las públicas y las gestionadas por el admin)
const getAllConvocatorias = async () => {
  try {
    const response = await fetch(`${API_URL}/convocatorias`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener todas las convocatorias');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getAllConvocatorias:', error);
    throw error;
  }
};

// Obtener una convocatoria por ID
const getConvocatoriaById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/convocatorias/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al obtener la convocatoria con ID ${id}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error en getConvocatoriaById (ID: ${id}):`, error);
    throw error;
  }
};

// Función para inscribir estudiante a un área
const inscribirEstudianteArea = async (studentId, areaId, convocatoriaId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/inscripciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ student_id: studentId, area_id: areaId, convocatoria_id: convocatoriaId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al inscribir estudiante en el área.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en inscribirEstudianteArea:', error);
    throw error;
  }
};

// Obtener todas las áreas
const getAreas = async () => {
  try {
    const response = await fetch(`${API_URL}/areas`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener las áreas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getAreas:', error);
    throw error;
  }
};

// Añadir un nuevo colegio
const addCollege = async (collegeData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/colegios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(collegeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al agregar colegio');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en addCollege:', error);
    throw error;
  }
};

// Eliminar un colegio por ID
const deleteCollege = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/colegios/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar colegio');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en deleteCollege:', error);
    throw error;
  }
};

// Verificar si un estudiante tiene una orden de pago activa
const tieneOrdenPagoActiva = async (studentId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ordenes-pago/activa/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      // Si la ruta no existe, o no se encuentra orden, asumimos que no hay orden activa
      return false;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al verificar orden de pago activa');
    }

    const data = await response.json();
    // Suponemos que el backend devuelve { activa: true } o { activa: false }
    return data.activa;
  } catch (error) {
    console.error('Error en tieneOrdenPagoActiva:', error);
    // Si hay un error de red o similar, asumimos que no hay orden activa para no bloquear la app
    return false;
  }
};


export const apiService = {
  checkUserEmail,
  generateResetToken,
  getEmailFromToken,
  resetPassword,
  getUsers,
  getStudents,
  getColleges,
  getAllColleges,
  login,
  logout,
  registerUser,
  createUser,
  getConvocatorias,
  getCurrentStudent,
  getStudentById,
  getAllConvocatorias,
  getConvocatoriaById,
  inscribirEstudianteArea,
  getAreas,
  addCollege,
  deleteCollege,
  tieneOrdenPagoActiva, // Exportar la función
};
