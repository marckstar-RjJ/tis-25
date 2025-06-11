const API_URL = 'https://tis-25-backend.onrender.com/api';

// Obtener todos los usuarios
const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Obtener todos los estudiantes
const getStudents = async () => {
  try {
    const response = await fetch(`${API_URL}/students`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estudiantes');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Obtener todos los colegios
const getColleges = async () => {
  try {
    const response = await fetch(`${API_URL}/colegios`);

    if (!response.ok) {
      throw new Error('Error al obtener colegios');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getColleges:', error);
    throw new Error(error.message);
  }
};

// Obtener todas las áreas
const getAreas = async () => {
  try {
    const response = await fetch(`${API_URL}/areas`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener áreas');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Crear un nuevo usuario
const createUser = async (userData) => {
  try {
    console.log('Enviando datos de registro:', userData);
    
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    if (!response.ok) {
      console.error('Error en la respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        body: data // Log the full response body
      });
      // Throw a more informative error including specific backend errors if available
      const errorMessage = data.message || 'Error al crear usuario';
      if (data.errors) {
          // If backend returns validation errors, include them in the error message
          const validationErrors = Object.values(data.errors).flat().join(' ');
          throw new Error(`${errorMessage}: ${validationErrors}`);
      } else {
          throw new Error(errorMessage);
      }
    }

    return data;
  } catch (error) {
    console.error('Error en createUser catch:', error);
    // Re-throw the error to be caught by the handleSubmit function
    throw error;
  }
};

// Iniciar sesión
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
      throw new Error('Credenciales inválidas');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Obtener usuario por ID
const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuario');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Obtener estudiante por ID
const getStudentById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/students/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estudiante');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Registrar estudiante como tutor
const registerStudentByTutor = async (tutorId, studentData) => {
  try {
    const response = await fetch(`${API_URL}/tutors/${tutorId}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error('Error al registrar estudiante');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Obtener estudiantes por tutor
const getStudentsByTutor = async (tutorId) => {
  try {
    const response = await fetch(`${API_URL}/tutors/${tutorId}/students`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estudiantes del tutor');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Obtener todos los colegios disponibles
const getAllColleges = async () => {
  try {
    const response = await fetch(`${API_URL}/colleges`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener colegios');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Añadir un nuevo colegio (solo admin)
const addCollege = async (collegeData) => {
  try {
    console.log('Enviando datos del colegio:', collegeData);
    const response = await fetch(`${API_URL}/colegios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        nombre: collegeData.nombre,
        direccion: collegeData.direccion,
        telefono: collegeData.telefono
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en respuesta de addCollege:', errorData);
      throw new Error(errorData.message || 'Error al añadir colegio');
    }

    const data = await response.json();
    console.log('Respuesta exitosa de addCollege:', data);
    return data;
  } catch (error) {
    console.error('Error en addCollege:', error);
    throw error;
  }
};

// Inscribir estudiante en áreas
const inscribirEstudianteEnAreas = async (studentId, inscripcionData) => {
  try {
    const response = await fetch(`${API_URL}/students/${studentId}/areas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(inscripcionData),
    });

    if (!response.ok) {
      throw new Error('Error al inscribir estudiante en áreas');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Obtener áreas de un estudiante
const getStudentAreas = async (studentId) => {
  try {
    const response = await fetch(`${API_URL}/students/${studentId}/areas`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener áreas del estudiante');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Obtener todas las áreas disponibles para un estudiante
const getAreasForStudent = async (studentId) => {
  try {
    const response = await fetch(`${API_URL}/students/${studentId}/available-areas`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener áreas disponibles para el estudiante');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
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
  getStudentAreas,
  getAreasForStudent,
  getAreas,
  getStudents,
  getUsers,
  getColleges
}; 