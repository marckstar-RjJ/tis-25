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
    localStorage.setItem('token', data.token);
    const { password: _, ...userWithoutPassword } = data.user;
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
    const response = await fetch(`${API_URL}/convocatorias`, {
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
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_URL}/student/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener perfil del estudiante');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getCurrentStudent:', error);
    throw new Error(`Error al obtener perfil del estudiante: ${error.message}`);
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
  getCurrentStudent
}; 