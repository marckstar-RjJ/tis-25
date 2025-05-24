const API_URL = 'http://localhost:8080/api';

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
      telefono: colegio.telefono
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

// Crear un nuevo usuario (usando fetch a la API)
const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, { // Usar la ruta /register
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createUser:', error);
    throw new Error(`Error al crear usuario: ${error.message}`);
  }
};

// Obtener convocatorias disponibles
const getConvocatorias = async () => {
  try {
    console.log('Llamando a API para obtener convocatorias...');
    const response = await fetch(`${API_URL}/convocatorias-abiertas`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    console.log('Respuesta de convocatorias recibida:', response.status);
    
    if (!response.ok) {
      console.error('Error en respuesta de convocatorias:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al obtener convocatorias: ${response.status}`);
    }

    const data = await response.json();
    console.log('Datos de convocatorias recibidos:', data);
    
    if (!Array.isArray(data)) {
      console.error('Los datos recibidos no son un array:', data);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error en getConvocatorias:', error);
    throw new Error(`Error al obtener convocatorias: ${error.message}`);
  }
};

// Obtener información del estudiante actual
const getCurrentStudent = async () => {
  try {
    console.log('Intentando obtener perfil del estudiante actual...');
    
    // Intentar usar el usuario actual del localStorage si está disponible
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        console.log('Usuario actual encontrado en localStorage:', currentUser);
        
        // Si el usuario ya tiene los datos de curso y colegio, devolverlos directamente
        if (currentUser.curso !== undefined && (currentUser.colegio_id !== undefined || currentUser.colegio !== undefined)) {
          console.log('Usando datos de estudiante desde localStorage:', {
            curso: currentUser.curso,
            colegio_id: currentUser.colegio_id,
            colegio: currentUser.colegio
          });
          return currentUser;
        }
      } catch (parseError) {
        console.error('Error al parsear currentUser de localStorage:', parseError);
      }
    }
    
    // Si no hay datos en localStorage o no son completos, intentar obtenerlos de la API
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    console.log('Solicitando perfil de estudiante a la API...');
    const response = await fetch(`${API_URL}/student/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    console.log('Respuesta recibida:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en respuesta de perfil:', response.status, errorText);
      let errorMessage = 'Error al obtener perfil del estudiante';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {}
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Datos de perfil recibidos:', data);
    
    // Actualizar los datos en localStorage
    if (data && currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        const updatedUser = { ...currentUser, ...data };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        console.log('Datos de usuario actualizados en localStorage');
      } catch (e) {
        console.error('Error al actualizar localStorage:', e);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error en getCurrentStudent:', error);
    
    // Intentar usar el currentUser como fallback
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        console.log('Usando currentUser como fallback debido al error:', currentUser);
        return currentUser;
      } catch (e) {}
    }
    
    throw new Error(`Error al obtener perfil del estudiante: ${error.message}`);
  }
};

// Obtener un estudiante por su ID
const getStudentById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    // Intentar primero obtener el perfil actual si el ID coincide con el usuario actual
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.id === id) {
        console.log('Obteniendo perfil del estudiante actual');
        return await getCurrentStudent();
      }
    } catch (e) {
      console.error('Error al verificar usuario actual:', e);
    }

    // Si no es el usuario actual o hubo un error, obtener por ID
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
    console.error(`Error en getStudentById(${id}):`, error);
    throw new Error(`Error al obtener estudiante: ${error.message}`);
  }
};

// Obtener todas las convocatorias (admin y gestión de inscripciones)
const getAllConvocatorias = async () => {
  try {
    console.log('Llamando a API para obtener todas las convocatorias...');
    const response = await fetch(`${API_URL}/convocatorias`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    console.log('Respuesta de todas las convocatorias recibida:', response.status);
    
    if (!response.ok) {
      console.error('Error en respuesta de todas las convocatorias:', response.status, response.statusText);
      
      // Si el backend no responde correctamente, usar datos guardados en localStorage
      console.log('Intentando usar datos de convocatorias desde localStorage...');
      const convocatoriasKey = 'olimpiadas_convocatorias';
      const cachedConvocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
      
      if (cachedConvocatorias.length > 0) {
        console.log('Usando datos de convocatorias desde localStorage:', cachedConvocatorias.length, 'encontradas');
        return cachedConvocatorias;
      }
      
      // Si no hay datos en localStorage, lanzar error
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al obtener todas las convocatorias: ${response.status}`);
    }

    const data = await response.json();
    console.log('Datos de todas las convocatorias recibidos:', data);
    
    if (!Array.isArray(data)) {
      console.error('Los datos recibidos no son un array:', data);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error en getAllConvocatorias:', error);
    
    // Intentar devolver desde localStorage como fallback
    try {
      const convocatoriasKey = 'olimpiadas_convocatorias';
      const cachedConvocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
      
      if (cachedConvocatorias.length > 0) {
        console.log('Fallback: Usando datos de convocatorias desde localStorage:', cachedConvocatorias.length, 'encontradas');
        return cachedConvocatorias;
      }
    } catch (e) {
      console.error('Error al obtener convocatorias de localStorage:', e);
    }
    
    // Si todo falla, devolver un array vacío
    return [];
  }
};

// Obtener una convocatoria específica por ID
const getConvocatoriaById = async (id) => {
  try {
    console.log(`Llamando a API para obtener convocatoria con ID ${id}...`);
    const response = await fetch(`${API_URL}/convocatorias/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    if (!response.ok) {
      console.error(`Error en respuesta de convocatoria ${id}:`, response.status, response.statusText);
      
      // Si el backend no responde correctamente, buscar en localStorage
      console.log('Intentando encontrar convocatoria en localStorage...');
      const convocatoriasKey = 'olimpiadas_convocatorias';
      const cachedConvocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
      const cachedConvocatoria = cachedConvocatorias.find(c => c.id === id);
      
      if (cachedConvocatoria) {
        console.log('Convocatoria encontrada en localStorage:', cachedConvocatoria.nombre);
        return cachedConvocatoria;
      }
      
      // Si no se encuentra en localStorage, lanzar error
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al obtener convocatoria ${id}: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en getConvocatoriaById (${id}):`, error);
    
    // Intentar obtener desde localStorage como fallback
    try {
      const convocatoriasKey = 'olimpiadas_convocatorias';
      const cachedConvocatorias = JSON.parse(localStorage.getItem(convocatoriasKey) || '[]');
      const cachedConvocatoria = cachedConvocatorias.find(c => c.id === id);
      
      if (cachedConvocatoria) {
        console.log('Fallback: Usando convocatoria desde localStorage:', cachedConvocatoria.nombre);
        return cachedConvocatoria;
      }
    } catch (e) {
      console.error('Error al obtener convocatoria de localStorage:', e);
    }
    
    // Si no se encuentra, crear un objeto vacío
    return { id, nombre: 'Convocatoria no disponible', areas: [] };
  }
};

// Obtener todas las áreas académicas
const getAreas = async () => {
  try {
    console.log('Llamando a API para obtener áreas académicas...');
    const response = await fetch(`${API_URL}/areas`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    if (!response.ok) {
      console.error('Error en respuesta de áreas:', response.status, response.statusText);
      
      // Si falla la API, usar áreas predefinidas como fallback
      const areasDefault = [
        { id: "1", nombre: "Astronomía", descripcion: "Estudio del universo y los cuerpos celestes" },
        { id: "2", nombre: "Biología", descripcion: "Estudio de los seres vivos" },
        { id: "3", nombre: "Física", descripcion: "Estudio de la materia y la energía" },
        { id: "4", nombre: "Matemáticas", descripcion: "Estudio de números, estructuras y patrones" },
        { id: "5", nombre: "Informática", descripcion: "Estudio de la computación y programación" },
        { id: "6", nombre: "Robótica", descripcion: "Diseño y construcción de robots" },
        { id: "7", nombre: "Química", descripcion: "Estudio de la composición de la materia" }
      ];
      console.log('Usando áreas predefinidas como fallback');
      return areasDefault;
    }

    const data = await response.json();
    console.log('Datos de áreas recibidos:', data);
    
    if (!Array.isArray(data)) {
      console.error('Los datos de áreas recibidos no son un array:', data);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error en getAreas:', error);
    
    // Devolver áreas predefinidas como fallback
    const areasDefault = [
      { id: "1", nombre: "Astronomía", descripcion: "Estudio del universo y los cuerpos celestes" },
      { id: "2", nombre: "Biología", descripcion: "Estudio de los seres vivos" },
      { id: "3", nombre: "Física", descripcion: "Estudio de la materia y la energía" },
      { id: "4", nombre: "Matemáticas", descripcion: "Estudio de números, estructuras y patrones" },
      { id: "5", nombre: "Informática", descripcion: "Estudio de la computación y programación" },
      { id: "6", nombre: "Robótica", descripcion: "Diseño y construcción de robots" },
      { id: "7", nombre: "Química", descripcion: "Estudio de la composición de la materia" }
    ];
    console.log('Fallback: Usando áreas predefinidas');
    return areasDefault;
  }
};

// Exportar servicios
export const apiService = {
  getUsers,
  getStudents,
  getColleges,
  getAllColleges,
  login,
  logout,
  createUser,
  getConvocatorias,
  getCurrentStudent,
  getStudentById,
  // Nuevos métodos agregados
  getAllConvocatorias,
  getConvocatoriaById,
  getAreas,
};