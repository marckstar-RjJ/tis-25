const API_URL = 'http://localhost:8000/api';

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
    const response = await fetch(`${API_URL}/colegios`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error desconocido al obtener colegios');
    }

    const data = await response.json();
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

// Exportar servicios
export const apiService = {
  getUsers,
  getStudents,
  getColleges,
  getAllColleges,
  login,
  logout
}; 