import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';

// Crear contexto de autenticación
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un usuario en localStorage al iniciar
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error al verificar usuario:', error);
        localStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const user = await apiService.login(email, password);
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Obtener estudiantes asociados (para tutores)
  const getStudentsByTutor = async (tutorId) => {
    if (!currentUser || currentUser.tipoUsuario !== 'tutor') {
      throw new Error('Solo los tutores pueden acceder a esta función');
    }
    
    try {
      return await apiService.getStudentsByTutor(tutorId || currentUser.id);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    getStudentsByTutor
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 